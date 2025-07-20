import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  BackHandler,
  Alert,
} from 'react-native';
import {
  ZegoUIKitPrebuiltCall,
  ONE_ON_ONE_VIDEO_CALL_CONFIG,
  ONE_ON_ONE_VOICE_CALL_CONFIG,
} from '@zegocloud/zego-uikit-prebuilt-call-rn';
import {useRoute, useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {useAppDispatch, useAppSelector} from '../../hooks/redux-hook';
import {useWebSocket} from '../../hooks/use-socket';
import {decodeMessageBody} from '../../utils/utils';
import {clearCallSession} from '../../store/reducer/session';
import Avatar from '../../components/avatar';
import {scale, verticalScale} from '../../utils/sizer';
import {colors} from '../../constants/colors';
import {textStyle} from '../../constants/text-style';

// ZegoCloud App credentials
const ZEGO_APP_ID = 1648384958;
const ZEGO_APP_SIGN =
  '6baacf543390ae6c21d16cc29579930e714655c0401d3bdd8337cb4bfd2998b3';

type CallType = 'VOICE' | 'VIDEO';
type CallState = 'waiting' | 'connecting' | 'connected' | 'ended' | 'rejected';

interface CallScreenParams {
  callType: CallType;
  astrologer: {id: string; name: string; imageUri?: string};
  user?: {id: string; name: string; imageUri?: string};
  duration: number;
  sessionId?: string;
  isAstrologer?: boolean;
}

interface CallSessionDetails {
  id: string;
  user: {id: string; name: string; imgUri?: string};
  astrologer: {id: string; name: string; imgUri?: string};
  startedAt: string;
  endedAt: string | null;
  status: 'ACTIVE' | 'ENDED';
  sessionType: 'VOICE' | 'VIDEO';
  totalMinutes: number;
  totalCost: number;
  agoraChannelName: string; // This will be used as callId for ZegoCloud
  agoraToken?: string;
  callId?: string; // New field for ZegoCloud callId
}

const CallScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const params = route.params as CallScreenParams;
  const {
    callType,
    astrologer,
    user: userParam,
    duration,
    sessionId,
    isAstrologer = false,
  } = params;
  const {user} = useAppSelector(state => state.auth);
  const callSession = useAppSelector(state => state.session.callSession);
  const {subscribe, send} = useWebSocket(user?.id || '');

  const [callState, setCallState] = useState<CallState>(
    isAstrologer ? 'connecting' : 'waiting',
  );
  const [waitingTime, setWaitingTime] = useState(0);
  const [timer, setTimer] = useState('00:00');
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isInCall, setIsInCall] = useState(false);

  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const waitingInterval = useRef<NodeJS.Timeout | null>(null);
  const socketUnsubscribe = useRef<(() => void) | null>(null);

  // Check permissions
  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
        if (callType === 'VIDEO') {
          permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
        }

        const granted = await PermissionsAndroid.requestMultiple(permissions);
        const allPermissionsGranted = Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED,
        );

        if (allPermissionsGranted) {
          setPermissionsGranted(true);
          console.log('✅ All permissions granted');
          return true;
        } else {
          Toast.show({
            type: 'error',
            text1: 'Permission Denied',
            text2: 'Please grant microphone and camera permissions.',
          });
          return false;
        }
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    } else {
      // For iOS, permissions are handled automatically by the SDK
      setPermissionsGranted(true);
      return true;
    }
  };

  // Waiting Timer
  const startWaitingTimer = () => {
    waitingInterval.current = setInterval(() => {
      setWaitingTime(prev => {
        const newTime = prev + 1;
        if (newTime >= 120) {
          handleCallTimeout();
        }
        return newTime;
      });
    }, 1000);
  };

  const stopWaitingTimer = () => {
    if (waitingInterval.current) {
      clearInterval(waitingInterval.current);
      waitingInterval.current = null;
    }
  };

  const formatWaitingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Socket Listeners
  const setupSocketListeners = () => {
    console.log(
      '🔌 Setting up socket listeners for session:',
      callSession?.id || sessionId,
    );

    const timerSub = subscribe(
      `/topic/call/${callSession?.id || sessionId}/timer`,
      msg => {
        try {
          const timeData = decodeMessageBody(msg);
          console.log('⏱️ Timer update:', timeData);
          setTimer(timeData);
        } catch (err) {
          console.error('Timer message parse error:', err);
        }
      },
    );

    const endSub = subscribe(
      `/topic/call/${callSession?.id || sessionId}`,
      msg => {
        try {
          const data = JSON.parse(decodeMessageBody(msg));
          console.log('📞 Call status update:', data);
          if (data.status === 'ended') {
            handleCallEnd(false);
          }
        } catch (err) {
          console.error('Call end message parse error:', err);
        }
      },
    );

    const rejectSub = subscribe(`/topic/call/${user?.id}/rejected`, msg => {
      try {
        const data = JSON.parse(decodeMessageBody(msg));
        console.log('❌ Call rejected:', data);
        setCallState('rejected');
        setTimeout(() => {
          navigation.goBack();
          Toast.show({
            type: 'error',
            text1: 'Call Rejected',
            text2: 'The astrologer is currently unavailable',
          });
        }, 2000);
      } catch (err) {
        console.error('Call rejection parse error:', err);
      }
    });

    // Return cleanup function
    return () => {
      console.log('🧹 Cleaning up socket listeners');
      timerSub?.unsubscribe();
      endSub?.unsubscribe();
      rejectSub?.unsubscribe();
    };
  };

  // Call Timeout & Cancel
  const handleCallTimeout = () => {
    console.log('⏰ Call timeout');
    setCallState('ended');
    stopWaitingTimer();
    Toast.show({
      type: 'error',
      text1: 'Call Timeout',
      text2: 'The astrologer did not respond',
    });
    setTimeout(() => navigation.goBack(), 2000);
  };

  const handleCallCancel = () => {
    console.log('🚫 Call cancelled by user');
    setCallState('ended');
    stopWaitingTimer();
    dispatch(clearCallSession());
    navigation.goBack();
  };

  // Timer Management
  const startLocalTimer = () => {
    console.log('⏱️ Starting local timer');
    if (timerInterval.current) clearInterval(timerInterval.current);
    timerInterval.current = setInterval(() => {
      if (callStartTime) {
        const now = new Date();
        const diff = Math.floor(
          (now.getTime() - callStartTime.getTime()) / 1000,
        );
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        const localTimer = `${minutes.toString().padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}`;
        if (!timer || timer === '00:00') {
          setTimer(localTimer);
        }
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  };

  // Call End Handler
  const handleCallEnd = async (userInitiated = true) => {
    if (callState === 'ended') return;

    console.log('📱 Ending call, user initiated:', userInitiated);
    setCallState('ended');
    setIsInCall(false);
    stopTimer();
    stopWaitingTimer();

    let actualDuration = 0;
    if (callStartTime) {
      actualDuration = Math.floor(
        (new Date().getTime() - callStartTime.getTime()) / 1000,
      );
    }

    // Send call end message if user initiated
    if (userInitiated && callSession) {
      try {
        send(`/app/call/${callSession.id}/end`, {});
      } catch (error) {
        console.error('Error sending call end message:', error);
      }
    }

    dispatch(clearCallSession());

    // Cleanup socket listeners
    if (socketUnsubscribe.current) {
      socketUnsubscribe.current();
    }

    setTimeout(() => {
      navigation.goBack();
      Toast.show({
        type: 'success',
        text1: 'Call Ended',
        text2: actualDuration > 0 ? `Duration: ${timer}` : 'Call completed',
      });
    }, 1000);
  };

  // Join Call
  const joinCall = async () => {
    console.log('🚀 Attempting to join call');
    if (!permissionsGranted) {
      const hasPermissions = await checkPermissions();
      if (!hasPermissions) {
        navigation.goBack();
        return;
      }
    }

    if (!callSession) {
      console.log('⚠️ No call session data available');
      Toast.show({
        type: 'error',
        text1: 'Call Failed',
        text2: 'No call session data available',
      });
      return;
    }

    setCallState('connecting');
    stopWaitingTimer();

    // Start call timer when joining
    setCallStartTime(new Date());
    startLocalTimer();

    setIsInCall(true);
    console.log('✅ Joined call successfully');
  };

  // Helper Functions
  const getOtherPersonData = () => {
    if (!callSession) {
      if (isAstrologer) {
        return {name: userParam?.name || 'User', imageUri: userParam?.imageUri};
      } else {
        return {name: astrologer.name, imageUri: astrologer.imageUri};
      }
    }
    const otherPerson = isAstrologer
      ? callSession.user
      : callSession.astrologer;
    return {name: otherPerson.name, imageUri: otherPerson.imgUri};
  };

  const getCallId = () => {
    if (callSession) {
      // Use callId field if available, otherwise fallback to agoraChannelName
      return callSession.agoraChannelName;
    }
    return sessionId || '';
  };

  const getUserId = () => {
    return user?.id || '';
  };

  const getUserName = () => {
    return user?.name || 'User';
  };

  // ZegoCloud Configuration
  const getZegoConfig = () => {
    const baseConfig =
      callType === 'VIDEO'
        ? ONE_ON_ONE_VIDEO_CALL_CONFIG
        : ONE_ON_ONE_VOICE_CALL_CONFIG;

    return {
      ...baseConfig,
      onCallEnd: (callId: string, reason: any, duration: number) => {
        console.log('📞 ZegoCloud call ended:', {callId, reason, duration});
        handleCallEnd(true);
      },
      onCallStart: () => {
        console.log('📞 ZegoCloud call started');
        setCallState('connected');
      },
      onUserJoin: (users: any[]) => {
        console.log('👥 Users joined:', users);
        if (users.length > 0 && !callStartTime) {
          setCallStartTime(new Date());
          startLocalTimer();
        }
      },
      onUserLeave: (users: any[]) => {
        console.log('👥 Users left:', users);
      },
      onError: (error: any) => {
        console.error('❌ ZegoCloud error:', error);
        Toast.show({
          type: 'error',
          text1: 'Call Error',
          text2: 'An error occurred during the call',
        });
      },
    };
  };

  // Render Functions
  const renderWaitingScreen = () => {
    const otherPerson = getOtherPersonData();
    return (
      <View style={styles.waitingContainer}>
        <Avatar
          image={otherPerson.imageUri ? {uri: otherPerson.imageUri} : undefined}
          fallbackText={otherPerson.name.charAt(0)}
          size={scale(120)}
          borderColor={colors.primary_surface}
          borderWidth={3}
        />
        <Text style={[textStyle.fs_mont_24_700, styles.astrologerName]}>
          {otherPerson.name}
        </Text>
        <Text style={[textStyle.fs_mont_16_400, styles.waitingText]}>
          {isAstrologer
            ? 'Connecting to user...'
            : 'Waiting for astrologer to accept...'}
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary_surface} />
        </View>
        {!isAstrologer && (
          <>
            <Text style={[textStyle.fs_mont_14_400, styles.waitingTimeText]}>
              Waiting: {formatWaitingTime(waitingTime)}
            </Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCallCancel}>
              <Text style={[textStyle.fs_mont_16_600, styles.cancelButtonText]}>
                Cancel Call
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  const renderConnectingScreen = () => {
    const otherPerson = getOtherPersonData();
    return (
      <View style={styles.waitingContainer}>
        <Avatar
          image={otherPerson.imageUri ? {uri: otherPerson.imageUri} : undefined}
          fallbackText={otherPerson.name.charAt(0)}
          size={scale(120)}
          borderColor={colors.success.base}
          borderWidth={3}
        />
        <Text style={[textStyle.fs_mont_24_700, styles.astrologerName]}>
          {otherPerson.name}
        </Text>
        <Text style={[textStyle.fs_mont_16_400, styles.waitingText]}>
          Connecting to call...
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.success.base} />
        </View>
        <TouchableOpacity style={styles.joinButton} onPress={joinCall}>
          <Text style={[textStyle.fs_mont_16_600, styles.joinButtonText]}>
            Join Call
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRejectedScreen = () => {
    const otherPerson = getOtherPersonData();
    return (
      <View style={styles.waitingContainer}>
        <Avatar
          image={otherPerson.imageUri ? {uri: otherPerson.imageUri} : undefined}
          fallbackText={otherPerson.name.charAt(0)}
          size={scale(120)}
          borderColor={colors.error.base}
          borderWidth={3}
        />
        <Text style={[textStyle.fs_mont_24_700, styles.astrologerName]}>
          {otherPerson.name}
        </Text>
        <Text style={[textStyle.fs_mont_16_400, styles.rejectedText]}>
          Call was declined
        </Text>
        <Text style={[textStyle.fs_mont_14_400, styles.rejectedSubText]}>
          The astrologer is currently unavailable
        </Text>
      </View>
    );
  };

  const renderZegoCall = () => {
    const callId = getCallId();
    const userId = getUserId();
    const userName = getUserName();

    console.log('🎥 Rendering ZegoCloud call with:', {
      callId,
      userId,
      userName,
    });

    if (!callId || !userId || !userName) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Missing call configuration</Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCallEnd(true)}>
            <Text style={styles.cancelButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.callContainer}>
        <ZegoUIKitPrebuiltCall
          appID={ZEGO_APP_ID}
          appSign={ZEGO_APP_SIGN}
          userID={userId}
          userName={userName}
          callID={callId}
          config={getZegoConfig()}
        />
      </View>
    );
  };

  // Initialize on mount
  useEffect(() => {
    console.log('🚀 Component mounted with params:', params);

    const initializeCall = async () => {
      // Check permissions
      await checkPermissions();

      // Setup socket listeners
      socketUnsubscribe.current = setupSocketListeners();

      // Start waiting timer if not astrologer
      if (!isAstrologer) {
        startWaitingTimer();
      }
    };

    initializeCall();

    // Handle hardware back button
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleCallCancel();
        return true;
      },
    );

    return () => {
      console.log('🧹 Component cleanup');
      stopTimer();
      stopWaitingTimer();
      if (socketUnsubscribe.current) {
        socketUnsubscribe.current();
      }
      backHandler.remove();
    };
  }, []);

  // Handle session data changes
  useEffect(() => {
    console.log('🔍 callSession updated:', callSession);
    if (callSession && permissionsGranted) {
      console.log(
        '📞 Session data available, transitioning to connecting state',
      );
      setCallState('connecting');
      stopWaitingTimer();
    } else if (!callSession) {
      console.log('⚠️ No callSession data yet');
    }
  }, [callSession, permissionsGranted]);

  // Main render
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryText}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[textStyle.fs_mont_18_600, styles.headerText]}>
          {callType === 'VIDEO' ? 'Video Call' : 'Voice Call'}
        </Text>
        {(callState === 'connected' || isInCall) && (
          <Text style={[textStyle.fs_mont_16_400, styles.timerText]}>
            {timer}
          </Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {!isInCall && callState === 'waiting' && renderWaitingScreen()}
        {!isInCall && callState === 'connecting' && renderConnectingScreen()}
        {!isInCall && callState === 'rejected' && renderRejectedScreen()}
        {isInCall && renderZegoCall()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryText,
  },
  header: {
    paddingTop: verticalScale(20),
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(20),
    alignItems: 'center',
    backgroundColor: colors.primaryText,
  },
  headerText: {
    color: colors.whiteText,
    marginBottom: verticalScale(8),
  },
  timerText: {
    color: colors.success.base,
    fontSize: scale(18),
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  waitingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: scale(40),
  },
  astrologerName: {
    color: colors.whiteText,
    marginTop: verticalScale(20),
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  waitingText: {
    color: colors.grey300,
    textAlign: 'center',
    marginBottom: verticalScale(30),
  },
  loadingContainer: {
    marginBottom: verticalScale(20),
  },
  waitingTimeText: {
    color: colors.primary_surface,
    textAlign: 'center',
    marginBottom: verticalScale(40),
  },
  cancelButton: {
    backgroundColor: colors.error.base,
    paddingHorizontal: scale(40),
    paddingVertical: verticalScale(12),
    borderRadius: scale(25),
  },
  cancelButtonText: {
    color: colors.whiteText,
  },
  joinButton: {
    backgroundColor: colors.success.base,
    paddingHorizontal: scale(40),
    paddingVertical: verticalScale(12),
    borderRadius: scale(25),
    marginTop: verticalScale(20),
  },
  joinButtonText: {
    color: colors.whiteText,
  },
  rejectedText: {
    color: colors.error.base,
    textAlign: 'center',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(10),
  },
  rejectedSubText: {
    color: colors.grey300,
    textAlign: 'center',
  },
  callContainer: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(40),
  },
  errorText: {
    color: colors.error.base,
    fontSize: scale(16),
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
});

export default CallScreen;
