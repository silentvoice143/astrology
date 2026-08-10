import React, {useEffect, useRef, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  BackHandler,
  Animated,
  Easing,
  Image,
  TouchableOpacity,
} from 'react-native';

import {
  ZegoUIKitPrebuiltCall,
  ONE_ON_ONE_VIDEO_CALL_CONFIG,
  ONE_ON_ONE_VOICE_CALL_CONFIG,
} from '@zegocloud/zego-uikit-prebuilt-call-rn';

import {useNavigation, useRoute} from '@react-navigation/native';

import Toast from 'react-native-toast-message';

import {useAppSelector} from '../../hooks/redux-hook';

import {scale, verticalScale} from '../../utils/sizer';
import {colors} from '../../constants/colors';
import {
  startOutgoingRingtone,
  stopOutgoingRingtone,
} from '../../services/ringtone';

/* =========================================================
   ZEGO CONFIG
========================================================= */

const ZEGO_APP_ID = 1553526806;

const ZEGO_APP_SIGN =
  'b985f8cb84adfc6ddc1d056344e456aca54d35191a800fa5dab99e1f11304569';

/**
 * How long caller waits for another participant
 * before the call is automatically closed.
 *
 * 1 minute.
 */
const CALL_JOIN_TIMEOUT = 60_000;

/* =========================================================
   TYPES
========================================================= */

type CallType = 'AUDIO' | 'VIDEO';

interface PersonData {
  id: string;
  name: string;
  imageUri?: string;
}

interface CallScreenParams {
  /**
   * Backend call identifier.
   */
  callId: string;

  /**
   * Zego room ID.
   *
   * Caller + receiver MUST receive
   * exactly the same roomId.
   */
  roomId: string;

  /**
   * Backend session ID.
   *
   * Keeping this in params because you may
   * need it later for API/billing/history.
   *
   * It is NOT used for socket anymore.
   */
  sessionId?: string;

  callType: CallType;

  /**
   * Present on caller side.
   */
  astrologer?: PersonData;

  /**
   * Present on receiver side.
   */
  user?: PersonData;

  /**
   * false = caller/customer
   * true  = receiver/astrologer
   */
  isAstrologer: boolean;
}

/* =========================================================
   WAITING / RINGING OVERLAY
========================================================= */

interface WaitingOverlayProps {
  person?: PersonData;
  callType: CallType;
  onCancel: () => void;
}

