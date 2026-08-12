import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import PageWithHeader from '../../componentsV1/layout/page-with-header';
import {scale, verticalScale, scaleFont} from '../../utils/sizer';
import {colors, COLORS, themeColors} from '../../constants/colors';

import {useAppDispatch, useAppSelector} from '../../hooks/redux-hook';
import {
  getAllAstrologerById,
  getAllAstrologers,
} from '../../store/reducer/astrologers';
import {useNavigation} from '@react-navigation/native';
import {bookAppointmentReq} from '../../store/reducer/booking';
import Toast from 'react-native-toast-message';

const Astrologers = ({route}: any) => {
  console.log('I am on this page');
  const {id} = route.params;
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [loadingAstrologerData, setLoadingAstrologerData] = useState(false);
  const [astrologersData, setAstrologersData] = useState<any>({});
  const {freeChatUsed} = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  console.log(astrologersData, '------------------id');
  const handleBooking = async (id: string) => {
    // Implement booking logic here
    try {
      setLoading(true);
      const body = {
        appointmentDate: new Date().toISOString().split('T')[0],
        reason: 'all',
        astrologerId: id,
        appointmentDuration: 2,
        sessionType: 'CHAT',
        bookingType: 'ONLINE',
        isFreeBooking: true,
      };

      const payload = await dispatch(bookAppointmentReq(body)).unwrap();
      if (payload.success) {
        Toast.show({
          type: 'success',
          text1: 'Appointment booked successfully!',
        });
      }
    } catch (err) {
      console.log(err);
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

      const payload = await dispatch(getAllAstrologerById({id: id})).unwrap();

      if (payload.success) {
        const newData = payload.astrologer;
        setAstrologersData(newData);
      }
    } finally {
      setIsFetchingMore(false);
      setTimeout(() => {
        setLoadingAstrologerData(false);
      }, 500);
    }
  };

  useEffect(() => {
    fetchAstrologersData(1, false, '');
  }, [id]);

  const astrologer: any = astrologersData;

  if (loadingAstrologerData) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: themeColors.surface.background,
        }}>
        <ActivityIndicator size="small" color={themeColors.text.tertiary} />
      </View>
    );
  }

  return (
    <PageWithHeader themeMode="light" title="Astrologer">
      <View
        style={{
          paddingHorizontal: scale(20),
          paddingBottom: verticalScale(90),
          backgroundColor: COLORS.theme.white,
          flex: 1,
        }}>
        {/* ✅ PROFILE IMAGE */}
        <View style={{alignItems: 'center', marginTop: verticalScale(20)}}>
          <Image
            source={{
              uri:
                astrologer?.user?.imgUri ||
                'https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fimages%2Fsearch%2Fuser%2F&psig=AOvVaw1W1xaGjiVF_9TB2i4QJoO5&ust=1765144303563000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKDr2Y75qZEDFQAAAAAdAAAAABAEhttps://via.placeholder.com/150',
            }}
            style={{
              height: scale(120),
              width: scale(120),
              borderRadius: scale(60),
              borderWidth: 3,
              borderColor: COLORS.theme.secondary,
            }}
          />
        </View>

        {/* ✅ NAME & EXPERTISE */}
        <View style={{alignItems: 'center', marginTop: verticalScale(14)}}>
          <Text style={{fontSize: scaleFont(22), fontWeight: '700'}}>
            {astrologer?.user?.name || 'Astrologer'}
          </Text>

          <Text style={{marginTop: 6, fontSize: scaleFont(14), color: '#666'}}>
            {astrologer?.expertise || 'Astrology'} •{' '}
            {astrologer?.experienceYears || 0} yrs experience
          </Text>
        </View>

        {/* ✅ AVAILABILITY STATUS */}
        {/* <View
          style={{
            alignSelf: 'center',
            marginTop: verticalScale(12),
            paddingHorizontal: scale(14),
            paddingVertical: verticalScale(6),
            borderRadius: scale(20),
            backgroundColor: astrologer?.online ? '#4CAF50' : '#F44336',
          }}>
          <Text style={{color: COLORS.theme.white, fontWeight: '600'}}>
            {astrologer?.online ? 'Online Now' : 'Currently Offline'}
          </Text>
        </View> */}

        {/* ✅ ABOUT */}
        <View style={{marginTop: verticalScale(22)}}>
          <Text style={{fontSize: scaleFont(18), fontWeight: '700'}}>
            About
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontSize: scaleFont(14),
              color: '#444',
              lineHeight: 20,
            }}>
            {astrologer?.about || 'No description available.'}
          </Text>
        </View>

        {/* ✅ EXPERIENCE + LANGUAGES */}
        <View
          style={{
            marginTop: verticalScale(22),
            padding: scale(16),
            backgroundColor: COLORS.theme.secondary,
            borderRadius: scale(12),
          }}>
          <Text style={{fontSize: scaleFont(14), fontWeight: '700'}}>
            Experience:{' '}
            <Text style={{fontWeight: '400'}}>
              {astrologer?.experienceYears || 0} years
            </Text>
          </Text>

          <Text
            style={{
              marginTop: 6,
              fontSize: scaleFont(14),
              fontWeight: '700',
            }}>
            Languages:{' '}
            <Text style={{fontWeight: '400'}}>
              {astrologer?.languages || 'Hindi, English'}
            </Text>
          </Text>
        </View>

        {/* ✅ PRICING */}
        <View
          style={{
            marginTop: verticalScale(22),
            padding: scale(16),
            backgroundColor: COLORS.theme.white,
            borderRadius: scale(12),
            borderWidth: 1,
            borderColor: COLORS.theme.gray.light,
          }}>
          <Text style={{fontSize: scaleFont(15), fontWeight: '700'}}>
            Pricing Per Minute
          </Text>

          <Text style={{marginTop: 6}}>
            💬 Chat: ₹{astrologer?.pricePerMinuteChat || 0}
          </Text>

          <Text style={{marginTop: 4}}>
            📞 Voice: ₹{astrologer?.pricePerMinuteVoice || 0}
          </Text>

          <Text style={{marginTop: 4}}>
            📹 Video: ₹{astrologer?.pricePerMinuteVideo || 0}
          </Text>
        </View>

        {/* ✅ BOOKING BUTTONS */}
        <View
          style={{
            flexDirection: 'row',
            marginTop: verticalScale(30),
            gap: scale(16),
          }}>
          {/* ONLINE BOOKING */}
          <TouchableOpacity
            // disabled={!astrologer?.isChatOnline}
            style={{
              flex: 1,
              backgroundColor: COLORS.theme.primary,

              paddingVertical: verticalScale(14),
              borderRadius: scale(10),
              alignItems: 'center',
            }}
            onPress={() =>
              freeChatUsed
                ? navigation.navigate('Astrologers', {
                    screen: 'BookAppointment',
                    params: {category: '', mode: 'ONLINE', id: id},
                  })
                : handleBooking(astrologersData.user?.id)
            }>
            <Text
              style={{
                fontSize: scaleFont(16),
                color: COLORS.theme.white,
                fontWeight: '700',
              }}>
              Book Online {!freeChatUsed && '(Free Chat)'}
            </Text>
          </TouchableOpacity>

          {/* OFFLINE BOOKING */}
          {/* <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: COLORS.theme.white,
              paddingVertical: verticalScale(14),
              borderWidth: 2,
              borderRadius: scale(10),
              borderColor: COLORS.theme.primary,
              alignItems: 'center',
            }}
            onPress={() =>
              navigation.navigate('Booking', {
                screen: 'BookAppointment',
                params: { category: '', mode: 'ONLINE' },
              })
            }>
            <Text
              style={{
                fontSize: scaleFont(16),
                color: COLORS.theme.primary,
                fontWeight: '700',
              }}>
              Book Offline
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </PageWithHeader>
  );
};

export default Astrologers;
