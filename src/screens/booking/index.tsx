import {View, Text, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Calendar} from 'react-native-calendars';
import PageWithHeader from '../../componentsV1/layout/page-with-header';
import {scale, verticalScale, scaleFont} from '../../utils/sizer';
import {COLORS} from '../../constants/colors';
import {useRoute} from '@react-navigation/native';
import ControlledTagSelector from '../../components/controlled-tag-selector';
import {useAppDispatch, useAppSelector} from '../../hooks/redux-hook';
import {
  getAllAstrologerById,
  getAllAstrologers,
} from '../../store/reducer/astrologers';
import {bookAppointmentReq} from '../../store/reducer/booking';
import Toast from 'react-native-toast-message';
import dayjs from 'dayjs';
import {navigate} from '../../utils/navigation';
import {setWalletBalance} from '../../store/reducer/user';
import {setBalance} from '../../store/reducer/auth';
import {getTransactionHistory} from '../../store/reducer/payment';

const TIME_SLOTS = [
  {label: '5 min', value: 5},
  {label: '10 min', value: 10},
  {label: '15 min', value: 15},
  {label: '30 min', value: 30},
  {label: '45 min', value: 45},
  {label: '1 hr', value: 60},
];

const COST_PER_MINUTE = 20; // Example: ₹20/min

const availabilityTags = [
  {id: 'ONLINE', label: 'Online', icon: '🟢'},
  // {id: 'OFFLINE', label: 'Offline', icon: '🔴'},
];