const WaitingOverlay: React.FC<WaitingOverlayProps> = ({
  person,
  callType,
  onCancel,
}) => {
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makePulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );

    const anim1 = makePulse(pulse1, 0);
    const anim2 = makePulse(pulse2, 900);

    anim1.start();
    anim2.start();

    return () => {
      anim1.stop();
      anim2.stop();
    };
  }, [pulse1, pulse2]);

  const ringStyle = (value: Animated.Value) => ({
    opacity: value.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    }),
    transform: [
      {
        scale: value.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.6],
        }),
      },
    ],
  });

  return (
    <View style={styles.waitingOverlay}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryText}
      />

      <View style={styles.avatarWrapper}>
        <Animated.View style={[styles.pulseRing, ringStyle(pulse1)]} />
        <Animated.View style={[styles.pulseRing, ringStyle(pulse2)]} />

        {person?.imageUri ? (
          <Image source={{uri: person.imageUri}} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>
              {person?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.waitingName}>{person?.name || 'Connecting'}</Text>

      <Text style={styles.waitingStatus}>
        {callType === 'VIDEO' ? 'Ringing video call...' : 'Ringing...'}
      </Text>

      <TouchableOpacity
        style={styles.cancelButton}
        activeOpacity={0.8}
        onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const CallScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();

  const params = route.params as CallScreenParams;

  const {
    callId,
    roomId,
    sessionId,
    callType,
    astrologer,
    user: callerParam,
    isAstrologer = false,
  } = params || {};

  /* =======================================================
     CURRENT LOGGED-IN USER
  ======================================================= */

  /**
   * This must always represent the CURRENT device user.
   *
   * Caller device:
   * user = customer
   *
   * Receiver device:
   * user = astrologer
   */
  const {user} = useAppSelector(state => state.auth);

  /**
   * The OTHER participant we are waiting for / showing
   * on the waiting screen.
   *
   * Caller device (isAstrologer = false) waits for the astrologer.
   * Receiver device (isAstrologer = true) waits for the customer.
   */
  const remotePerson: PersonData | undefined = isAstrologer
    ? callerParam
    : astrologer;

  /* =======================================================
     STATE
  ======================================================= */

  /**
   * Only controls permission initialization.
   *
   * This is NOT waiting for the other participant.
   */
  const [ready, setReady] = useState(false);

  /**
   * Mirrors remoteUserJoinedRef but as state, so the
   * waiting overlay can re-render when it changes.
   */
  const [participantJoined, setParticipantJoined] = useState(false);

  const [timer, setTimer] = useState('00:00');

  /* =======================================================
     REFS
  ======================================================= */

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Auto-cancel timeout while only one person
   * is present in the room.
   */
  const noParticipantTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * True after remote participant joins.
   */
  const remoteUserJoinedRef = useRef(false);

  /**
   * True once the actual 1-to-1 call starts.
   */
  const callStartedRef = useRef(false);

  /**
   * Prevent duplicate navigation / cleanup.
   */
  const callEndedRef = useRef(false);

  /* =======================================================
     PERMISSIONS
  ======================================================= */

  const checkPermissions = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];

      if (callType === 'VIDEO') {
        permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
      }

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      const allGranted = Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED,
      );

      if (!allGranted) {
        Toast.show({
          type: 'error',
          text1: 'Permission Denied',
          text2:
            callType === 'VIDEO'
              ? 'Please grant microphone and camera permissions.'
              : 'Please grant microphone permission.',
        });

        return false;
      }

      return true;
    } catch (error) {
      console.log('Call permission error:', error);

      Toast.show({
        type: 'error',
        text1: 'Permission Error',
        text2: 'Unable to request call permissions.',
      });

      return false;
    }
  };

  /* =======================================================
     CALL TIMER
  ======================================================= */

  const startCallTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    const startedAt = Date.now();

    setTimer('00:00');

    timerIntervalRef.current = setInterval(() => {
      const difference = Math.floor((Date.now() - startedAt) / 1000);

      const minutes = Math.floor(difference / 60);

      const seconds = difference % 60;

      setTimer(
        `${minutes.toString().padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}`,
      );
    }, 1000);
  };

  const stopCallTimer = () => {
    if (!timerIntervalRef.current) {
      return;
    }

    clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = null;
  };

  /* =======================================================
     NO PARTICIPANT TIMEOUT
  ======================================================= */

  const clearNoParticipantTimeout = () => {
    if (!noParticipantTimeoutRef.current) {
      return;
    }

    clearTimeout(noParticipantTimeoutRef.current);

    noParticipantTimeoutRef.current = null;
  };

  const startNoParticipantTimeout = () => {
    clearNoParticipantTimeout();

    console.log(
      `⏳ Waiting ${
        CALL_JOIN_TIMEOUT / 1000
      } seconds for another participant...`,
    );

    noParticipantTimeoutRef.current = setTimeout(() => {
      /**
       * Nobody joined during timeout.
       */
      if (!remoteUserJoinedRef.current) {
        console.log('⏰ No participant joined. Cancelling call.');

        handleCallEnd('NO_PARTICIPANT');
      }
    }, CALL_JOIN_TIMEOUT);
  };

  /* =======================================================
     CLEANUP
  ======================================================= */

  const cleanupCall = () => {
    clearNoParticipantTimeout();
    stopCallTimer();
  };

  /* =======================================================
     END CALL
  ======================================================= */

  const handleCallEnd = (
    reason: 'USER_ENDED' | 'REMOTE_LEFT' | 'NO_PARTICIPANT' | 'ZEGO_ENDED',
  ) => {
    if (callEndedRef.current) {
      return;
    }

    callEndedRef.current = true;

    console.log('📴 Ending call:', {
      reason,
      callId,
      roomId,
      sessionId,
    });

    cleanupCall();

    /* =========================================
       TODO: CALL BACKEND API HERE
    ========================================= */

    /**
     * Later you can do:
     *
     * dispatch(
     *   cancelCall({
     *     callId,
     *     reason,
     *   }),
     * );
     *
     * Backend can then:
     *
     * - update call status
     * - notify receiver
     * - send CALL_CANCELLED FCM
     * - calculate billing
     */

    /* =========================================
       MESSAGE
    ========================================= */

    if (reason === 'NO_PARTICIPANT') {
      Toast.show({
        type: 'info',
        text1: 'No Answer',
        text2: 'The other person did not join the call.',
      });
    }

    if (reason === 'REMOTE_LEFT') {
      Toast.show({
        type: 'info',
        text1: 'Call Ended',
        text2: 'The other person left the call.',
      });
    }

    /* =========================================
       LEAVE SCREEN
    ========================================= */
    stopOutgoingRingtone();
    navigation.goBack();
  };

  /* =======================================================
     ZEGO CONFIG
  ======================================================= */

  const getZegoConfig = () => {
    const baseConfig =
      callType === 'VIDEO'
        ? ONE_ON_ONE_VIDEO_CALL_CONFIG
        : ONE_ON_ONE_VOICE_CALL_CONFIG;

    return {
      ...baseConfig,

      /* ===============================
         UI
      =============================== */

      topMenuBarConfig: {
        ...baseConfig.topMenuBarConfig,
        isVisible: false,
      },

      layoutConfig: {
        ...baseConfig.layoutConfig,
        showDuration: false,
      },

      /* ===============================
         MEDIA
      =============================== */

      turnOnCameraWhenJoining: callType === 'VIDEO',

      turnOnMicrophoneWhenJoining: true,

      useSpeakerWhenJoining: callType === 'VIDEO',

      /* ===============================
         LOCAL USER JOINED ROOM
      =============================== */

      onCallStart: () => {
        console.log('📞 Joined Zego room:', roomId);

        /**
         * At this point this device has entered
         * the room.
         *
         * Start waiting for the other person.
         * The waiting overlay is already visible
         * since `participantJoined` is still false.
         */
        startNoParticipantTimeout();
      },

      /* ===============================
         REMOTE USER JOINED
      =============================== */

      onUserJoin: (users: any[]) => {
        console.log('👤 Remote participant joined:', users);

        if (users.length === 0) {
          return;
        }

        remoteUserJoinedRef.current = true;

        /**
         * Someone joined.
         *
         * Don't auto-cancel anymore, and hide
         * the waiting/ringing overlay so the
         * actual call room becomes visible.
         */
        clearNoParticipantTimeout();
        stopOutgoingRingtone();
        setParticipantJoined(true);

        /**
         * Start call timer once.
         */
        if (!callStartedRef.current) {
          callStartedRef.current = true;

          console.log('🟢 Actual call started');

          startCallTimer();
        }
      },

      /* ===============================
         REMOTE USER LEFT
      =============================== */

      onUserLeave: (users: any[]) => {
        console.log('👤 Remote participant left:', users);

        /**
         * Important:
         *
         * We only auto-end here if another
         * participant had actually joined before.
         *
         * Otherwise caller entering an empty room
         * should not immediately close the call.
         */
        if (!callStartedRef.current) {
          return;
        }

        remoteUserJoinedRef.current = false;

        console.log('📴 Remote participant left the room.');

        /**
         * Small grace period.
         *
         * Useful for temporary network drops.
         */
        setTimeout(() => {
          if (!remoteUserJoinedRef.current) {
            handleCallEnd('REMOTE_LEFT');
          }
        }, 300);
      },

      /* ===============================
         ZEGO CALL ENDED
      =============================== */

      onCallEnd: (callID: string, reason: any, duration: number) => {
        console.log('📴 Zego call ended:', {
          callID,
          reason,
          duration,
        });

        handleCallEnd('ZEGO_ENDED');
      },

      /* ===============================
         ERROR
      =============================== */

      onError: (error: any) => {
        console.log('❌ Zego call error:', error);

        Toast.show({
          type: 'error',
          text1: 'Call Error',
          text2: error?.message || 'An error occurred during the call.',
        });
      },
    };
  };

  /* =======================================================
     INITIALIZE SCREEN
  ======================================================= */

  useEffect(() => {
    console.log('📞 CallScreen mounted:', {
      callId,
      roomId,
      sessionId,
      callType,
      isAstrologer,

      currentUser: {
        id: user?.id,
        name: user?.name,
      },

      caller: callerParam,
      astrologer,
    });

    const initializeCall = async () => {
      /* ===============================
         VALIDATE ROOM
      =============================== */

      if (!roomId) {
        Toast.show({
          type: 'error',
          text1: 'Call Failed',
          text2: 'Room ID is missing.',
        });

        navigation.goBack();

        return;
      }

      /* ===============================
         VALIDATE CURRENT USER
      =============================== */

      if (!user?.id) {
        Toast.show({
          type: 'error',
          text1: 'Call Failed',
          text2: 'Logged-in user information is missing.',
        });

        navigation.goBack();

        return;
      }

      /* ===============================
         PERMISSIONS
      =============================== */

      const hasPermissions = await checkPermissions();

      if (!hasPermissions) {
        navigation.goBack();

        return;
      }

      /**
       * Mount Zego.
       *
       * Once mounted, the current user
       * joins `roomId`.
       */
      setReady(true);
    };

    initializeCall();

    /* ===============================
       ANDROID BACK BUTTON
    =============================== */

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleCallEnd('USER_ENDED');

        return true;
      },
    );

    /* ===============================
       CLEANUP
    =============================== */

    return () => {
      console.log('🧹 Cleaning CallScreen');

      cleanupCall();

      backHandler.remove();
    };
  }, []);

  useEffect(() => {
    startOutgoingRingtone();
  }, []);

  useEffect(() => {
    if (participantJoined) {
      return;
    }

    const timeout = setTimeout(() => {
      if (!participantJoined) {
        handleCallEnd('NO_PARTICIPANT');
      }
    }, 60_000);

    return () => clearTimeout(timeout);
  }, [participantJoined]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (!ready) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.primaryText}
        />

        <ActivityIndicator size="large" color={colors.primary_surface} />

        <Text style={styles.loadingText}>Connecting...</Text>
      </View>
    );
  }

  /* =======================================================
     CALL SCREEN
  ======================================================= */

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryText}
      />

      <View style={styles.callContainer}>
        {/* =====================================
            TIMER
        ===================================== */}

        {callStartedRef.current && (
          <View style={styles.timerOverlay} pointerEvents="none">
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{timer}</Text>
            </View>
          </View>
        )}

        {/* =====================================
            ZEGO
        ===================================== */}

        <ZegoUIKitPrebuiltCall
          appID={ZEGO_APP_ID}
          appSign={ZEGO_APP_SIGN}
          /**
           * CURRENT logged-in user.
           *
           * Never use callerId/astrologerId
           * here unless that is actually the
           * currently logged-in user.
           */
          userID={String(user?.mobile)}
          userName={user?.name || 'User'}
          /**
           * Caller + receiver MUST receive
           * exactly the same roomId.
           */
          callID={roomId}
          config={getZegoConfig()}
        />

        {/* =====================================
            WAITING / RINGING OVERLAY

            Sits on top of the Zego view until the
            other participant joins the room. Zego
            keeps running underneath so the join
            event still fires while this is shown.
        ===================================== */}

        {!participantJoined && (
          <WaitingOverlay
            person={remotePerson}
            callType={callType}
            onCancel={() => handleCallEnd('USER_ENDED')}
          />
        )}
      </View>
    </View>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryText,
  },

  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryText,
  },

  loadingText: {
    color: '#FFFFFF',
    marginTop: verticalScale(15),
    fontSize: scale(16),
  },

  callContainer: {
    flex: 1,
    position: 'relative',
  },

  timerOverlay: {
    position: 'absolute',

    top: '5%',

    left: 0,
    right: 0,

    zIndex: 1000,

    alignItems: 'center',
  },

  timerContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',

    borderRadius: scale(20),

    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),

    elevation: 5,
  },

  timerText: {
    color: '#FFFFFF',

    fontSize: scale(18),

    fontWeight: '700',

    letterSpacing: 1,
  },

  /* ===============================
     WAITING OVERLAY
  =============================== */

  waitingOverlay: {
    ...StyleSheet.absoluteFillObject,

    zIndex: 2000,

    backgroundColor: colors.primaryText,

    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarWrapper: {
    width: scale(140),
    height: scale(140),

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: verticalScale(20),
  },

  pulseRing: {
    position: 'absolute',

    width: scale(140),
    height: scale(140),

    borderRadius: scale(70),

    borderWidth: 2,
    borderColor: colors.primary_surface,
  },

  avatarImage: {
    width: scale(110),
    height: scale(110),

    borderRadius: scale(55),

    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  avatarFallback: {
    width: scale(110),
    height: scale(110),

    borderRadius: scale(55),

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: colors.primary_surface,
  },

  avatarFallbackText: {
    color: '#FFFFFF',

    fontSize: scale(40),

    fontWeight: '700',
  },

  waitingName: {
    color: '#FFFFFF',

    fontSize: scale(22),

    fontWeight: '700',

    marginBottom: verticalScale(8),
  },

  waitingStatus: {
    color: 'rgba(255, 255, 255, 0.7)',

    fontSize: scale(15),

    marginBottom: verticalScale(60),
  },

  cancelButton: {
    position: 'absolute',

    bottom: verticalScale(50),

    width: scale(64),
    height: scale(64),

    borderRadius: scale(32),

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#E53935',

    elevation: 5,
  },

  cancelButtonText: {
    color: '#FFFFFF',

    fontSize: scale(13),

    fontWeight: '700',
  },
});

export default CallScreen;
