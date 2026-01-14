import {PermissionsAndroid, Platform} from 'react-native';
import {Linking} from 'react-native';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';

export async function requestAndroidCallPermissions() {
  if (Platform.OS !== 'android') return true;

  const requiredPermissions = [
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    PermissionsAndroid.PERMISSIONS.CAMERA,
  ];

  // Android 13+ notification permission
  if (Platform.Version >= 33) {
    requiredPermissions.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }

  // 1️⃣ Check existing permissions
  const permissionStatus = await Promise.all(
    requiredPermissions.map(permission => PermissionsAndroid.check(permission)),
  );

  // 2️⃣ Collect permissions that are NOT granted
  const permissionsToRequest = requiredPermissions.filter(
    (_, index) => !permissionStatus[index],
  );

  // 3️⃣ Request only missing permissions
  if (permissionsToRequest.length > 0) {
    const requestResult = await PermissionsAndroid.requestMultiple(
      permissionsToRequest,
    );

    // 4️⃣ Verify required call permissions
    return (
      requestResult[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      requestResult[PermissionsAndroid.PERMISSIONS.CAMERA] ===
        PermissionsAndroid.RESULTS.GRANTED
    );
  }

  // All permissions already granted
  return true;
}

export const requestOverlayPermission = async () => {
  if (Platform.OS !== 'android') return true;

  const status = await check(PERMISSIONS.ANDROID.SYSTEM_ALERT_WINDOW);

  if (status === RESULTS.GRANTED) return true;

  await Linking.openSettings(); // opens overlay settings page
  return false;
};
