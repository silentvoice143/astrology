import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  PermissionsAndroid,
  Platform,
  BackHandler,
} from 'react-native';
import {
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
  ChannelProfileType,
  ClientRoleType,
} from 'react-native-agora';
import {useRoute, useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import KeepAwake from 'react-native-keep-awake';
import NetInfo from '@react-native-community/netinfo';
import {scale, verticalScale} from '../utils/sizer';
import {colors} from '../constants/colors';
import {textStyle} from '../constants/text-style';
import {useAppSelector} from '../hooks/redux-hook';
import {useWebSocket} from '../hooks/use-socket';
import Avatar from '../components/avatar';
import api from '../apis';
import {decodeMessageBody} from '../utils/utils';

// Replace with your actual Agora App ID
const AGORA_APP_ID = '84775a8e21d24a69a435252b702621aa';

type CallType = 'voice' | 'video';

interface CallScreenParams {
  callType: CallType;
  astrologer: {
    id: string;
    name: string;
    imageUri?: string;
  };
  duration: number;
  sessionId: string;
}

const CallScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();

  const params = route.params as CallScreenParams;
  const {callType, astrologer, duration, sessionId} = params;

  // State management
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(
    callType === 'video',
  );
  const [timer, setTimer] = useState('00:00');
  const [callStatus, setCallStatus] = useState<
    'connecting' | 'ringing' | 'connected' | 'ended'
  >('connecting');
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [networkConnected, setNetworkConnected] = useState(true);

  // Refs
  const engineRef = useRef<IRtcEngine | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // Redux state
  const {user} = useAppSelector(state => state.auth);
  const {subscribe, send} = useWebSocket(user?.id || '');

  // Channel name
  const channelName = sessionId || `call_${astrologer.id}_${user?.id}`;

  useEffect(() => {
    initializeCall();
    setupSocketListeners();
    setupNetworkListener();

    // Keep screen awake during call
    KeepAwake.activate();

    // Handle back button
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleCallEnd();
        return true;
      },
    );

    return () => {
      cleanup();
      KeepAwake.deactivate();
      backHandler.remove();
    };
  }, []);

  // ========================================
  // NETWORK MONITORING
  // ========================================

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkConnected(state.isConnected || false);

      if (
        !state.isConnected &&
        (callStatus === 'connected' || callStatus === 'ringing')
      ) {
        Toast.show({
          type: 'error',
          text1: 'Connection Lost',
          text2: 'Please check your internet connection',
        });
      }
    });

    return unsubscribe;
  };

  // ========================================
  // API CALLS
  // ========================================

  const startCallAPI = async () => {
    try {
      const response = await api.post('/api/v1/call/start', {
        sessionId,
        astrologerId: astrologer.id,
        userId: user?.id,
        callType,
        duration,
        channelName,
      });

      if (response.data.success) {
        console.log('Call started successfully:', response.data);
        return response.data;
      }
      throw new Error('Call start failed');
    } catch (error) {
      console.error('Start call API error:', error);
      Toast.show({
        type: 'error',
        text1: 'Call Error',
        text2: 'Failed to start call. Please try again.',
      });
      throw error;
    }
  };

  const endCallAPI = async (actualDuration: number) => {
    try {
      const response = await api.post('/api/v1/call/end', {
        sessionId,
        actualDuration, // in seconds
      });

      if (response.data.success) {
        console.log('Call ended successfully:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('End call API error:', error);
    }
  };

  // ========================================
  // SOCKET INTEGRATION
  // ========================================

  const setupSocketListeners = () => {
    if (!sessionId) return;

    // Listen for call timer from socket
    const timerSub = subscribe(`/topic/call/${sessionId}/timer`, msg => {
      try {
        const timeData = decodeMessageBody(msg);
        setTimer(timeData);
      } catch (err) {
        console.error('Timer message parse error:', err);
      }
    });

    // Listen for call end
    const endSub = subscribe(`/topic/call/${sessionId}/end`, msg => {
      try {
        const data = JSON.parse(decodeMessageBody(msg));
        if (data.status === 'ended') {
          handleCallEnd();
        }
      } catch (err) {
        console.error('Call end message parse error:', err);
      }
    });

    // Listen for call status updates
    const statusSub = subscribe(`/topic/call/${sessionId}/status`, msg => {
      try {
        const data = JSON.parse(decodeMessageBody(msg));
        setCallStatus(data.status);
      } catch (err) {
        console.error('Status message parse error:', err);
      }
    });

    // Listen for connection status
    const connectionSub = subscribe(
      `/topic/call/${sessionId}/connection`,
      msg => {
        try {
          const data = JSON.parse(decodeMessageBody(msg));
          console.log('Connection status update:', data);
        } catch (err) {
          console.error('Connection message parse error:', err);
        }
      },
    );

    return () => {
      timerSub?.unsubscribe();
      endSub?.unsubscribe();
      statusSub?.unsubscribe();
      connectionSub?.unsubscribe();
    };
  };

  // ========================================
  // AGORA IMPLEMENTATION
  // ========================================

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];

      if (callType === 'video') {
        permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
      }

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      return Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED,
      );
    }
    return true;
  };

  const initializeCall = async () => {
    try {
      // 1. Request permissions first
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        Alert.alert(
          'Permissions Required',
          'Please grant camera and microphone permissions to make calls.',
          [{text: 'OK', onPress: () => navigation.goBack()}],
        );
        return;
      }

      // 2. Start call via API
      const callData = await startCallAPI();
      if (!callData) {
        navigation.goBack();
        return;
      }

      // 3. Initialize Agora
      await initializeAgora(callData.token);
    } catch (error) {
      console.error('Call initialization error:', error);
      Alert.alert(
        'Call Failed',
        'Unable to start the call. Please try again.',
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    }
  };

  const initializeAgora = async (token?: string) => {
    try {
      // Create engine
      const engine = createAgoraRtcEngine();
      engineRef.current = engine;

      // Initialize engine
      engine.initialize({
        appId: AGORA_APP_ID,
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
      });

      // Register event handlers BEFORE joining
      engine.registerEventHandler({
        onJoinChannelSuccess: (connection, elapsed) => {
          console.log(
            'Join channel success:',
            connection.channelId,
            connection.localUid,
          );
          setIsJoined(true);
          setCallStatus('ringing');

          // Notify backend that user joined
          send(
            `/app/call.joined`,
            {},
            JSON.stringify({
              sessionId,
              userId: user?.id,
              agoraUid: connection.localUid,
            }),
          );
        },
        onUserJoined: (connection, remoteUid, elapsed) => {
          console.log('User joined:', remoteUid);
          setRemoteUid(remoteUid);
          setCallStatus('connected');
          setCallStartTime(new Date());
          startLocalTimer();
        },
        onUserOffline: (connection, remoteUid, reason) => {
          console.log('User offline:', remoteUid, reason);
          setRemoteUid(null);

          // Don't auto-end immediately, give time for reconnection
          setTimeout(() => {
            if (callStatus !== 'ended') {
              handleCallEnd();
            }
          }, 5000);
        },
        onConnectionStateChanged: (connection, state, reason) => {
          console.log('Connection state changed:', state, reason);
        },
        onError: (err, msg) => {
          console.error('Agora error:', err, msg);
          Toast.show({
            type: 'error',
            text1: 'Call Error',
            text2: 'Connection error occurred',
          });
        },
        onNetworkQuality: (connection, localQuality, remoteQuality) => {
          // Handle network quality changes
          if (localQuality > 4) {
            // Poor quality
            Toast.show({
              type: 'warning',
              text1: 'Poor Connection',
              text2: 'Your network connection is unstable',
            });
          }
        },
      });

      // Configure audio settings
      await engine.enableAudio();
      await engine.enableLocalAudio(true);
      await engine.setEnableSpeakerphone(isSpeakerEnabled);
      await engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);

      // Configure video settings
      if (callType === 'video') {
        await engine.enableVideo();
        await engine.enableLocalVideo(true);

        // Set video configuration
        await engine.setVideoEncoderConfiguration({
          dimensions: {width: 640, height: 480},
          frameRate: 15,
          bitrate: 800,
        });
      } else {
        await engine.disableVideo();
        await engine.enableLocalVideo(false);
      }

      // Join channel
      const uid = parseInt(user?.id || '0');
      const agoraToken = token || null;

      const result = await engine.joinChannel(agoraToken, channelName, uid, {
        publishMicrophoneTrack: true,
        publishCameraTrack: callType === 'video',
        autoSubscribeAudio: true,
        autoSubscribeVideo: callType === 'video',
      });

      if (result < 0) {
        throw new Error(`Failed to join channel: ${result}`);
      }

      // Start preview AFTER joining (for video calls)
      if (callType === 'video') {
        await engine.startPreview();
      }

      console.log(
        'Successfully joined channel:',
        channelName,
        'with UID:',
        uid,
      );
    } catch (error) {
      console.error('Agora initialization error:', error);
      throw error;
    }
  };

  // ========================================
  // TIMER MANAGEMENT
  // ========================================

  const startLocalTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }

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

        // Use local timer if socket timer is not updating
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

  // ========================================
  // CALL CONTROLS
  // ========================================

  const toggleMute = async () => {
    if (!engineRef.current) return;

    try {
      const result = await engineRef.current.muteLocalAudioStream(!isMuted);
      if (result === 0) {
        setIsMuted(!isMuted);

        Toast.show({
          type: 'info',
          text1: isMuted ? 'Microphone On' : 'Microphone Off',
          text2: '',
          visibilityTime: 1000,
        });
      } else {
        console.error('Failed to toggle mute:', result);
      }
    } catch (error) {
      console.error('Toggle mute error:', error);
    }
  };

  const toggleVideo = async () => {
    if (!engineRef.current || callType !== 'video') return;

    try {
      const result = await engineRef.current.muteLocalVideoStream(
        !isVideoEnabled,
      );
      if (result === 0) {
        setIsVideoEnabled(!isVideoEnabled);

        Toast.show({
          type: 'info',
          text1: isVideoEnabled ? 'Camera Off' : 'Camera On',
          text2: '',
          visibilityTime: 1000,
        });
      } else {
        console.error('Failed to toggle video:', result);
      }
    } catch (error) {
      console.error('Toggle video error:', error);
    }
  };

  const toggleSpeaker = async () => {
    if (!engineRef.current) return;

    try {
      const result = await engineRef.current.setEnableSpeakerphone(
        !isSpeakerEnabled,
      );
      if (result === 0) {
        setIsSpeakerEnabled(!isSpeakerEnabled);

        Toast.show({
          type: 'info',
          text1: isSpeakerEnabled ? 'Speaker Off' : 'Speaker On',
          text2: '',
          visibilityTime: 1000,
        });
      } else {
        console.error('Failed to toggle speaker:', result);
      }
    } catch (error) {
      console.error('Toggle speaker error:', error);
    }
  };

  const switchCamera = async () => {
    if (!engineRef.current || callType !== 'video') return;

    try {
      await engineRef.current.switchCamera();
    } catch (error) {
      console.error('Switch camera error:', error);
    }
  };

  const handleCallEnd = async () => {
    if (callStatus === 'ended') return;

    setCallStatus('ended');
    stopTimer();

    // Calculate actual duration
    let actualDuration = 0;
    if (callStartTime) {
      actualDuration = Math.floor(
        (new Date().getTime() - callStartTime.getTime()) / 1000,
      );
    }

    // End call via API
    await endCallAPI(actualDuration);

    // Send socket message to end call for other user
    if (sessionId) {
      send(
        `/app/call.end`,
        {},
        JSON.stringify({
          sessionId,
          endedBy: user?.id,
          duration: actualDuration,
        }),
      );
    }

    // Cleanup and navigate back
    await cleanup();

    navigation.goBack();

    Toast.show({
      type: 'success',
      text1: 'Call Ended',
      text2: `Duration: ${timer}`,
    });
  };

  const cleanup = async () => {
    try {
      stopTimer();

      if (engineRef.current) {
        // Stop preview first
        if (callType === 'video') {
          await engineRef.current.stopPreview();
        }

        // Leave channel
        await engineRef.current.leaveChannel();

        // Unregister and release
        engineRef.current.unregisterEventHandler();
        engineRef.current.release();
        engineRef.current = null;
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderLocalVideo = () => {
    if (callType !== 'video' || !isVideoEnabled) return null;

    return (
      <RtcSurfaceView
        style={styles.localVideo}
        canvas={{uid: 0}}
        zOrderMediaOverlay={true}
      />
    );
  };

  const renderRemoteVideo = () => {
    if (callType !== 'video' || !remoteUid) return null;

    return (
      <RtcSurfaceView
        style={styles.remoteVideo}
        canvas={{uid: remoteUid}}
        zOrderMediaOverlay={false}
      />
    );
  };

  const renderAudioCallUI = () => (
    <View style={styles.audioCallContainer}>
      <View style={styles.avatarContainer}>
        <Avatar
          image={astrologer.imageUri ? {uri: astrologer.imageUri} : undefined}
          fallbackText={astrologer.name.charAt(0)}
          size={scale(120)}
          borderColor={
            callStatus === 'connected' ? colors.success.base : colors.grey300
          }
          borderWidth={3}
        />
      </View>

      <Text style={[textStyle.fs_mont_24_700, styles.astrologerName]}>
        {astrologer.name}
      </Text>

      <Text style={[textStyle.fs_mont_16_400, styles.callStatusText]}>
        {callStatus === 'connecting' && 'Connecting...'}
        {callStatus === 'ringing' && 'Ringing...'}
        {callStatus === 'connected' && 'Connected'}
        {callStatus === 'ended' && 'Call Ended'}
      </Text>

      {!networkConnected && (
        <Text style={[textStyle.fs_mont_14_400, styles.networkWarning]}>
          No Internet Connection
        </Text>
      )}
    </View>
  );

  const renderControls = () => (
    <View style={styles.controls}>
      {/* Mute Button */}
      <TouchableOpacity
        style={[styles.controlButton, isMuted && styles.activeButton]}
        onPress={toggleMute}>
        <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎤'}</Text>
      </TouchableOpacity>

      {/* Speaker Button */}
      <TouchableOpacity
        style={[styles.controlButton, isSpeakerEnabled && styles.activeButton]}
        onPress={toggleSpeaker}>
        <Text style={styles.controlIcon}>{isSpeakerEnabled ? '🔊' : '🔈'}</Text>
      </TouchableOpacity>

      {/* Camera Switch Button (only for video calls) */}
      {callType === 'video' && (
        <TouchableOpacity style={styles.controlButton} onPress={switchCamera}>
          <Text style={styles.controlIcon}>🔄</Text>
        </TouchableOpacity>
      )}

      {/* Video Button (only for video calls) */}
      {callType === 'video' && (
        <TouchableOpacity
          style={[styles.controlButton, !isVideoEnabled && styles.activeButton]}
          onPress={toggleVideo}>
          <Text style={styles.controlIcon}>{isVideoEnabled ? '📹' : '📷'}</Text>
        </TouchableOpacity>
      )}

      {/* End Call Button */}
      <TouchableOpacity style={styles.endCallButton} onPress={handleCallEnd}>
        <Text style={styles.endCallIcon}>📞</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryText}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[textStyle.fs_mont_18_600, styles.headerText]}>
          {callType === 'video' ? 'Video Call' : 'Voice Call'}
        </Text>
        <Text style={[textStyle.fs_mont_16_400, styles.timerText]}>
          {timer}
        </Text>
        {!networkConnected && (
          <Text style={styles.networkStatus}>No Internet</Text>
        )}
      </View>

      {/* Call Content */}
      <View style={styles.content}>
        {callType === 'video' ? (
          <View style={styles.videoContainer}>
            {/* Remote Video */}
            {remoteUid ? (
              renderRemoteVideo()
            ) : (
              <View style={styles.waitingContainer}>
                <Avatar
                  image={
                    astrologer.imageUri ? {uri: astrologer.imageUri} : undefined
                  }
                  fallbackText={astrologer.name.charAt(0)}
                  size={scale(80)}
                />
                <Text style={[textStyle.fs_mont_16_400, styles.waitingText]}>
                  Waiting for {astrologer.name} to join...
                </Text>
              </View>
            )}

            {/* Local Video */}
            {renderLocalVideo()}
          </View>
        ) : (
          renderAudioCallUI()
        )}
      </View>

      {/* Controls */}
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
  // Audio Call Styles
  audioCallContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginBottom: verticalScale(30),
  },
  astrologerName: {
    color: colors.whiteText,
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  callStatusText: {
    color: colors.grey300,
    textAlign: 'center',
  },
  networkWarning: {
    color: colors.error.base,
    textAlign: 'center',
    marginTop: verticalScale(10),
  },
  // Video Call Styles
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
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryText,
  },
  waitingText: {
    color: colors.whiteText,
    marginTop: verticalScale(20),
    textAlign: 'center',
  },
  // Controls
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
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    backgroundColor: colors.error.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallIcon: {
    fontSize: scale(28),
    transform: [{rotate: '135deg'}],
  },
});

export default CallScreen;
