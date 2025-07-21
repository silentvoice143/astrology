import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AstrologerCard from '../components/astrologers/astrologer-card';
import {colors} from '../constants/colors';
import ScreenLayout from '../components/screen-layout';
import TagSelector from '../components/tag-selector';
import AnimatedSearchInput from '../components/custom-searchbox';
import {scale, verticalScale} from '../utils/sizer';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {getAllAstrologers} from '../store/reducer/astrologers';
import {useTypedNavigation} from '../hooks/navigation';
import {setProfileModelToggle} from '../store/reducer/auth';
import RequestSessionModal from '../components/session/modals/request-session-modal';
import {shuffleArray} from '../utils/utils';
import {textStyle} from '../constants/text-style';
import {Astrologers as AstrologersType, UserDetail} from '../utils/types';

type SessionType = 'chat' | 'voice' | 'video'; // NEW

// NEW: Extended type for astrologer with pricing
interface AstrologerWithPricing extends UserDetail {
  pricePerMinuteChat: number;
  pricePerMinuteVideo: number;
  pricePerMinuteVoice: number;
}

const tags = [
  {id: 'all', label: 'All', icon: '✨'},
  {id: 'love', label: 'Love', icon: '❤️'},
  {id: 'career', label: 'Career', icon: '💼'},
  {id: 'health', label: 'Health', icon: '💊'},
  {
    id: 'custom',
    label: 'Custom',
    icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
  },
];

const Astrologers = () => {
  const [selected, setSelected] = useState<string[]>(['all']);
  const [selectedAstrologer, setSelectedAstrologer] =
    useState<AstrologerWithPricing | null>(null); // CHANGED
  const [selectedSessionType, setSelectedSessionType] =
    useState<SessionType>('chat'); // NEW
  const [astrologersData, setAstrologersData] = useState<AstrologersType[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const {isProfileComplete} = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const navigation = useTypedNavigation();

  const fetchAstrologersData = async () => {
    try {
      setLoading(true);
      const payload = await dispatch(getAllAstrologers('?page=1')).unwrap();
      console.log(payload, 'payload----------------- fetchAstrologersData');
      if (payload.success) {
        const customAstro = payload?.astrologers?.map((astro: any) => {
          return {
            online: astro?.online,
            id: astro?.id,
            name: astro?.user?.name,
            userId: astro?.user?.id,
            user: astro?.user,
            expertise: astro?.expertise,
            pricePerMinuteChat: astro?.pricePerMinuteChat || 0, // CHANGED: Use actual numbers
            pricePerMinuteVideo: astro?.pricePerMinuteVideo || 0,
            pricePerMinuteVoice: astro?.pricePerMinuteVoice || 0,
            rating: astro?.rating || null,
            experience: `${astro?.experienceYears} Years`,
            languages: astro?.languages,
            imageUri:
              astro?.imgUri ||
              'https://img.freepik.com/free-vector/young-man-orange-hoodie_1308-175788.jpg?ga=GA1.1.1570607994.1749976697&semt=ais_hybrid&w=740',
          };
        });
        setAstrologersData(customAstro);
      }
    } catch (error) {
      console.log('fetchAstrologersData Error : ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAstrologersData();
  }, []);

  // CHANGED: Handle session start with session type and pricing
  const handleSessionStart = (
    astrologer: AstrologersType,
    sessionType: SessionType,
  ) => {
    if (isProfileComplete) {
      console.log('handling session');

      // Create astrologer with pricing info
      const astrologerWithPricing: AstrologerWithPricing = {
        ...astrologer.user,
        pricePerMinuteChat: astrologer.pricePerMinuteChat,
        pricePerMinuteVideo: astrologer.pricePerMinuteVideo,
        pricePerMinuteVoice: astrologer.pricePerMinuteVoice,
      };

      setSelectedAstrologer(astrologerWithPricing);
      setSelectedSessionType(sessionType);
      setIsRequestModalOpen(true);
    } else {
      dispatch(setProfileModelToggle());
    }
  };

  useEffect(() => {
    setLoading(true);
    const shuffledData = shuffleArray(astrologersData);
    setAstrologersData(shuffledData);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [selected]);

  return (
    <ScreenLayout>
      <View
        style={{
          paddingTop: verticalScale(20),
        }}>
        <View
          style={{
            height: 50,
            width: '100%',
            backgroundColor: colors.secondary_surface,
            position: 'absolute',
            top: 0,
            borderBottomEndRadius: 20,
            borderStartEndRadius: 20,
          }}></View>
        <View style={{paddingHorizontal: scale(24)}}>
          <AnimatedSearchInput
            unfocusedBorderColor={colors.primary_border}
            enableShadow={true}
            focusedBorderColor={colors.primary_border}
          />
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginVertical: verticalScale(8),
        }}>
        <View
          style={{
            height: 1,
            width: '80%',
            backgroundColor: colors.primary_border,
          }}></View>
      </View>
      <TagSelector
        tags={tags}
        selectedTags={selected}
        onChange={tags => setSelected(tags)}
        removable={false}
        multiSelect={false}
      />

      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator />
          <Text style={[textStyle.fs_mont_12_400]}>
            Loading Astrologer data...
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{
              backgroundColor: colors.primary_surface,
              flex: 1,
              paddingHorizontal: scale(12),
              marginBottom: verticalScale(20),
            }}>
            {astrologersData.map((item:any, idx) => (
              <Pressable
                onPress={() =>
                  navigation.navigate('DetailsProfile', {id: item.id})
                }
                key={`card-astrologer-${item.id}`}>
                <AstrologerCard
                  id={item.id}
                  online={item.online}
                  pricePerMinuteChat={item.pricePerMinuteChat}
                  pricePerMinuteVideo={item.pricePerMinuteVideo}
                  pricePerMinuteVoice={item.pricePerMinuteVoice}
                  expertise={item.expertise}
                  key={`card-astrologer-${idx}`}
                  name={item?.name}
                  rate={item?.chatRate}
                  rating={item?.rating}
                  experience={item?.experience}
                  languages={item?.languages}
                  imageUri={item?.imageUri}
                  // CHANGED: Use new session handler instead of separate handlers
                  onSessionPress={sessionType => {
                    handleSessionStart(item, sessionType);
                  }}
                />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
      <RequestSessionModal
        isOpen={isRequestModalOpen}
        onClose={() => {
          setIsRequestModalOpen(false);
          setSelectedAstrologer(null);
        }}
        astrologer={selectedAstrologer}
        initialSessionType={selectedSessionType} // NEW: Pass initial session type
      />
    </ScreenLayout>
  );
};

export default Astrologers;
