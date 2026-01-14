// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   FlatList,
//   ActivityIndicator,
//   Image,
//   RefreshControl,
// } from 'react-native';
// import React, {useCallback, useEffect, useMemo, useState} from 'react';
// import {scale, scaleFont, verticalScale} from '../../utils/sizer';
// import {COLORS} from '../../constants/colors';
// import PageWithHeader from '../../componentsV1/layout/page-with-header';
// import {textStyle} from '../../constants/text-style';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import CalendarIcon from '../../assets/svgs/calendar-icon';
// import {
//   useFocusEffect,
//   useNavigation,
//   useRoute,
// } from '@react-navigation/native';
// import {useAppDispatch} from '../../hooks/redux-hook';
// import {getMyAppointment} from '../../store/reducer/booking';
// import {cancelMyAppointment} from '../../store/reducer/booking/action';

// const TAGS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const;

// /* ✅ API BOOKING TYPE */
// type Booking = {
//   id: string;
//   appointmentDate: string;
//   appointmentDuration: number;
//   reason: string;
//   status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
//   bookingType: 'ONLINE' | 'OFFLINE';
//   sessionType: 'CHAT' | 'VIDEO' | 'CALL';
//   chatSessionId: string | null;
//   callSessionId: string | null;
//   totalCost: number;
//   astrologer: {
//     id: string;
//     name: string;
//     imgUri: string | null;
//   };
// };

// const AllBookings = () => {
//   const route = useRoute();
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [selectedTag, setSelectedTag] = useState<(typeof TAGS)[number]>('All');
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [showCalendar, setShowCalendar] = useState(false);

//   const [page, setPage] = useState(1);
//   const [isLastPage, setIsLastPage] = useState(false);
//   const [isLoadingMore, setIsLoadingMore] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   const navigation = useNavigation<any>();
//   const dispatch = useAppDispatch();

//   /* ✅ BACKEND PAGINATION */
//   const getBookingData = async (pageNumber: number, isRefresh = false) => {
//     try {
//       if (isLoadingMore || (isLastPage && !isRefresh)) return;

//       setIsLoadingMore(true);

//       const payload = await dispatch(
//         getMyAppointment({page: pageNumber, limit: 10}),
//       ).unwrap();
//       console.log('Booking payload:', payload);
//       if (payload.success) {
//         const newBookings: Booking[] = payload.appointments.map(
//           (item: any) => ({
//             id: item.id,
//             appointmentDate: item.appointmentDate,
//             appointmentDuration: item.appointmentDuration,
//             reason: item.reason,
//             status: item.status || 'Pending',
//             bookingType: item.bookingType || 'ONLINE',
//             sessionType: item.sessionType,
//             chatSessionId: item.chatSessionId,
//             callSessionId: item.callSessionId,
//             totalCost: item.totalCost,
//             astrologer: {
//               id: item.astrologer.id,
//               name: item.astrologer.name,
//               imgUri: item.astrologer.imgUri,
//             },
//           }),
//         );

//         setBookings(prev =>
//           pageNumber === 1 ? newBookings : [...prev, ...newBookings],
//         );

//         setIsLastPage(payload.isLastPage);
//         setPage(pageNumber);
//       }
//     } catch (err) {
//       console.log('Booking fetch error:', err);
//     } finally {
//       setIsLoadingMore(false);
//       setRefreshing(false);
//     }
//   };

//   // useEffect(() => {
//   //   getBookingData(1);
//   // }, [route.name]);

//   useFocusEffect(
//     useCallback(() => {
//       // reset paging when focusing (optional)
//       setIsLastPage(false);
//       getBookingData(1, true);

//       // optional cleanup on blur
//       return () => {
//         // nothing specific to cleanup for now
//       };
//     }, [getBookingData]),
//   );

//   /* ✅ PULL TO REFRESH */
//   const onRefresh = () => {
//     setRefreshing(true);
//     setIsLastPage(false);
//     getBookingData(1, true);
//   };

//   /* ✅ FILTER */
//   const filteredBookings = useMemo(() => {
//     return bookings.filter(item => {
//       const tagMatch = selectedTag === 'All' || item.status === selectedTag;

