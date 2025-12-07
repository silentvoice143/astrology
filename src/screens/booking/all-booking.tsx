import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import {scale, scaleFont, verticalScale} from '../../utils/sizer';
import {COLORS} from '../../constants/colors';
import PageWithHeader from '../../componentsV1/layout/page-with-header';
import {textStyle} from '../../constants/text-style';
import DateTimePicker from '@react-native-community/datetimepicker';
import CalendarIcon from '../../assets/svgs/calendar-icon';
import {useNavigation} from '@react-navigation/native';

const TAGS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const;

// ✅ Booking Type
type Booking = {
  id: string;
  astrologerId: string;
  astrologerName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentDuration: number;
  reason: string;
  bookingType: 'ONLINE' | 'OFFLINE';
  sessionType: 'CHAT' | 'VIDEO' | 'CALL';
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
};

// ✅ Base Dummy Data
const DUMMY_BOOKINGS: Booking[] = [
  {
    id: '1',
    astrologerId: 'uuid-1',
    astrologerName: 'Dr. Rajesh Kumar',
    appointmentDate: '2025-12-09',
    appointmentTime: '10:00 AM',
    appointmentDuration: 15,
    reason: 'Marriage',
    bookingType: 'ONLINE',
    sessionType: 'CHAT',
    status: 'Pending',
  },
  {
    id: '2',
    astrologerId: 'uuid-2',
    astrologerName: 'Pandit Sharma',
    appointmentDate: '2025-12-08',
    appointmentTime: '2:30 PM',
    appointmentDuration: 30,
    reason: 'Career Guidance',
    bookingType: 'ONLINE',
    sessionType: 'VIDEO',
    status: 'Completed',
  },
  {
    id: '3',
    astrologerId: 'uuid-3',
    astrologerName: 'Astrologer Priya',
    appointmentDate: '2025-12-10',
    appointmentTime: '4:00 PM',
    appointmentDuration: 20,
    reason: 'Health Issues',
    bookingType: 'OFFLINE',
    sessionType: 'CALL',
    status: 'Confirmed',
  },
  {
    id: '4',
    astrologerId: 'uuid-4',
    astrologerName: 'Guruji Anil',
    appointmentDate: '2025-12-05',
    appointmentTime: '11:00 AM',
    appointmentDuration: 15,
    reason: 'Business',
    bookingType: 'ONLINE',
    sessionType: 'CHAT',
    status: 'Cancelled',
  },
  {
    id: '5',
    astrologerId: 'uuid-5',
    astrologerName: 'Dr. Meena Shah',
    appointmentDate: '2025-12-12',
    appointmentTime: '3:00 PM',
    appointmentDuration: 20,
    reason: 'Education',
    bookingType: 'ONLINE',
    sessionType: 'VIDEO',
    status: 'Pending',
  },
];

