import notifee, {AndroidImportance} from '@notifee/react-native';

export const NOTIFICATION_CHANNELS = {
  HIGH: {
    id: 'high_importance_channel',
    name: 'High Importance Notifications',
    sound: 'notification_sound',
    importance: AndroidImportance.HIGH,
    vibration: true,
  },
} as const;

export async function createNotificationChannels() {
  await Promise.all(
    Object.values(NOTIFICATION_CHANNELS).map(channel =>
      notifee.createChannel({
        id: channel.id,
        name: channel.name,
        importance: channel.importance,
        sound: channel.sound,
        vibration: channel.vibration,
      }),
    ),
  );
}
