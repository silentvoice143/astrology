import {View, Text, TouchableOpacity, Pressable, Alert} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomModal from '../../modal';
import CustomButton from '../../custom-button';
import {scale, verticalScale, moderateScale} from '../../../utils/sizer';
import {colors} from '../../../constants/colors';
import {textStyle} from '../../../constants/text-style';
import CheckIcon from '../../../assets/icons/checkIcon';

import CallIcon from '../../../assets/icons/call-icon';
import VideoCallIcon from '../../../assets/icons/video-call-icon';
import ChatIcon from '../../../assets/icons/chat-icon';

import {useAppDispatch, useAppSelector} from '../../../hooks/redux-hook';
import {
  sendCallRequest,
  sendSessionRequest,
  setChatUser,
  setOtherUser,
  setSession,
} from '../../../store/reducer/session';
import {useNavigation} from '@react-navigation/native';
import {UserDetail} from '../../../utils/types';
import Toast from 'react-native-toast-message';

type SessionType = 'chat' | 'audio' | 'video';

interface DurationOption {
  label: string;
  id: string;
  value: number;
}

interface SessionTypeOption {
  id: SessionType;
  label: string;
  icon: React.ReactNode;
  priceKey:
    | 'pricePerMinuteChat'
    | 'pricePerMinuteVoice'
    | 'pricePerMinuteVideo';
}

interface AstrologerWithPricing extends UserDetail {
  pricePerMinuteChat: number;
  pricePerMinuteVideo: number;
  pricePerMinuteVoice: number;
}

