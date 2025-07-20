import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Vibration,
  Dimensions,
} from 'react-native';
import {scale, verticalScale} from '../../utils/sizer';
import {colors} from '../../constants/colors';
import {textStyle} from '../../constants/text-style';
import CallIcon from '../../assets/icons/call-icon';
import VideoCallIcon from '../../assets/icons/video-call-icon';
import {useAppDispatch, useAppSelector} from '../../hooks/redux-hook';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {acceptCallRequest} from '../../store/reducer/session/action';
import Avatar from '../../components/avatar';

interface CallRequest {
  userId: string;
  type: 'VOICE' | 'VIDEO';
}

interface CallRequestNotificationProps {
  visible: boolean;
  callRequest: CallRequest | null;
  onClose: () => void;
}

const CallRequestNotification: React.FC<CallRequestNotificationProps> = ({
  visible,
  callRequest,
  onClose,
}) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isResponding, setIsResponding] = useState(false);

  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const {user} = useAppSelector(state => state.auth);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // useEffect(() => {
  //   if (visible && callRequest) {
  //     setTimeLeft(30);
  //     startCountdown();

  //     // Vibrate to alert astrologer
  //     Vibration.vibrate([500, 500, 500]);

  //     // Auto-reject after 30 seconds
  //     timeoutRef.current = setTimeout(() => {
  //       handleReject(true);
  //     }, 30000);
  //   }

  //   return () => {
  //     if (timeoutRef.current) clearTimeout(timeoutRef.current);
  //     if (countdownRef.current) clearInterval(countdownRef.current);
  //   };
  // }, [visible, callRequest]);

  const startCountdown = () => {
    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAccept = async () => {
    if (!callRequest || isResponding) return;

    try {
      setIsResponding(true);

      const response = await dispatch(
        acceptCallRequest(callRequest.userId),
      ).unwrap();

      console.log(response, 'response of astrologer');

      if (response.success) {
        // Clear timers
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);

        Toast.show({
          type: 'success',
          text1: 'Call Accepted',
          text2: 'Connecting to the call...',
        });
        console.log(callRequest, 'call request notify');

        navigation.navigate('call', {
          callType: callRequest?.type || 'VOICE',
          astrologer: {
            id: user?.id,
            name: user?.name,
            imageUri: '',
          },
          user: {
            id: callRequest.userId,
            name: 'User',
            imageUri: '',
          },
          duration: 30, // Will be updated from session details via socket
          sessionId: undefined, // Will be set when session details arrive via socket
          isAstrologer: true, // This is the key - astrologer starts in 'connecting' state
        });

        onClose();
      } else {
        throw new Error('Failed to accept call');
      }
    } catch (error) {
      console.error('Accept call error:', error);
      Toast.show({
        type: 'error',
        text1: 'Accept Failed',
        text2: 'Unable to accept the call. Please try again.',
      });
    } finally {
      setIsResponding(false);
    }
  };

  const handleReject = async (autoReject = false) => {
    if (isResponding) return;

    try {
      setIsResponding(true);

      if (!autoReject) {
        Toast.show({
          type: 'info',
          text1: 'Call Rejected',
          text2: 'The call has been declined',
        });
      }
    } catch (error) {
      console.error('Reject call error:', error);
    } finally {
      setIsResponding(false);
      onClose();
    }
  };

  if (!visible || !callRequest) {
    return null;
  }

  console.log(callRequest, 'call requer noti');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => handleReject()}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.callTypeIndicator}>
              {callRequest.type === 'VIDEO' ? (
                <VideoCallIcon size={24} colors={[colors.whiteText]} />
              ) : (
                <CallIcon colors={[colors.whiteText]} height={24} width={24} />
              )}
            </View>
            <Text style={[textStyle.fs_mont_16_700, styles.headerText]}>
              Incoming {callRequest.type === 'VIDEO' ? 'Video' : 'Voice'}{' '}
              Call
            </Text>
          </View>
          <Text style={{color: 'red'}}>{JSON.stringify(callRequest)}</Text>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Avatar
              image={undefined}
              fallbackText="U"
              size={scale(80)}
              borderColor={colors.success.base}
              borderWidth={3}
            />

            <Text style={[textStyle.fs_mont_20_700, styles.userName]}>
              User calling...
            </Text>

            <Text style={[textStyle.fs_mont_14_400, styles.userSubtext]}>
              Wants to start a {callRequest?.type?.toLowerCase()} call
            </Text>
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <Text style={[textStyle.fs_mont_14_400, styles.timerText]}>
              Respond in {timeLeft}s
            </Text>
            <View style={styles.timerBar}>
              <View
                style={[
                  styles.timerProgress,
                  {width: `${(timeLeft / 30) * 100}%`},
                ]}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleReject()}
              disabled={isResponding}>
              <Text style={[textStyle.fs_mont_16_600, styles.rejectButtonText]}>
                Decline
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAccept}
              disabled={isResponding}>
              <Text style={[textStyle.fs_mont_16_600, styles.acceptButtonText]}>
                {isResponding ? 'Accepting...' : 'Accept'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    backgroundColor: colors.primary_surface,
    borderRadius: scale(20),
    padding: scale(20),
    maxWidth: scale(350),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
  },
  callTypeIndicator: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: colors.success.base,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  headerText: {
    color: colors.primaryText,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  userName: {
    color: colors.primaryText,
    marginTop: verticalScale(12),
    marginBottom: verticalScale(4),
    textAlign: 'center',
  },
  userSubtext: {
    color: colors.secondaryText,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  timerText: {
    color: colors.error.base,
    marginBottom: verticalScale(8),
  },
  timerBar: {
    width: '100%',
    height: verticalScale(4),
    backgroundColor: colors.grey300,
    borderRadius: scale(2),
    overflow: 'hidden',
  },
  timerProgress: {
    height: '100%',
    backgroundColor: colors.error.base,
    borderRadius: scale(2),
  },
  actions: {
    flexDirection: 'row',
    gap: scale(12),
  },
  actionButton: {
    flex: 1,
    paddingVertical: verticalScale(14),
    borderRadius: scale(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: colors.error.base,
  },
  acceptButton: {
    backgroundColor: colors.success.base,
  },
  rejectButtonText: {
    color: colors.whiteText,
  },
  acceptButtonText: {
    color: colors.whiteText,
  },
});

export default CallRequestNotification;