//       const dateMatch =
//         !selectedDate ||
//         item.appointmentDate === selectedDate.toISOString().split('T')[0];

//       return tagMatch && dateMatch;
//     });
//   }, [bookings, selectedTag, selectedDate]);

//   /* ✅ CALENDAR STATUS BADGE */
//   const selectedDateHasBooking =
//     selectedDate &&
//     bookings.some(
//       b => b.appointmentDate === selectedDate.toISOString().split('T')[0],
//     );

//   /* ✅ LOAD MORE */
//   const loadMoreBookings = () => {
//     if (!isLastPage && !isLoadingMore) {
//       getBookingData(page + 1);
//     }
//   };

//   /* ✅ HELPERS */
//   const getStatusColor = (status: Booking['status']) => {
//     if (status === 'PENDING') return '#FFA726';
//     if (status === 'APPROVED') return '#42A5F5';
//     if (status === 'COMPLETED') return '#4CAF50';
//     if (status === 'CANCELLED') return '#F44336';
//     return COLORS.theme.gray.light;
//   };

//   const getSessionTypeIcon = (type: Booking['sessionType']) => {
//     if (type === 'CHAT') return '💬';
//     if (type === 'VIDEO') return '📹';
//     return '📞';
//   };

//   /* ✅ JOIN SESSION HANDLER */
//   const handleJoinSession = (item: Booking) => {
//     if (item.sessionType === 'CHAT' && item.chatSessionId) {
//       navigation.navigate('ChatScreen', {
//         sessionId: item.chatSessionId,
//       });
//     } else if (
//       (item.sessionType === 'CALL' || item.sessionType === 'VIDEO') &&
//       item.callSessionId
//     ) {
//       navigation.navigate('CallScreen', {
//         sessionId: item.callSessionId,
//         type: item.sessionType,
//       });
//     }
//   };

//   /* ✅ CANCEL (UI ONLY) */
//   const handleCancelBooking = async (id: string) => {
//     try {
//       const {payload} = await dispatch(
//         cancelMyAppointment({id, body: {status: 'CANCELLED', otp: null}}),
//       );
//       console.log(payload, '------canceled');
//       if (payload.success) {
//         setBookings(prev =>
//           prev.map(item =>
//             item.id === id ? {...item, status: 'CANCELLED'} : item,
//           ),
//         );
//       }
//     } catch (err) {}
//   };

//   /* ✅ CARD UI */
//   const renderBookingCard = ({item}: {item: Booking}) => {
//     const isJoinDisabled =
//       (item.sessionType === 'CHAT' && !item.chatSessionId) ||
//       ((item.sessionType === 'CALL' || item.sessionType === 'VIDEO') &&
//         !item.callSessionId);

//     return (
//       <View
//         style={{
//           backgroundColor: COLORS.theme.white,
//           borderRadius: scale(14),
//           padding: scale(16),
//           marginBottom: verticalScale(14),
//           borderWidth: 1,
//           borderColor: COLORS.theme.gray.light,
//         }}>
//         {/* HEADER */}
//         <View style={{flexDirection: 'row', alignItems: 'center'}}>
//           <Image
//             source={{
//               uri:
//                 item.astrologer.imgUri ||
//                 'https://i.postimg.cc/52hKjTgP/user.png',
//             }}
//             style={{
//               width: scale(46),
//               height: scale(46),
//               borderRadius: 100,
//               marginRight: scale(12),
//             }}
//           />

//           <View style={{flex: 1}}>
//             <Text style={[textStyle.fs_mont_16_600]}>
//               {item.astrologer.name}
//             </Text>
//             <Text style={{fontSize: scaleFont(12), marginTop: 2}}>
//               {getSessionTypeIcon(item.sessionType)} {item.sessionType}
//             </Text>
//           </View>

//           <View
//             style={{
//               backgroundColor: getStatusColor(item.status),
//               paddingHorizontal: scale(10),
//               paddingVertical: verticalScale(4),
//               borderRadius: scale(12),
//             }}>
//             <Text style={{color: '#fff'}}>{item.status}</Text>
//           </View>
//         </View>

//         {/* INFO */}
//         <Text style={{marginTop: 10}}>
//           📅 {item.appointmentDate} ⏱️ {item.appointmentDuration} mins
//         </Text>

