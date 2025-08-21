// App.tsx
import React, {useEffect, useRef, useState} from 'react';
import {
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import {
  createAgoraRtcEngine,
  IRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  RtcSurfaceView,
} from 'react-native-agora';

const appId = 'Yccf4a48677504422a5c83d6da8c72a78'; // Replace with your valid App ID
const channelName = '12345678';
const token = '007eJxTYLh5vfOp7o832fOv/5zfGr20tfeU+yk/qe4Hff4xvybvT/RWYEhOTjNJNLEwMzc3NTAxMTJKNE22ME4xS0m0SDY3SjS3sP5Wk9EQyMgQOGsbKyMDBIL4HAyGRsYmpmbmFgwMAA4RIwc='; // Replace with your valid token
const uid = 0;

export default function App() {
  const agoraEngineRef = useRef<IRtcEngine>();
  const [joined, setJoined] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ]);
        const audioGranted = granted['android.permission.RECORD_AUDIO'] === 'granted';
        const cameraGranted = granted['android.permission.CAMERA'] === 'granted';

        if (!audioGranted || !cameraGranted) {
          Alert.alert('Permissions not granted');
          console.log('Permissions missing:', granted);
          return false;
        }
        return true;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const setupAgora = async () => {
    console.log('Requesting permissions...');
    const permissionGranted = await requestPermissions();
    if (!permissionGranted) return;

    try {
      console.log('Creating Agora engine...');
      const engine = createAgoraRtcEngine();
      agoraEngineRef.current = engine;

      console.log('Initializing Agora engine...');
      engine.initialize({appId});
      console.log('Agora engine initialized');

      engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
      engine.enableVideo();
      engine.startPreview();
      console.log('Video enabled & preview started');

      engine.registerEventHandler({
        onJoinChannelSuccess: (connection, elapsed) => {
          console.log('✅ onJoinChannelSuccess', connection, elapsed);
          setJoined(true);
        },
        onUserJoined: (connection, remoteUid) => {
          console.log('👤 onUserJoined', remoteUid);
        },
        onUserOffline: (connection, remoteUid) => {
          console.log('👋 onUserOffline', remoteUid);
        },
        onError: (err) => {
          console.error('❌ Agora Error:', err);
        },
      });

    } catch (e) {
      console.error('Setup error:', e);
    }
  };

  const join = async () => {
    try {
      if (!agoraEngineRef.current) {
        console.warn('Agora engine not initialized');
        return;
      }

      console.log('Attempting to join channel...');
      agoraEngineRef.current.joinChannel(token, channelName, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
    } catch (e) {
      console.error('Join error:', e);
    }
  };

  useEffect(() => {
    setupAgora();
    return () => {
      agoraEngineRef.current?.leaveChannel();
      agoraEngineRef.current?.release();
    };
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        {joined ? (
          <>
            <Text>✅ You are in the channel</Text>
            <RtcSurfaceView
              canvas={{uid: 0}}
              style={{width: '100%', height: 300}}
            />
          </>
        ) : (
          <TouchableOpacity
            onPress={join}
            style={{
              padding: 12,
              backgroundColor: '#007bff',
              borderRadius: 8,
            }}>
            <Text style={{color: '#fff'}}>Join Channel</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
