import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
  ChannelProfileType,
  ClientRoleType,
} from 'react-native-agora';
import { useRoute, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hook';
import { useWebSocket } from '../../hooks/use-socket';
import { decodeMessageBody } from '../../utils/utils';
import { clearCallSession } from '../../store/reducer/session';
import Avatar from '../../components/avatar';
import { scale, verticalScale } from '../../utils/sizer';
import { colors } from '../../constants/colors';
import { textStyle } from '../../constants/text-style';
import { BackHandler } from 'react-native';

const AGORA_APP_ID = 'f9093c98d1fe45cf85db5ef91a0cce33';

type CallType = 'VOICE' | 'VIDEO';
type CallState = 'waiting' | 'connecting' | 'connected' | 'ended' | 'rejected';

interface CallScreenParams {
  callType: CallType;
  astrologer: { id: string; name: string; imageUri?: string };
  user?: { id: string; name: string; imageUri?: string };
  duration: number;
  sessionId?: string;
  isAstrologer?: boolean;
}

interface CallSessionDetails {
  id: string;
  user: { id: string; name: string; imgUri?: string };
  astrologer: { id: string; name: string; imgUri?: string };
  startedAt: string;
  endedAt: string | null;
  status: 'ACTIVE' | 'ENDED';
  sessionType: 'VOICE' | 'VIDEO';
  totalMinutes: number;
  totalCost: number;
  agoraChannelName: string;
  agoraToken?: string;
}

const CallScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const params = route.params as CallScreenParams;
  const { callType, astrologer, user: userParam, duration, sessionId, isAstrologer = false } = params;
  const { user } = useAppSelector(state => state.auth);
  const callSession = useAppSelector(state => state.session.callSession);
  const { subscribe, send } = useWebSocket(user?.id || '');

  const [callState, setCallState] = useState<CallState>(isAstrologer ? 'connecting' : 'waiting');
  const [waitingTime, setWaitingTime] = useState(0);
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'VIDEO');
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(callType === 'VIDEO');
  const [timer, setTimer] = useState('00:00');
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [networkConnected, setNetworkConnected] = useState(true);

  const engineRef = useRef<IRtcEngine | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const waitingInterval = useRef<NodeJS.Timeout | null>(null);

  // Check permissions
  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      const permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
      if (callType === 'VIDEO') permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
      const results = await PermissionsAndroid.requestMultiple(permissions);
      const granted = Object.values(results).every(status => status === 'granted');
      if (!granted) {
        Toast.show({
          type: 'error',
          text1: 'Permission Denied',
          text2: 'Please grant microphone and camera permissions.',
        });
        return false;
      }
      return true;
    }
    return true;
  };

  // Setup Agora Engine
  const setupAgoraEngine = async () => {
    try {
      console.log('🚀 Initializing Agora engine...');
      const hasPermissions = await checkPermissions();
      if (!hasPermissions) {
        navigation.goBack();
        return;
      }

      const engine = createAgoraRtcEngine();
      engineRef.current = engine;
      console.log('✅ Agora engine created');

      engine.registerEventHandler({
        onJoinChannelSuccess: (connection, elapsed) => {
          console.log('✅ Joined channel:', connection.channelId, 'Elapsed:', elapsed);
          setIsJoined(true);
          setCallState('connected');
        },
        onUserJoined: (connection, remoteUid, elapsed) => {
          console.log('✅ Remote user joined:', remoteUid, 'Elapsed:', elapsed);
          setRemoteUid(remoteUid);
          if (!callStartTime) {
            setCallStartTime(new Date());
            startLocalTimer();
          }
        },
        onUserOffline: (connection, remoteUid, reason) => {
          console.log('❌ Remote user offline:', remoteUid, 'Reason:', reason);
          setRemoteUid(null);
          setTimeout(() => {
            if (callState !== 'ended') handleCallEnd(false);
          }, 5000);
        },
        onError: (err, msg) => {
          console.error('❌ Agora error:', err, msg);
          Toast.show({ type: 'error', text1: 'Call Error', text2: `Error: ${msg} (${err})` });
        },
        onTokenPrivilegeWillExpire: () => {
          console.log('⚠️ Token will expire soon');
          Toast.show({ type: 'warning', text1: 'Token Expiring', text2: 'Token will expire soon' });
        },
        onRequestToken: () => {
          console.log('⚠️ Token expired');
          Toast.show({ type: 'error', text1: 'Token Expired', text2: 'Please reconnect' });
          handleCallEnd(false);
        },
        onConnectionStateChanged: (connection, state, reason) => {
          console.log('🔄 Connection state:', state, 'Reason:', reason);
        },
        onNetworkQuality: (connection, localQuality, remoteQuality) => {
          console.log('🌐 Network quality - Local:', localQuality, 'Remote:', remoteQuality);
          setNetworkConnected(localQuality < 4 && remoteQuality < 4);
        },
      });

      engine.initialize({ appId: AGORA_APP_ID });
      console.log('✅ Agora engine initialized');

      engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
      if (callType === 'VIDEO') {
        engine.enableVideo();
        engine.startPreview();
      }
    } catch (e) {
      console.error('❌ Agora setup error:', e);
      Toast.show({ type: 'error', text1: 'Setup Failed', text2: 'Failed to initialize call' });
      navigation.goBack();
    }
  };

  // Join Channel
  const joinChannel = async (sessionData: CallSessionDetails) => {
    try {
      console.log('🔗 Joining channel:', sessionData.agoraChannelName, 'Token:', sessionData.agoraToken);
      if (!engineRef.current) {
        console.error('❌ Engine not initialized');
        Toast.show({ type: 'error', text1: 'Call Failed', text2: 'Engine not initialized' });
        return;
      }

      const token = sessionData.agoraToken && sessionData.agoraToken.trim() !== '' ? sessionData.agoraToken : null;
      console.log('🔑 Using token:', token ? 'Valid token' : 'No token');

      engineRef.current.joinChannel(
        token,
        sessionData.agoraChannelName,
        null,
        { clientRoleType: ClientRoleType.ClientRoleBroadcaster }
      );
      console.log('✅ Join channel initiated');
    } catch (error) {
      console.error('❌ Join channel error:', error);
      Toast.show({ type: 'error', text1: 'Call Failed', text2: 'Unable to join call' });
      setCallState('rejected');
      navigation.goBack();
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Socket Listeners
  const setupLocalSocketListeners = () => {
    const timerSub = subscribe(`/topic/call/${callSession?.id || sessionId}/timer`, msg => {
      try {
        const timeData = decodeMessageBody(msg);
        setTimer(timeData);
      } catch (err) {
        console.error('Timer message parse error:', err);
      }
    });

    const endSub = subscribe(`/topic/call/${callSession?.id || sessionId}`, msg => {
      try {
        const data = JSON.parse(decodeMessageBody(msg));
        if (data.status === 'ended') {
          handleCallEnd(false);
        }
      } catch (err) {
        console.error('Call end message parse error:', err);
      }
    });

    const rejectSub = subscribe(`/topic/call/${user?.id}/rejected`, msg => {
      try {
        const data = JSON.parse(decodeMessageBody(msg));
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

    return () => {
      timerSub?.unsubscribe();
      endSub?.unsubscribe();
      rejectSub?.unsubscribe();
    };
  };

  // Call Timeout & Cancel
  const handleCallTimeout = () => {
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
    
    dispatch(clearCallSession());
    navigation.goBack();
  };

  // Timer Management
  const startLocalTimer = () => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    timerInterval.current = setInterval(() => {
      if (callStartTime) {
        const now = new Date();
        const diff = Math.floor((now.getTime() - callStartTime.getTime()) / 1000);
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        const localTimer = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        if (!timer || timer === '00:00') setTimer(localTimer);
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  };

  // Control Functions
  const toggleMute = () => {
    if (!engineRef.current) return;
    try {
      engineRef.current.enableLocalAudio(!isMuted);
      console.log(isMuted ? 'Unmuted' : 'Muted');
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Toggle mute error:', error);
    }
  };

  const toggleVideo = () => {
    if (!engineRef.current || callType !== 'VIDEO') return;
    try {
      if (isVideoEnabled) {
        engineRef.current.stopPreview();
        engineRef.current.disableVideo();
      } else {
        engineRef.current.enableVideo();
        engineRef.current.startPreview();
      }
      console.log(isVideoEnabled ? 'Camera hidden' : 'Camera shown');
      setIsVideoEnabled(!isVideoEnabled);
    } catch (error) {
      console.error('Toggle video error:', error);
    }
  };

  const toggleSpeaker = () => {
    if (!engineRef.current) return;
    try {
      engineRef.current.setEnableSpeakerphone(!isSpeakerEnabled);
      console.log(isSpeakerEnabled ? 'Speaker disabled' : 'Speaker enabled');
      setIsSpeakerEnabled(!isSpeakerEnabled);
    } catch (error) {
      console.error('Toggle speaker error:', error);
    }
  };

  const switchCamera = async () => {
    if (!engineRef.current || callType !== 'VIDEO') return;
    try {
      await engineRef.current.switchCamera();
      console.log('Camera switched');
    } catch (error) {
      console.error('Switch camera error:', error);
    }
  };

  const handleCallEnd = async (userInitiated = true) => {
    if (callState === 'ended') return;
    setCallState('ended');
    stopTimer();
    stopWaitingTimer();

    let actualDuration = 0;
    if (callStartTime) {
      actualDuration = Math.floor((new Date().getTime() - callStartTime.getTime()) / 1000);
    }

    
    dispatch(clearCallSession());
    await cleanup();
    navigation.goBack();

    Toast.show({
      type: 'success',
      text1: 'Call Ended',
      text2: actualDuration > 0 ? `Duration: ${timer}` : 'Call completed',
    });
  };

  const cleanup = async () => {
    try {
      stopTimer();
      stopWaitingTimer();
      if (engineRef.current) {
        if (callType === 'VIDEO') await engineRef.current.stopPreview();
        await engineRef.current.leaveChannel();
        engineRef.current.unregisterEventHandler();
        engineRef.current.release();
        engineRef.current = null;
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  // Helper Functions
  const getOtherPersonData = () => {
    if (!callSession) {
      if (isAstrologer) {
        return { name: userParam?.name || 'User', imageUri: userParam?.imageUri };
      } else {
        return { name: astrologer.name, imageUri: astrologer.imageUri };
      }
    }
    const otherPerson = isAstrologer ? callSession.user : callSession.astrologer;
    return { name: otherPerson.name, imageUri: otherPerson.imgUri };
  };

  // Render Functions
  const renderWaitingScreen = () => {
    const otherPerson = getOtherPersonData();
    return (
      <View style={styles.waitingContainer}>
        <Avatar
          image={otherPerson.imageUri ? { uri: otherPerson.imageUri } : undefined}
          fallbackText={otherPerson.name.charAt(0)}
          size={scale(120)}
          borderColor={colors.primary_surface}
          borderWidth={3}
        />
        <Text style={[textStyle.fs_mont_24_700, styles.astrologerName]}>{otherPerson.name}</Text>
        <Text style={[textStyle.fs_mont_16_400, styles.waitingText]}>
          {isAstrologer ? 'Connecting to user...' : 'Waiting for astrologer to accept...'}
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary_surface} />
        </View>
        {!isAstrologer && (
          <>
            <Text style={[textStyle.fs_mont_14_400, styles.waitingTimeText]}>
              Waiting: {formatWaitingTime(waitingTime)}
            </Text>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCallCancel}>
              <Text style={[textStyle.fs_mont_16_600, styles.cancelButtonText]}>Cancel Call</Text>
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
          image={otherPerson.imageUri ? { uri: otherPerson.imageUri } : undefined}
          fallbackText={otherPerson.name.charAt(0)}
          size={scale(120)}
          borderColor={colors.success.base}
          borderWidth={3}
        />
        <Text style={[textStyle.fs_mont_24_700, styles.astrologerName]}>{otherPerson.name}</Text>
        <Text style={[textStyle.fs_mont_16_400, styles.waitingText]}>Connecting to call...</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.success.base} />
        </View>
      </View>
    );
  };

  const renderRejectedScreen = () => {
    const otherPerson = getOtherPersonData();
    return (
      <View style={styles.waitingContainer}>
        <Avatar
          image={otherPerson.imageUri ? { uri: otherPerson.imageUri } : undefined}
          fallbackText={otherPerson.name.charAt(0)}
          size={scale(120)}
          borderColor={colors.error.base}
          borderWidth={3}
        />
        <Text style={[textStyle.fs_mont_24_700, styles.astrologerName]}>{otherPerson.name}</Text>
        <Text style={[textStyle.fs_mont_16_400, styles.rejectedText]}>Call was declined</Text>
        <Text style={[textStyle.fs_mont_14_400, styles.rejectedSubText]}>
          The astrologer is currently unavailable
        </Text>
      </View>
    );
  };

  const renderConnectedCall = () => {
    const otherPerson = getOtherPersonData();
    if (callType === 'VIDEO') {
      return (
        <View style={styles.videoContainer}>
          {remoteUid ? (
            <RtcSurfaceView style={styles.remoteVideo} canvas={{ uid: remoteUid }} zOrderMediaOverlay={false} />
          ) : (
            <View style={styles.connectingContainer}>
              <Avatar
                image={otherPerson.imageUri ? { uri: otherPerson.imageUri } : undefined}
                fallbackText={otherPerson.name.charAt(0)}
                size={scale(80)}
              />
              <Text style={[textStyle.fs_mont_16_400, styles.connectingText]}>
                Connecting to {otherPerson.name}...
              </Text>
            </View>
          )}
          {isVideoEnabled && (
            <RtcSurfaceView
              style={styles.localVideo}
              canvas={{ uid: 0 }}
              zOrderMediaOverlay={true}
            />
          )}
        </View>
      );
    } else {
      return (
        <View style={styles.audioCallContainer}>
          <Avatar
            image={otherPerson.imageUri ? { uri: otherPerson.imageUri } : undefined}
            fallbackText={otherPerson.name.charAt(0)}
            size={scale(120)}
            borderColor={remoteUid ? colors.success.base : colors.grey300}
            borderWidth={3}
          />
          <Text style={[textStyle.fs_mont_24_700, styles.astrologerName]}>{otherPerson.name}</Text>
          <Text style={[textStyle.fs_mont_16_400, styles.callStatusText]}>
            {remoteUid ? 'Connected' : 'Connecting...'}
          </Text>
        </View>
      );
    }
  };

  const renderControls = () => {
    if (callState !== 'connected') return null;
    return (
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.activeButton]}
          onPress={toggleMute}
        >
          <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎤'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, isSpeakerEnabled && styles.activeButton]}
          onPress={toggleSpeaker}
        >
          <Text style={styles.controlIcon}>{isSpeakerEnabled ? '🔊' : '🔈'}</Text>
        </TouchableOpacity>
        {callType === 'VIDEO' && (
          <>
            <TouchableOpacity style={styles.controlButton} onPress={switchCamera}>
              <Text style={styles.controlIcon}>🔄</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, !isVideoEnabled && styles.activeButton]}
              onPress={toggleVideo}
            >
              <Text style={styles.controlIcon}>{isVideoEnabled ? '📹' : '📷'}</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={styles.endCallButton} onPress={() => handleCallEnd(true)}>
          <Text style={styles.endCallIcon}>📞</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Initialize on mount
  useEffect(() => {
    console.log('🚀 Component mounted');
    setupAgoraEngine();
    setupLocalSocketListeners();
    if (!isAstrologer) startWaitingTimer();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleCallCancel();
      return true;
    });

    return () => {
      cleanup();
      backHandler.remove();
    };
  }, []);

  // Join channel when session data is available
  useEffect(() => {
    console.log('🔍 callSession:', callSession);
    if (callSession && engineRef.current) {
      console.log('📞 Joining channel with session data');
      setCallState('connecting');
      stopWaitingTimer();
      joinChannel(callSession);
    } else if (!callSession) {
      console.log('⚠️ No callSession data yet');
    }
  }, [callSession]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryText} />
      <View style={styles.header}>
        <Text style={[textStyle.fs_mont_18_600, styles.headerText]}>
          {callType === 'VIDEO' ? 'Video Call' : 'Voice Call'}
        </Text>
        {callState === 'connected' && (
          <Text style={[textStyle.fs_mont_16_400, styles.timerText]}>{timer}</Text>
        )}
        {!networkConnected && <Text style={styles.networkStatus}>Poor Connection</Text>}
      </View>
      <View style={styles.content}>
        {callState === 'waiting' && renderWaitingScreen()}
        {callState === 'connecting' && renderConnectingScreen()}
        {callState === 'rejected' && renderRejectedScreen()}
        {callState === 'connected' && renderConnectedCall()}
      </View>
      {renderControls()}
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
  networkStatus: {
    color: colors.error.base,
    fontSize: scale(12),
    marginTop: verticalScale(4),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  audioCallContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  callStatusText: {
    color: colors.grey300,
    textAlign: 'center',
  },
  videoContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
    width: '100%',
  },
  localVideo: {
    position: 'absolute',
    top: verticalScale(20),
    right: scale(20),
    width: scale(120),
    height: verticalScale(160),
    borderRadius: scale(10),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.whiteText,
  },
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryText,
  },
  connectingText: {
    color: colors.whiteText,
    marginTop: verticalScale(20),
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(30),
    backgroundColor: colors.primaryText,
  },
  controlButton: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    backgroundColor: colors.grey300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: colors.error.base,
  },
  controlIcon: {
    fontSize: scale(24),
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.error.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallIcon: {
    fontSize: scale(28),
    transform: [{ rotate: '135deg' }],
  },
});

export default CallScreen;