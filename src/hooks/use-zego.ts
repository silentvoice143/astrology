import {useEffect, useState} from 'react';
import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn';
import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';
import Config from 'react-native-config';

// const appID = 2143779193;
// const appSign =
//   'ea994b83474dccbe389acf9387f7420520799fb45f881119e8e092d90a1d923e';

const appID = Number(Config.ZEGO_APP_ID);
const appSign = Config.ZEGO_APP_SIGN;

export function useZegoAndFCM(
  userId: string | undefined,
  userName: string | undefined,
  isAuthenticated: boolean,
) {
  const [zegoInitialized, setzegoInitialized] = useState(false);
  useEffect(() => {
    let mounted = true;

    async function init() {
      console.log(
        userId,
        userName,
        appID,
        appSign,
        '----------this is zego config 1',
      );
      // guard: only init when user is authenticated and we have ids
      if (!mounted) return;
      if (!isAuthenticated) {
        console.log('[Zego] Not authenticated — skipping init');
        return;
      }
      if (!userId || !userName) {
        console.log('[Zego] Missing userId or userName — skipping init', {
          userId,
          userName,
        });
        return;
      }

      console.log(
        userId,
        userName,
        appID,
        appSign,
        '----------this is zego config',
      );

      try {
        console.log('[Zego] init start', {appID, userId, userName});
        await ZegoUIKitPrebuiltCallService.init(
          appID,
          appSign,
          userId,
          userName,
          [ZIM, ZPNs],
          {
            ringtoneConfig: {
              incomingCallFileName: 'zego_incoming.mp3',
              outgoingCallFileName: 'zego_outgoing.mp3',
            },
            androidNotificationConfig: {
              channelID: Config.ZEGO_CHANNEl_ID,
              channelName: Config.ZEGO_CHANNEl_NAME,
            },
          },
        ).then(() => {
          setzegoInitialized(true);
          // /////////////////////////
          ZegoUIKitPrebuiltCallService.requestSystemAlertWindow({
            message:
              'We need your consent for the following permissions in order to use the offline call function properly',
            allow: 'Allow',
            deny: 'Deny',
          });
          // /////////////////////////
        });
        console.log('[Zego] init success');
      } catch (err) {
        // show a clean error so you can see the real exception in logs
        console.error('[Zego] init error:', err);
      }
    }

    init();

    return () => {
      mounted = false;
      try {
        ZegoUIKitPrebuiltCallService.uninit();
        console.log('[Zego] uninit called');
      } catch (e) {
        console.warn('[Zego] uninit error', e);
      }
    };
    // include userName so effect reruns when it becomes available
  }, [userId, userName, isAuthenticated]);
  return zegoInitialized;
}
