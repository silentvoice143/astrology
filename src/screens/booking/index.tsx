import {View, Text, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Calendar} from 'react-native-calendars';
import PageWithHeader from '../../componentsV1/layout/page-with-header';
import {scale, verticalScale, scaleFont} from '../../utils/sizer';
import {COLORS} from '../../constants/colors';
import {useRoute} from '@react-navigation/native';
import ControlledTagSelector from '../../components/controlled-tag-selector';
import {set} from 'date-fns';
import {useAppDispatch} from '../../hooks/redux-hook';
import {getAllAstrologers} from '../../store/reducer/astrologers';
import {get} from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import {bookAppointmentReq} from '../../store/reducer/booking';
import Toast from 'react-native-toast-message';

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
  {id: 'OFFLINE', label: 'Offline', icon: '🔴'},
];

const sessionTypeTags = [
  {id: 'VIDEO', label: 'Video', icon: '📹'},
  {id: 'VOICE', label: 'Voice', icon: '🎤'},
  {id: 'CHAT', label: 'Chat', icon: '💬'},
];

const Booking = () => {
  const route = useRoute();
  const category =
    (route.params as {category: string; mode: 'ONLINE' | 'OFFLINE'})
      ?.category || 'all';
  const mode =
    (route.params as {mode: 'ONLINE' | 'OFFLINE'; category: string})?.mode ||
    '';
  console.log('Booking route params:', route.params);
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
  const [astrologersData, setAstrologersData] = useState<any[]>([]);

  const dispatch = useAppDispatch();

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
      return astrologersData[0]?.pricePerMinuteVideo ?? 0;
    } else if (sessionType.includes('VOICE')) {
      return astrologersData[0]?.pricePerMinuteVoice ?? 0;
    } else {
      return astrologersData[0]?.pricePerMinuteChat ?? 0;
    }
  }

  useEffect(() => {
    if (mode) {
      setBookingType([mode]);
    }
  }, [route.params]);

  const handleBooking = async () => {
    // Implement booking logic here
    try {
      setLoading(true);
      const body = {
        appointmentDate: selectedDate,
        reason: category ? category : 'all',
        astrologerId: astrologersData[0]?.id,
        appointmentDuration: totalMinutes,
        sessionType: bookinType[0] === 'ONLINE' ? sessionType[0] : '',
        bookingType: bookinType[0],
      };
      // const payload = await dispatch(bookAppointmentReq(body)).unwrap();

      // console.log('Booking details:', payload, body);
      Toast.show({
        type: 'success',
        text1: 'Appointment booked successfully!',
      });
      resetBookingState();
    } catch (err) {
    } finally {
      setLoading(false);
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

      const payload = await dispatch(
        getAllAstrologers(`?page=${pageNumber}&search=${search}&sort=${''}`),
      ).unwrap();
      if (payload.success) {
        console.log('Fetched astrologers:', payload);
        const newData = payload.astrologers || [];
        setAstrologersData(prev => (append ? [...prev, ...newData] : newData));
        setPage(payload.currentPage);
        setHasMore(!payload.isLastPage);
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

  console.log(
    !selectedDate,
    loading,
    bookinType[0] === 'ONLINE' && selectedSlots.length === 0,
  );
  const isAppointmentDisabled =
    !selectedDate ||
    loading ||
    (bookinType[0] === 'ONLINE' && selectedSlots.length === 0);
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
          disabled={!bookinType.length || bookinType[0] === 'OFFLINE'}
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
      </View>
    </PageWithHeader>
  );
};

export default Booking;
