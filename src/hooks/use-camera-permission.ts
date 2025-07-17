import {useCallback, useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {Camera, CameraPermissionStatus} from 'react-native-vision-camera';

export const useCameraPermission = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const requestPermission = useCallback(async () => {
    setLoading(true);

    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'We need access to your camera to let you take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        setHasPermission(isGranted);
        return isGranted;
      }
      //    else {
      //     const result: CameraPermissionStatus =
      //       await Camera.requestCameraPermission();
      //     const isGranted = result === 'authorized';
      //     setHasPermission(isGranted);
      //     return isGranted;
      //   }
    } catch (err) {
      console.warn('Permission error:', err);
      setHasPermission(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    hasPermission,
    loading,
    requestPermission,
  };
};