//         <Text style={{marginTop: 6}}>Reason: {item.reason}</Text>

//         {/* ✅ JOIN BUTTON */}
//         {(item.status === 'Confirmed' || item.status === 'Completed') && (
//           <TouchableOpacity
//             disabled={isJoinDisabled}
//             onPress={() => handleJoinSession(item)}
//             style={{
//               marginTop: 14,
//               backgroundColor: isJoinDisabled
//                 ? COLORS.theme.gray.light
//                 : COLORS.theme.primary,
//               paddingVertical: 10,
//               borderRadius: 10,
//               alignItems: 'center',
//             }}>
//             <Text style={{color: '#fff', fontWeight: '600'}}>
//               {isJoinDisabled
//                 ? 'Waiting for Session ID'
//                 : `Join ${item.sessionType}`}
//             </Text>
//           </TouchableOpacity>
//         )}

//         {/* ✅ CANCEL */}
//         {item.status === 'Pending' && (
//           <TouchableOpacity
//             onPress={() => handleCancelBooking(item.id)}
//             style={{
//               marginTop: 14,
//               backgroundColor: '#FF5252',
//               paddingVertical: 10,
//               borderRadius: 10,
//               alignItems: 'center',
//             }}>
//             <Text style={{color: '#fff'}}>Cancel Booking</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     );
//   };

//   return (
//     <PageWithHeader
//       title={'My Bookings'}
//       themeMode="light"
//       scrollEnabled={false}>
//       <View style={{flex: 1, backgroundColor: COLORS.theme.white}}>
//         <TouchableOpacity
//           onPress={() =>
//             navigation.navigate('BookAppointment', {
//               category: '',
//               mode: 'ONLINE',
//             })
//           }
//           style={{
//             backgroundColor: COLORS.theme.primary,
//             margin: 20,
//             padding: 14,
//             borderRadius: 12,
//             alignItems: 'center',
//           }}>
//           <Text style={{color: '#fff'}}>+ Book Appointment</Text>
//         </TouchableOpacity>

//         {/* TAG FILTER */}
//         {/* <View style={{paddingHorizontal: 20, marginBottom: verticalScale(12)}}>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//             {TAGS.map(tag => (
//               <TouchableOpacity
//                 key={tag}
//                 onPress={() => setSelectedTag(tag)}
//                 style={{
//                   paddingHorizontal: 16,
//                   paddingVertical: 8,
//                   borderRadius: 20,
//                   backgroundColor:
//                     selectedTag === tag
//                       ? COLORS.theme.primary
//                       : COLORS.theme.white,
//                 }}>
//                 <Text
//                   style={{
//                     color: selectedTag === tag ? '#fff' : COLORS.theme.black,
//                   }}>
//                   {tag}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View> */}
//         {/* DATE FILTER WITH BADGE */}
//         {/* <TouchableOpacity
//           onPress={() => setShowCalendar(true)}
//           style={{
//             margin: 20,
//             flexDirection: 'row',
//             alignItems: 'center',
//           }}>
//           <CalendarIcon />
//           <Text style={{marginLeft: 10}}>
//             {selectedDate ? selectedDate.toDateString() : 'Filter by Date'}
//           </Text>

//           {selectedDateHasBooking && (
//             <View
//               style={{
//                 width: scale(8),
//                 height: scale(8),
//                 borderRadius: 50,
//                 backgroundColor: COLORS.theme.primary,
//                 marginLeft: 8,
//               }}
//             />
//           )}
//         </TouchableOpacity> */}

//         {showCalendar && (
//           <DateTimePicker
//             value={selectedDate || new Date()}
//             mode="date"
//             display="default"
//             onChange={(e, date) => {
//               setShowCalendar(false);
//               if (date) setSelectedDate(date);
//             }}
//           />
//         )}