const Booking = () => {
  const [sessionTypeTags, setSessionTypeTags] = useState([
    {id: 'VIDEO', label: 'Video', icon: '📹', disabled: false},
    {id: 'AUDIO', label: 'AUDIO', icon: '🎤', disabled: false},
    {id: 'CHAT', label: 'Chat', icon: '💬', disabled: false},
  ]);
  const route = useRoute();
  const category =
    (route.params as {category: string; mode: 'ONLINE' | 'OFFLINE'; id: string})
      ?.category || 'all';
  const mode =
    (route.params as {mode: 'ONLINE' | 'OFFLINE'; category: string; id: string})
      ?.mode || '';
  const id =
    (route.params as {mode: 'ONLINE' | 'OFFLINE'; category: string; id: string})
      ?.id || '';

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [bookinType, setBookingType] = useState(mode ? [mode] : ['ONLINE']);
  const [sessionType, setSessionType] = useState<any>(['VIDEO']);
  const [loading, setLoading] = useState(false);

  //astrologers fetch state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [loadingAstrologerData, setLoadingAstrologerData] = useState(false);
  const [astrologersData, setAstrologersData] = useState<any>(null);

  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user);

  const toggleSlot = (value: number) => {
    if (selectedSlots.includes(value)) {
      setSelectedSlots(selectedSlots.filter(item => item !== value));
    } else {
      setSelectedSlots([...selectedSlots, value]);
    }
  };

  const resetBookingState = () => {
    setSelectedDate('');
    setSelectedSlots([]);
    setBookingType(mode ? [mode] : ['ONLINE']);
    setSessionType(['VIDEO']);
    setLoading(false);
  };

  const totalMinutes = selectedSlots.reduce((a, b) => a + b, 0);
  const totalCost = totalMinutes * getCostPerMin();

  function getCostPerMin() {
    // You can modify this function to calculate cost based on different criteria
    if (sessionType.includes('VIDEO')) {
      return astrologersData?.pricePerMinuteVideo ?? 0;
    } else if (sessionType.includes('AUDIO')) {
      return astrologersData?.pricePerMinuteVoice ?? 0;
    } else {
      return astrologersData?.pricePerMinuteChat ?? 0;
    }
  }

  useEffect(() => {
    if (mode) {
      setBookingType([mode]);
    }
  }, [route.params]);

  const getTransactionDetails = async () => {
    try {
      setLoading(true);
      console.log('Transaction getting');
      const payload = await dispatch(
        getTransactionHistory({query: `?page=1`}),
      ).unwrap();
      console.log('Transaction Payload: ', payload);

      if (payload.success) {
        dispatch(
          setBalance({
            balance: (((payload?.wallet?.balance ?? 0) as number) -
              (payload?.wallet?.lockedBalance ?? 0)) as number,
          }),
        );

        dispatch(
          setWalletBalance(
            (((payload?.wallet?.balance ?? 0) as number) -
              (payload?.wallet?.lockedBalance ?? 0)) as number,
          ),
        );
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to get transactions',
        });
      }
    } catch (err) {
      console.log(err);
      Toast.show({
        type: 'error',
        text1: 'Failed to get transactions',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    // Implement booking logic here
    try {
      setLoading(true);
      const body = {
        appointmentDate: selectedDate,
        reason: category ? category : 'all',
        astrologerId: astrologersData?.user?.id,
        appointmentDuration: totalMinutes,
        sessionType: bookinType[0] === 'ONLINE' ? sessionType[0] : 'CHAT',
        bookingType: bookinType[0],
      };

      const payload = await dispatch(bookAppointmentReq(body)).unwrap();
      if (payload.success) {
        Toast.show({
          type: 'success',
          text1: 'Appointment booked successfully!',
        });
        resetBookingState();
        getTransactionDetails();
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      getTransactionDetails();
    }
  };

  const fetchAstrologersData = async (
    pageNumber = 1,
    append = false,
    search = '',
  ) => {
    if (loadingAstrologerData || isFetchingMore || (!hasMore && append)) return;
    try {
      if (append) setIsFetchingMore(true);
      else setLoadingAstrologerData(true);
      if (!id) return;

      const payload = await dispatch(getAllAstrologerById({id: id})).unwrap();

      console.log(payload, 'payload');
      if (payload.success) {
        console.log('Fetched astrologers:', payload);
        const newData = payload.astrologer;
        const astrologer = payload.astrologer;
        const sessionTypeTags = [
          {
            id: 'VIDEO',
            label: 'Video',
            icon: '📹',
            disabled: !astrologer.isVideoOnline,
          },
          {
            id: 'AUDIO',
            label: 'Audio',
            icon: '🎤',
            disabled: !astrologer.isAudioOnline,
          },
          {
            id: 'CHAT',
            label: 'Chat',
            icon: '💬',
            disabled: !astrologer.isChatOnline,
          },
        ];
        const availableSession = sessionTypeTags.find(
          session => !session.disabled,
        );

        setSessionType(availableSession?.id ? [availableSession?.id] : []);
        setSessionTypeTags(sessionTypeTags);
        setAstrologersData(newData);
      }
    } catch (error) {
    } finally {
      if (append) setIsFetchingMore(false);
      else setLoadingAstrologerData(false);
    }
  };

  useEffect(() => {
    fetchAstrologersData(1, false, '');
  }, []);

  const isAppointmentDisabled =
    !selectedDate ||
    loading ||
    (bookinType[0] === 'ONLINE' && selectedSlots.length === 0);

  const today = dayjs().format('YYYY-MM-DD');
  console.log(bookinType, '---booking type');
  return (
    <PageWithHeader themeMode="light" title="Book Appointment">
      <View
        style={{
          paddingHorizontal: scale(20),
          paddingBottom: verticalScale(20),
          paddingTop: verticalScale(20),
          backgroundColor: COLORS.theme.white,
          flex: 1,
        }}>
        {/* Calendar */}
        <Calendar
          minDate={today}
          style={{
            borderWidth: 1,
            borderColor: COLORS.theme.secondary,
            borderRadius: scale(12),
          }}
          onDayPress={(day: any) => {
            setSelectedDate(day.dateString);
          }}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: COLORS.theme.primary,
            },
          }}
        />

        {/* Date Display */}
        {selectedDate ? (
          <Text
            style={{
              marginTop: verticalScale(16),
              fontSize: scaleFont(16),
              fontWeight: '600',
            }}>
            Selected Date: {selectedDate}
          </Text>
        ) : null}

        <ControlledTagSelector
          disabled={loadingAstrologerData}
          tags={availabilityTags}
          selectedTags={bookinType}
          onChange={setBookingType}
          multiSelect={false}
          label="Select Booking Type"
        />

        <ControlledTagSelector
          tags={sessionTypeTags}
          selectedTags={sessionType}
          onChange={data => {
            console.log('Selected session type:', data);
            setSessionType(data);
          }}
          multiSelect={false}
          label="Select Session Type"
          disabled={
            !bookinType.length ||
            bookinType[0] === 'OFFLINE' ||
            loadingAstrologerData
          }
        />

        {/* Time Slot Selection */}
        {bookinType[0] === 'ONLINE' && (
          <View>
            <Text
              style={{
                marginTop: verticalScale(24),
                fontSize: scaleFont(18),
                fontWeight: '700',
              }}>
              Select Duration
            </Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: scale(10),
                marginTop: verticalScale(12),
              }}>
              {TIME_SLOTS.map(slot => {
                const isSelected = selectedSlots.includes(slot.value);
                return (
                  <TouchableOpacity
                    key={slot.value}
                    onPress={() => toggleSlot(slot.value)}
                    style={{
                      paddingVertical: verticalScale(10),
                      paddingHorizontal: scale(14),
                      borderRadius: scale(8),
                      borderWidth: 1,
                      borderColor: isSelected
                        ? COLORS.theme.primary
                        : COLORS.theme.secondary,
                      backgroundColor: isSelected
                        ? COLORS.theme.primary
                        : COLORS.theme.white,
                    }}>
                    <Text
                      style={{
                        fontSize: scaleFont(14),
                        color: isSelected
                          ? COLORS.theme.white
                          : COLORS.theme.black,
                        fontWeight: '600',
                      }}>
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Cost Summary */}
        {bookinType[0] === 'ONLINE' && selectedSlots.length > 0 && (
          <View
            style={{
              marginTop: verticalScale(30),
              padding: scale(16),
              backgroundColor: COLORS.theme.secondary,
              borderRadius: scale(12),
            }}>
            <Text style={{fontSize: scaleFont(16), fontWeight: '700'}}>
              Total Duration: {totalMinutes} minutes
            </Text>
            <Text
              style={{
                fontSize: scaleFont(18),
                marginTop: verticalScale(6),
                color: COLORS.theme.primary,
                fontWeight: '800',
              }}>
              Total Cost: ₹{totalCost}
            </Text>
          </View>
        )}

        {/* Button */}
        {/* <TouchableOpacity
          onPress={handleBooking}
          disabled={isAppointmentDisabled}
          style={{
            marginTop: verticalScale(24),
            backgroundColor: isAppointmentDisabled
              ? '#ccc'
              : COLORS.theme.primary,
            paddingVertical: verticalScale(14),
            borderRadius: scale(12),
            alignItems: 'center',
            marginBottom: verticalScale(80),
          }}>
          <Text
            style={{
              fontSize: scaleFont(16),
              fontWeight: '700',
              color: isAppointmentDisabled ? '#666' : COLORS.theme.white,
            }}>
            {loading ? 'Booking...' : 'Book Appointment'}
          </Text>
        </TouchableOpacity> */}
        {user.walletBalance! < totalCost ? (
          <TouchableOpacity
            onPress={() => navigate('Wallet')}
            style={{
              marginTop: verticalScale(24),
              backgroundColor: isAppointmentDisabled
                ? '#ccc'
                : COLORS.theme.primary,
              paddingVertical: verticalScale(14),
              borderRadius: scale(12),
              alignItems: 'center',
              marginBottom: verticalScale(80),
            }}>
            <Text
              style={{
                fontSize: scaleFont(16),
                fontWeight: '700',
                color: isAppointmentDisabled ? '#666' : COLORS.theme.white,
              }}>
              Recharge
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleBooking}
            disabled={isAppointmentDisabled}
            style={{
              marginTop: verticalScale(24),
              backgroundColor: isAppointmentDisabled
                ? '#ccc'
                : COLORS.theme.primary,
              paddingVertical: verticalScale(14),
              borderRadius: scale(12),
              alignItems: 'center',
              marginBottom: verticalScale(80),
            }}>
            <Text
              style={{
                fontSize: scaleFont(16),
                fontWeight: '700',
                color: isAppointmentDisabled ? '#666' : COLORS.theme.white,
              }}>
              {loading ? 'Booking...' : 'Book Appointment'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </PageWithHeader>
  );
};

export default Booking;