const RequestSessionModal = ({
  isOpen,
  onClose,
  astrologer,
  initialSessionType = 'chat',
}: {
  isOpen: boolean;
  onClose: () => void;
  astrologer: AstrologerWithPricing | null;
  initialSessionType?: SessionType;
}) => {
  const durationOptions: DurationOption[] = [
    {label: '1 min', id: '1m', value: 1},
    {label: '5 min', id: '5m', value: 5},
    {label: '10 min', id: '10m', value: 10},
    {label: '15 min', id: '15m', value: 15},
    {label: '30 min', id: '30m', value: 30},
    {label: '1 hour', id: '1h', value: 60},
  ];

  const sessionTypes: SessionTypeOption[] = [
    {
      id: 'chat',
      label: 'Chat',
      icon: <ChatIcon height={20} width={20} colors={[colors.whiteText]} />,
      priceKey: 'pricePerMinuteChat',
    },
    {
      id: 'audio',
      label: 'Voice Call',
      icon: <CallIcon colors={[colors.whiteText]} height={20} width={20} />,
      priceKey: 'pricePerMinuteVoice',
    },
    {
      id: 'video',
      label: 'Video Call',
      icon: <VideoCallIcon colors={[colors.whiteText]} size={20} />,
      priceKey: 'pricePerMinuteVideo',
    },
  ];

  const [selectedDuration, setSelectedDuration] =
    useState<DurationOption | null>(null);
  const [selectedSessionType, setSelectedSessionType] =
    useState<SessionType>(initialSessionType);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  // Get user wallet balance from Redux store
  const {user} = useAppSelector(state => state.auth);
  const walletBalance = user?.walletBalance || 0;

  // Get astrologer pricing from the astrologer prop
  const astrologerPricing = astrologer
    ? {
        pricePerMinuteChat: astrologer.pricePerMinuteChat,
        pricePerMinuteVoice: astrologer.pricePerMinuteVoice,
        pricePerMinuteVideo: astrologer.pricePerMinuteVideo,
      }
    : {
        pricePerMinuteChat: 0,
        pricePerMinuteVoice: 0,
        pricePerMinuteVideo: 0,
      };

  // Reset session type when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSessionType(initialSessionType);
    }
  }, [isOpen, initialSessionType]);

  // Calculate total cost when duration or session type changes
  useEffect(() => {
    if (selectedDuration && astrologer) {
      const sessionTypeOption = sessionTypes.find(
        type => type.id === selectedSessionType,
      );
      if (sessionTypeOption) {
        const pricePerMinute = astrologerPricing[sessionTypeOption.priceKey];
        const cost = pricePerMinute * selectedDuration.value;
        setTotalCost(cost);
      }
    }
  }, [selectedDuration, selectedSessionType, astrologer]);

  // Check if user has sufficient balance
  const hasSufficientBalance = totalCost <= walletBalance;
  const canProceed = selectedDuration && hasSufficientBalance;

  const handleDurationSelect = (duration: DurationOption) => {
    setSelectedDuration(duration);
  };

  const handleSessionTypeSelect = (type: SessionType) => {
    setSelectedSessionType(type);
  };

  const requestSession = async () => {
    if (!selectedDuration || !astrologer || !hasSufficientBalance) {
      const message = !selectedDuration
        ? 'Please select a duration'
        : !hasSufficientBalance
        ? 'Insufficient wallet balance'
        : 'Please try again';

      Toast.show({
        type: 'error',
        text1: 'Unable to proceed',
        text2: message,
      });

      return;
    }

    try {
      setLoading(true);
      const body = {
        astrologerId: astrologer?.id,
        duration: selectedDuration.value,
        type: selectedSessionType.toUpperCase(),
      };

      let payload;

      if (selectedSessionType === 'chat') {
        payload = await dispatch(sendSessionRequest(body)).unwrap();
      } else {
        payload = await dispatch(sendCallRequest(body)).unwrap();
      }

      console.log(body, payload, '----session request body & response');

      if (payload.success) {
        dispatch(setOtherUser(astrologer));
        onClose();

        if (selectedSessionType === 'chat') {
          navigation.navigate('chat');
        } else {
          navigation.navigate('call', {
            callType: selectedSessionType?.toUpperCase(),
            astrologer: {
              id: astrologer.id,
              name: astrologer.name,
              imageUri: '',
            },
            duration: selectedDuration.value,
            sessionId: payload.sessionId || `session_${Date.now()}`,
          });
        }
      }
    } catch (err) {
      console.log('sendSessionRequest Error : ', err);
      Alert.alert('Error', 'Failed to start session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPrice = () => {
    const sessionTypeOption = sessionTypes.find(
      type => type.id === selectedSessionType,
    );
    if (sessionTypeOption) {
      return astrologerPricing[sessionTypeOption.priceKey];
    }
    return 0;
  };

  return (
    <CustomModal
      parent="request-session"
      header={{
        title: 'Start Session',
        description: `Connect with ${astrologer?.name || 'Astrologer'}`,
      }}
      visible={isOpen}
      onClose={onClose}
      footer={
        <View>
          {/* Cost Summary */}
          <View style={styles.costSummary}>
            <View style={styles.costRow}>
              <Text style={[textStyle.fs_mont_14_400, styles.costLabel]}>
                Session Type:
              </Text>
              <Text style={[textStyle.fs_mont_14_600, styles.costValue]}>
                {
                  sessionTypes.find(type => type.id === selectedSessionType)
                    ?.label
                }
              </Text>
            </View>

            {selectedDuration && (
              <>
                <View style={styles.costRow}>
                  <Text style={[textStyle.fs_mont_14_400, styles.costLabel]}>
                    Duration:
                  </Text>
                  <Text style={[textStyle.fs_mont_14_600, styles.costValue]}>
                    {selectedDuration.label}
                  </Text>
                </View>

                <View style={styles.costRow}>
                  <Text style={[textStyle.fs_mont_14_400, styles.costLabel]}>
                    Rate:
                  </Text>
                  <Text style={[textStyle.fs_mont_14_600, styles.costValue]}>
                    ₹{getCurrentPrice()}/min
                  </Text>
                </View>

                <View style={[styles.costRow, styles.totalRow]}>
                  <Text style={[textStyle.fs_mont_16_700, styles.totalLabel]}>
                    Total Cost:
                  </Text>
                  <Text style={[textStyle.fs_mont_16_700, styles.totalValue]}>
                    ₹{totalCost}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.costRow}>
              <Text style={[textStyle.fs_mont_14_400, styles.costLabel]}>
                Wallet Balance:
              </Text>
              <Text
                style={[
                  textStyle.fs_mont_14_600,
                  styles.costValue,
                  {
                    color: hasSufficientBalance
                      ? colors.success.base
                      : colors.error.base,
                  },
                ]}>
                ₹{walletBalance}
              </Text>
            </View>
          </View>

          {/* Insufficient Balance Warning */}
          {!hasSufficientBalance && selectedDuration && (
            <View style={styles.warningContainer}>
              <Text style={[textStyle.fs_mont_12_400, styles.warningText]}>
                ⚠️ Insufficient balance. Please add ₹{totalCost - walletBalance}{' '}
                to your wallet.
              </Text>
            </View>
          )}

          <CustomButton
            title={loading ? 'Starting Session...' : 'Start Session'}
            onPress={requestSession}
            disabled={!canProceed}
            loading={loading}
            style={[
              styles.startButton,
              {
                backgroundColor: canProceed
                  ? colors.success.base
                  : colors.disabled,
              },
            ]}
            textStyle={{color: colors.whiteText}}
          />
        </View>
      }>
      {/* Duration Selection */}
      <View style={styles.section}>
        <Text style={[textStyle.fs_mont_16_700, styles.sectionTitle]}>
          Choose Duration
        </Text>
        <View style={styles.durationContainer}>
          {durationOptions.map(item => (
            <Pressable
              key={item.id}
              onPress={() => handleDurationSelect(item)}
              style={[
                styles.durationOption,
                selectedDuration?.id === item.id && styles.selectedDuration,
              ]}>
              <View
                style={[
                  styles.checkContainer,
                  selectedDuration?.id === item.id && styles.selectedCheck,
                ]}>
                {selectedDuration?.id === item.id && (
                  <CheckIcon size={12} color={colors.whiteText} />
                )}
              </View>
              <Text
                style={[
                  textStyle.fs_mont_14_600,
                  styles.durationLabel,
                  selectedDuration?.id === item.id &&
                    styles.selectedDurationLabel,
                ]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </CustomModal>
  );
};

const styles = {
  section: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    color: colors.primaryText,
    marginBottom: verticalScale(12),
  },
  sessionTypeContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    gap: scale(8),
  },
  sessionTypeCard: {
    flex: 1,
    alignItems: 'center' as const,
    padding: moderateScale(12),
    borderRadius: scale(12),
    borderWidth: 2,
    borderColor: colors.grey300,
    backgroundColor: colors.primary_surface,
  },
  selectedSessionType: {
    borderColor: colors.success.base,
    backgroundColor: colors.success.light,
  },
  sessionTypeIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: colors.grey300,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: verticalScale(8),
  },
  selectedSessionTypeIcon: {
    backgroundColor: colors.success.base,
  },
  sessionTypeLabel: {
    color: colors.primaryText,
    textAlign: 'center' as const,
    marginBottom: verticalScale(4),
  },
  selectedSessionTypeLabel: {
    color: colors.success.base,
  },
  sessionTypePrice: {
    color: colors.secondaryText,
    textAlign: 'center' as const,
  },
  selectedSessionTypePrice: {
    color: colors.success.base,
  },
  durationContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: scale(12),
  },
  durationOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    borderRadius: scale(25),
    borderWidth: 1,
    borderColor: colors.grey300,
    backgroundColor: colors.primary_surface,
    minWidth: '45%',
  },
  selectedDuration: {
    borderColor: colors.success.base,
    backgroundColor: colors.success.light,
  },
  checkContainer: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: colors.secondaryText,
    backgroundColor: colors.primary_surface,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: scale(8),
  },
  selectedCheck: {
    borderColor: colors.success.base,
    backgroundColor: colors.success.base,
  },
  durationLabel: {
    color: colors.primaryText,
  },
  selectedDurationLabel: {
    color: colors.success.base,
  },
  costSummary: {
    backgroundColor: colors.backgroundLight,
    borderRadius: scale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
  },
  costRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: verticalScale(8),
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.grey300,
    paddingTop: verticalScale(8),
    marginTop: verticalScale(4),
  },
  costLabel: {
    color: colors.secondaryText,
  },
  costValue: {
    color: colors.primaryText,
  },
  totalLabel: {
    color: colors.primaryText,
  },
  totalValue: {
    color: colors.success.base,
  },
  warningContainer: {
    backgroundColor: colors.warning.light,
    borderRadius: scale(8),
    padding: moderateScale(12),
    marginBottom: verticalScale(16),
  },
  warningText: {
    color: colors.primaryText,
    textAlign: 'center' as const,
  },
  startButton: {
    borderRadius: scale(25),
    paddingVertical: verticalScale(14),
  },
};

export default RequestSessionModal;