//         {/* BOOKINGS LIST */}
//         <FlatList
//           data={filteredBookings}
//           renderItem={renderBookingCard}
//           keyExtractor={item => item.id}
//           onEndReached={loadMoreBookings}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//           }
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{
//             padding: 20,
//             backgroundColor: COLORS.theme.white,
//             flexGrow: 1,
//             paddingBottom: verticalScale(80),
//           }}
//           ListEmptyComponent={
//             <Text style={{textAlign: 'center', marginTop: 40}}>
//               No bookings found
//             </Text>
//           }
//         />
//       </View>
//     </PageWithHeader>
//   );
// };

// export default AllBookings;

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import {scale, scaleFont, verticalScale} from '../../utils/sizer';
import {COLORS} from '../../constants/colors';
import PageWithHeader from '../../componentsV1/layout/page-with-header';
import {textStyle} from '../../constants/text-style';
import DateTimePicker from '@react-native-community/datetimepicker';
import CalendarIcon from '../../assets/svgs/calendar-icon';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {useAppDispatch} from '../../hooks/redux-hook';
import {getMyAppointment} from '../../store/reducer/booking';
import {cancelMyAppointment} from '../../store/reducer/booking/action';
import {setOtherUser, setSession} from '../../store/reducer/session';
import {ZegoSendCallInvitationButton} from '@zegocloud/zego-uikit-prebuilt-call-rn';
import Config from 'react-native-config';

const TAGS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const;

type Booking = {
  id: string;
  appointmentDate: string;
  appointmentDuration: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED' | string;
  bookingType: 'ONLINE' | 'OFFLINE';
  sessionType: 'CHAT' | 'VIDEO' | 'AUDIO';
  chatSessionId: string | null;
  callSessionId: string | null;
  totalCost: number;
  astrologer: {
    id: string;
    name: string;
    imgUri: string | null;
    mobile: string;
  };
  chatSession: any;
  callSession: any;
};

const LIMIT = 10;

const AllBookings = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const zegoAudioButtonRef = useRef<any>(null);
  const zegoVideoButtonRef = useRef<any>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedTag, setSelectedTag] = useState<(typeof TAGS)[number]>('All');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const [page, setPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // refs to hold latest values for use inside getBookingData (avoid stale-closure loops)
  const isLoadingMoreRef = useRef(isLoadingMore);
  const isLastPageRef = useRef(isLastPage);

  useEffect(() => {
    isLoadingMoreRef.current = isLoadingMore;
  }, [isLoadingMore]);

  useEffect(() => {
    isLastPageRef.current = isLastPage;
  }, [isLastPage]);

  // Stable fetch function — depends only on dispatch
  const getBookingData = useCallback(
    async (pageNumber: number, isRefresh = false) => {
      try {
        // Respect current flags via refs to avoid depending on them in deps
        if (isLoadingMoreRef.current && !isRefresh) return;
        if (isLastPageRef.current && !isRefresh && pageNumber !== 1) return;

        if (pageNumber === 1) {
          setRefreshing(true);
        } else {
          setIsLoadingMore(true);
        }

        const payload = await dispatch(
          getMyAppointment({page: pageNumber, limit: LIMIT}),
        ).unwrap();

        console.log('Booking payload:', payload);
        if (payload?.success) {
          console.log(payload, '---------payload');
          const newBookings: Booking[] = (payload.appointments || []).map(
            (item: any) => ({
              id: item.id,
              appointmentDate: item.appointmentDate,
              appointmentDuration: item.appointmentDuration,
              reason: item.reason,
              status: item.status ?? 'PENDING',
              bookingType: item.bookingType ?? 'ONLINE',
              sessionType: item.sessionType,
              chatSessionId: item?.chatSession?.id ?? null,
              callSessionId: item?.callSession?.id ?? null,
              chatSession: item?.chatSession,
              callSession: item?.callSession,
              totalCost: item.totalCost,
              astrologer: {
                id: item.astrologer?.id ?? '',
                name: item.astrologer?.name ?? 'Astrologer',
                imgUri: item.astrologer?.imgUri ?? null,
              },
            }),
          );

          setBookings(prev =>
            pageNumber === 1 ? newBookings : [...prev, ...newBookings],
          );

          setIsLastPage(Boolean(payload.isLastPage));
          setPage(payload.currentPage ?? pageNumber);
        } else {
          console.warn('getMyAppointment returned success:false', payload);
        }
      } catch (err) {
        console.log('Booking fetch error:', err);
      } finally {
        setIsLoadingMore(false);
        setRefreshing(false);
      }
    },
    [dispatch],
  );

  // fetch on screen focus (this will run when the screen becomes active)
  useFocusEffect(
    useCallback(() => {
      // reset paging on focus (optional)
      setIsLastPage(false);
      // fetch fresh data
      getBookingData(1, true);
      // no cleanup necessary
      return;
    }, [getBookingData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setIsLastPage(false);
    getBookingData(1, true);
  }, [getBookingData]);

  const loadMoreBookings = useCallback(() => {
    if (isLoadingMoreRef.current || isLastPageRef.current) return;
    getBookingData(page + 1);
  }, [getBookingData, page]);

  const getStatusColor = (status: Booking['status']) => {
    if (status === 'PENDING') return '#FFA726';
    if (status === 'APPROVED' || status === 'Confirmed') return '#42A5F5';
    if (status === 'COMPLETED') return '#4CAF50';
    if (status === 'CANCELLED') return '#F44336';
    return COLORS.theme.gray.light;
  };
  console.log(bookings, '===bookings');

  const getSessionTypeIcon = (type: Booking['sessionType']) => {
    if (type === 'CHAT') return '💬';
    if (type === 'VIDEO') return '📹';
    return '📞';
  };

  const handleJoinSession = (item: Booking) => {
    if (item.sessionType === 'CHAT' && item.chatSessionId) {
      dispatch(setSession(item.chatSession));
      dispatch(setOtherUser(item.chatSession.astrologer));
      navigation.navigate('ChatScreen', {
        sessionId: item.chatSessionId,
      });
    } else if (
      (item.sessionType === 'AUDIO' || item.sessionType === 'VIDEO') &&
      item.callSessionId
    ) {
      dispatch(setSession(item.callSession));
      dispatch(setOtherUser(item.callSession.astrologer));
      if (item.sessionType === 'AUDIO') {
        zegoAudioButtonRef?.current?.onPress?.();
      }

      if (item.sessionType === 'VIDEO') {
        zegoVideoButtonRef?.current?.onPress?.();
      }
    }
  };

  const handleCancelBooking = async (id: string) => {
    try {
      const {payload} = await dispatch(
        cancelMyAppointment({id, body: {status: 'CANCELLED', otp: null}}),
      );
      console.log(payload, '------canceled');
      if (payload?.success) {
        setBookings(prev =>
          prev.map(it => (it.id === id ? {...it, status: 'CANCELLED'} : it)),
        );
      }
    } catch (err) {
      console.error('cancel booking error', err);
    }
  };
  console.log(bookings, '--------bookings');

  const renderBookingCard = ({item}: {item: Booking}) => {
    const isJoinDisabled =
      (item.sessionType === 'CHAT' && !item.chatSessionId) ||
      ((item.sessionType === 'AUDIO' || item.sessionType === 'VIDEO') &&
        !item.callSessionId);

    return (
      <View
        style={{
          backgroundColor: COLORS.theme.white,
          borderRadius: scale(14),
          padding: scale(16),
          marginBottom: verticalScale(14),
          borderWidth: 1,
          borderColor: COLORS.theme.gray.light,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={{
              uri:
                item.astrologer.imgUri ||
                'https://i.postimg.cc/52hKjTgP/user.png',
            }}
            style={{
              width: scale(46),
              height: scale(46),
              borderRadius: 100,
              marginRight: scale(12),
            }}
          />

          <View style={{flex: 1}}>
            <Text style={[textStyle.fs_mont_16_600]}>
              {item.astrologer.name}
            </Text>
            {item.bookingType === 'ONLINE' ? (
              <Text style={{fontSize: scaleFont(12), marginTop: 2}}>
                {getSessionTypeIcon(item.sessionType)} {item.sessionType}
              </Text>
            ) : (
              <Text style={{fontSize: scaleFont(12), marginTop: 2}}>
                🏠 Offline Appointment
              </Text>
            )}
          </View>

          <View
            style={{
              backgroundColor: getStatusColor(item.status),
              paddingHorizontal: scale(10),
              paddingVertical: verticalScale(4),
              borderRadius: scale(12),
            }}>
            <Text style={{color: '#fff'}}>{item.status}</Text>
          </View>
        </View>

        <Text style={{marginTop: 10}}>
          📅 {item.appointmentDate}{' '}
          {item.bookingType === 'ONLINE' &&
            `⏱️ ${item.appointmentDuration} mins`}
        </Text>

        <Text style={{marginTop: 6}}>Reason: {item.reason}</Text>
        {/* <Text>
          {item?.callSession?.astrologer?.mobile +
            item?.astrologer?.name?.slice(0, 20)}
        </Text> */}

        {((item.bookingType === 'ONLINE' && item.status === 'APPROVED') ||
          item.status === 'COMPLETED' ||
          item.status === 'Confirmed') &&
          item.sessionType === 'CHAT' && (
            <TouchableOpacity
              disabled={isJoinDisabled}
              onPress={() => handleJoinSession(item)}
              style={{
                marginTop: 14,
                backgroundColor: isJoinDisabled
                  ? COLORS.theme.gray.light
                  : COLORS.theme.primary,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: 'center',
              }}>
              <Text style={{color: '#fff', fontWeight: '600'}}>
                {isJoinDisabled
                  ? 'Waiting for Session'
                  : `Join ${item.sessionType}`}
              </Text>
            </TouchableOpacity>
          )}

        <View style={{marginTop: verticalScale(8)}}>
          {item.sessionType === 'AUDIO' && item.status === 'APPROVED' && (
            <ZegoSendCallInvitationButton
              ref={zegoAudioButtonRef}
              invitees={[
                {
                  userID: item?.callSession?.astrologer?.mobile,
                  userName: item?.astrologer?.name?.slice(0, 20),
                },
              ]}
              isVideoCall={false}
              resourceID={Config.ZEGO_RESOURCE_ID || 'astrosevaa'}
              style={{width: 0, height: 0}}
            />
          )}

          {item.sessionType === 'VIDEO' && item.status === 'APPROVED' && (
            <ZegoSendCallInvitationButton
              ref={zegoVideoButtonRef}
              invitees={[
                {
                  userID: item?.callSession?.astrologer?.mobile,
                  userName: item?.astrologer?.name?.slice(0, 20),
                },
              ]}
              isVideoCall={true}
              resourceID={Config.ZEGO_RESOURCE_ID || 'astrosevaa'}
              style={{width: 0, height: 0}}
            />
          )}
        </View>

        {item.status === 'PENDING' && (
          <TouchableOpacity
            onPress={() => handleCancelBooking(item.id)}
            style={{
              marginTop: 14,
              backgroundColor: '#FF5252',
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: 'center',
            }}>
            <Text style={{color: '#fff'}}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(item => {
      const tagMatch = selectedTag === 'All' || item.status === selectedTag;
      const dateMatch =
        !selectedDate ||
        item.appointmentDate === selectedDate.toISOString().split('T')[0];
      return tagMatch && dateMatch;
    });
  }, [bookings, selectedTag, selectedDate]);

  // UI
  return (
    <PageWithHeader
      title={'My Bookings'}
      themeMode="light"
      scrollEnabled={false}>
      <View style={{flex: 1, backgroundColor: COLORS.theme.white}}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('BookAppointment', {
              category: '',
              mode: 'ONLINE',
            })
          }
          style={{
            backgroundColor: COLORS.theme.primary,
            margin: 20,
            padding: 14,
            borderRadius: 12,
            alignItems: 'center',
          }}>
          <Text style={{color: '#fff'}}>+ Book Appointment</Text>
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

        <FlatList
          data={filteredBookings}
          renderItem={renderBookingCard}
          keyExtractor={(item, idx) => `${item.id}-${idx}`}
          onEndReached={loadMoreBookings}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 20,
            backgroundColor: COLORS.theme.white,
            flexGrow: 1,
            paddingBottom: verticalScale(80),
          }}
          ListEmptyComponent={
            <Text style={{textAlign: 'center', marginTop: 40}}>
              No bookings found
            </Text>
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={{padding: 12, alignItems: 'center'}}>
                <ActivityIndicator />
              </View>
            ) : null
          }
        />
      </View>
    </PageWithHeader>
  );
};

export default AllBookings;