// ✅ Generate More Dummy Data (Pagination)
const generateMoreBookings = (startId: number, count: number): Booking[] => {
  const names = [
    'Dr. Rajesh Kumar',
    'Pandit Sharma',
    'Astrologer Priya',
    'Guruji Anil',
  ];
  const reasons = ['Marriage', 'Career Guidance', 'Health', 'Business'];
  const sessionTypes: Booking['sessionType'][] = ['CHAT', 'VIDEO', 'CALL'];
  const bookingTypes: Booking['bookingType'][] = ['ONLINE', 'OFFLINE'];
  const statuses: Booking['status'][] = [
    'Pending',
    'Confirmed',
    'Completed',
    'Cancelled',
  ];

  return Array.from({length: count}, (_, i) => ({
    id: `${startId + i}`,
    astrologerId: `uuid-${startId + i}`,
    astrologerName: names[Math.floor(Math.random() * names.length)],
    appointmentDate: `2025-12-${String(
      Math.floor(Math.random() * 28) + 1,
    ).padStart(2, '0')}`,
    appointmentTime: `${Math.floor(Math.random() * 12) + 1}:${
      ['00', '30'][Math.floor(Math.random() * 2)]
    } ${['AM', 'PM'][Math.floor(Math.random() * 2)]}`,
    appointmentDuration: [15, 20, 30][Math.floor(Math.random() * 3)],
    reason: reasons[Math.floor(Math.random() * reasons.length)],
    bookingType: bookingTypes[Math.floor(Math.random() * bookingTypes.length)],
    sessionType: sessionTypes[Math.floor(Math.random() * sessionTypes.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
};

const AllBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>(DUMMY_BOOKINGS);
  const [selectedTag, setSelectedTag] = useState<(typeof TAGS)[number]>('All');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  const navigation = useNavigation<any>();

  // ✅ FILTER LOGIC
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const tagMatch = selectedTag === 'All' || booking.status === selectedTag;
      const dateMatch =
        !selectedDate ||
        booking.appointmentDate === selectedDate.toISOString().split('T')[0];

      return tagMatch && dateMatch;
    });
  }, [bookings, selectedTag, selectedDate]);

  // ✅ PAGINATION
  const loadMoreBookings = () => {
    if (!hasMoreData || isLoadingMore) return;

    setIsLoadingMore(true);

    setTimeout(() => {
      const currentLength = bookings.length;
      const newBookings = generateMoreBookings(currentLength + 1, 10);

      setBookings(prev => [...prev, ...newBookings]);
      setIsLoadingMore(false);

      if (currentLength + 10 >= 50) {
        setHasMoreData(false);
      }
    }, 1200);
  };

  // ✅ STATUS COLOR
  const getStatusColor = (status: Booking['status']) => {
    if (status === 'Pending') return '#FFA726';
    if (status === 'Confirmed') return '#42A5F5';
    if (status === 'Completed') return '#4CAF50';
    if (status === 'Cancelled') return '#F44336';
    return COLORS.theme.gray.light;
  };

  // ✅ CANCEL BOOKING
  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(booking =>
        booking.id === bookingId ? {...booking, status: 'Cancelled'} : booking,
      ),
    );
  };

  // ✅ SESSION ICON
  const getSessionTypeIcon = (type: Booking['sessionType']) => {
    if (type === 'CHAT') return '💬';
    if (type === 'VIDEO') return '📹';
    return '📞';
  };

  // ✅ CLEAR DATE FILTER
  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  // ✅ RENDER ITEM
  const renderBookingCard = ({item}: {item: Booking}) => (
    <TouchableOpacity
      onPress={() => {}}
      activeOpacity={0.7}
      style={{
        backgroundColor: COLORS.theme.white,
        borderRadius: scale(12),
        padding: scale(16),
        marginBottom: verticalScale(12),
        borderWidth: 1,
        borderColor: COLORS.theme.gray.light,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
      {/* Header with Status */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: verticalScale(10),
        }}>
        <Text
          style={[
            textStyle.fs_mont_16_600,
            {color: COLORS.theme.black, flex: 1},
          ]}>
          {item.astrologerName}
        </Text>
        <View
          style={{
            backgroundColor: getStatusColor(item.status),
            paddingHorizontal: scale(10),
            paddingVertical: verticalScale(4),
            borderRadius: scale(12),
          }}>
          <Text
            style={{
              color: COLORS.theme.white,
              fontSize: scaleFont(12),
              fontWeight: '600',
            }}>
            {item.status}
          </Text>
        </View>
      </View>

      {/* Date and Time */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: verticalScale(6),
        }}>
        <Text
          style={{
            fontSize: scaleFont(14),
            color: COLORS.theme.black,
            fontWeight: '500',
          }}>
          📅 {item.appointmentDate}
        </Text>
        <Text
          style={{
            fontSize: scaleFont(14),
            color: COLORS.theme.black,
            marginLeft: scale(12),
            fontWeight: '500',
          }}>
          🕐 {item.appointmentTime}
        </Text>
      </View>

      {/* Session Details */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: verticalScale(8),
        }}>
        <Text style={{fontSize: scaleFont(14), color: COLORS.theme.black}}>
          {getSessionTypeIcon(item.sessionType)} {item.sessionType}
        </Text>
        <Text
          style={{
            fontSize: scaleFont(14),
            color: COLORS.theme.black,
            marginLeft: scale(12),
          }}>
          ⏱️ {item.appointmentDuration} mins
        </Text>
        <Text
          style={{
            fontSize: scaleFont(14),
            color: COLORS.theme.black,
            marginLeft: scale(12),
          }}>
          📍 {item.bookingType}
        </Text>
      </View>

      {/* Reason */}
      <View
        style={{
          backgroundColor: COLORS.theme.gray.light,
          paddingHorizontal: scale(10),
          paddingVertical: verticalScale(6),
          borderRadius: scale(8),
          alignSelf: 'flex-start',
        }}>
        <Text style={{fontSize: scaleFont(12), color: COLORS.theme.black}}>
          Reason: {item.reason}
        </Text>
      </View>

      {/* ✅ Cancel Button for Pending Bookings */}
      {item.status === 'Pending' && (
        <TouchableOpacity
          onPress={() => handleCancelBooking(item.id)}
          activeOpacity={0.7}
          style={{
            marginTop: verticalScale(12),
            backgroundColor: '#FF5252',
            paddingVertical: verticalScale(10),
            borderRadius: scale(8),
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#D32F2F',
          }}>
          <Text
            style={{
              color: COLORS.theme.white,
              fontSize: scaleFont(14),
              fontWeight: '700',
            }}>
            Cancel Booking
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderFooter = () =>
    isLoadingMore ? (
      <View
        style={{
          paddingVertical: verticalScale(20),
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" color={COLORS.theme.primary} />
        <Text
          style={{
            marginTop: verticalScale(8),
            fontSize: scaleFont(14),
            color: COLORS.theme.gray.light,
          }}>
          Loading more bookings...
        </Text>
      </View>
    ) : null;

  return (
    <PageWithHeader
      title={'My Bookings'}
      themeMode="light"
      scrollEnabled={false}>
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.theme.white,
        }}>
        {/* ✅ FIXED HEADER SECTION (Non-scrollable) */}
        <View
          style={{
            paddingHorizontal: scale(20),
            paddingTop: verticalScale(16),
            backgroundColor: COLORS.theme.white,
          }}>
          {/* Book Appointment Button */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('BookAppointment', {
                category: '',
                mode: 'ONLINE',
              });
            }}
            activeOpacity={0.8}
            style={{
              backgroundColor: COLORS.theme.primary,
              paddingVertical: verticalScale(14),
              borderRadius: scale(12),
              alignItems: 'center',
              marginBottom: verticalScale(16),
              shadowColor: COLORS.theme.primary,
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}>
            <Text
              style={{
                fontSize: scaleFont(16),
                fontWeight: '700',
                color: COLORS.theme.white,
              }}>
              + Book Appointment
            </Text>
          </TouchableOpacity>

          {/* Tags Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{
              marginBottom: verticalScale(16),
            }}
            contentContainerStyle={{
              paddingVertical: verticalScale(2),
            }}>
            {TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                onPress={() => setSelectedTag(tag)}
                activeOpacity={0.7}
                style={{
                  paddingHorizontal: scale(16),
                  paddingVertical: verticalScale(10),
                  borderRadius: scale(20),
                  backgroundColor:
                    selectedTag === tag
                      ? COLORS.theme.primary
                      : COLORS.theme.white,
                  borderWidth: 1.5,
                  borderColor:
                    selectedTag === tag
                      ? COLORS.theme.primary
                      : COLORS.theme.gray.light,
                  marginRight: scale(10),
                }}>
                <Text
                  style={{
                    color:
                      selectedTag === tag
                        ? COLORS.theme.white
                        : COLORS.theme.black,
                    fontWeight: '600',
                    fontSize: scaleFont(14),
                  }}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ✅ Attractive Date Picker Button */}
          <TouchableOpacity
            onPress={() => setShowCalendar(true)}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: selectedDate
                ? COLORS.theme.primary + '15'
                : COLORS.theme.white,
              borderWidth: 1.5,
              borderColor: selectedDate
                ? COLORS.theme.primary
                : COLORS.theme.gray.light,
              borderRadius: scale(12),
              paddingVertical: verticalScale(14),
              paddingHorizontal: scale(16),
              marginBottom: verticalScale(16),
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              {/* <Text style={{fontSize: scaleFont(20), marginRight: scale(10)}}>
                📅
              </Text> */}
              <View style={{marginRight: scale(10)}}>
                <CalendarIcon color={COLORS.theme.gray.light} />
              </View>
              <Text
                style={{
                  fontSize: scaleFont(15),
                  color: selectedDate
                    ? COLORS.theme.primary
                    : COLORS.theme.gray.light,
                  fontWeight: selectedDate ? '600' : '500',
                }}>
                {selectedDate
                  ? selectedDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Filter by Date'}
              </Text>
            </View>

            {/* Clear Date Button */}
            {selectedDate && (
              <TouchableOpacity
                onPress={clearDateFilter}
                style={{
                  backgroundColor: COLORS.theme.primary,
                  borderRadius: scale(16),
                  width: scale(28),
                  height: scale(28),
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: scale(8),
                }}>
                <Text
                  style={{
                    color: COLORS.theme.white,
                    fontSize: scaleFont(16),
                    fontWeight: '700',
                  }}>
                  ✕
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {showCalendar && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="default"
              onChange={(e, date) => {
                setShowCalendar(false);
                if (date) setSelectedDate(date);
              }}
            />
          )}

          {/* Bookings Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: verticalScale(12),
            }}>
            <Text
              style={[textStyle.fs_mont_16_600, {color: COLORS.theme.black}]}>
              My Bookings
            </Text>
            <View
              style={{
                backgroundColor: COLORS.theme.primary,
                paddingHorizontal: scale(10),
                paddingVertical: verticalScale(4),
                borderRadius: scale(12),
              }}>
              <Text
                style={{
                  color: COLORS.theme.white,
                  fontSize: scaleFont(12),
                  fontWeight: '600',
                }}>
                {filteredBookings.length}
              </Text>
            </View>
          </View>
        </View>

        {/* ✅ SCROLLABLE LIST SECTION */}
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingCard}
          keyExtractor={item => item.id}
          onEndReached={loadMoreBookings}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: scale(20),
            paddingBottom: verticalScale(20),
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: verticalScale(60),
              }}>
              <Text
                style={{
                  fontSize: scaleFont(16),
                  color: COLORS.theme.gray.light,
                  fontWeight: '500',
                }}>
                No bookings found.
              </Text>
            </View>
          }
        />
      </View>
    </PageWithHeader>
  );
};

export default AllBookings;
