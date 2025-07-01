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

const astrologers = [
  {
    name: 'Dr. Radhika Sharma',
    rate: '₹20/min',
    rating: 4.8,
    experience: '10+ Years',
    languages: 'Hindi, English',
    imageUri: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    name: 'Guru Manish Verma',
    rate: '₹15/min',
    rating: 4.5,
    experience: '8 Years',
    languages: 'Hindi',
    imageUri: 'https://randomuser.me/api/portraits/men/43.jpg',
  },
  {
    name: 'Astro Kavita',
    rate: '₹25/min',
    rating: 5.0,
    experience: '12+ Years',
    languages: 'English, Tamil',
    imageUri: 'https://randomuser.me/api/portraits/women/58.jpg',
  },
];

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

interface Astrologers {
  id: string;
  userId: string;
  name: string;
  chatRate: string;
  rating: number;
  experience: string;
  languages: string;
  imageUri: string;
  callRate: string;
  videCallRate: string;
  pricePerMinuteChat: number;
  pricePerMinuteVideo: number;
  pricePerMinuteVoice: number;
  expertise: string;
}

const Astrologers = () => {
  const [selected, setSelected] = useState<string[]>(['all']);
  const [selectedAstrologer, setSelectedAstrologer] = useState<string | null>(
    null,
  );
  const [astrologersData, setAstrologersData] = useState<Astrologers[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const {isProfileComplete} = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const navigation = useTypedNavigation();
  const fetchAstrologersData = async () => {
    try {
      setLoading(true);
      const payload = await dispatch(getAllAstrologers()).unwrap();
      console.log(payload, 'payload----------------- fetchAstrologersData');
      if (payload.success) {
        const customAstro = payload?.astrologers?.map((astro: any) => {
          return {
            id: astro?.id,
            name: astro?.user?.name,
            userId: astro?.user?.id,
            expertise: astro?.expertise,
            pricePerMinuteChat: `${astro?.pricePerMinuteChat} ₹/min`,
            pricePerMinuteVoice: `${astro?.pricePerMinuteVoice} ₹/min`,
            pricePerMinuteVideo: `${astro?.pricePerMinuteVideo} ₹/min`,
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

  const handleSessionStart = (astrologerId: string) => {
    if (isProfileComplete) {
      setSelectedAstrologer(astrologerId);
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
            {astrologersData.map((item, idx) => (
              <Pressable
                onPress={() =>
                  navigation.navigate('DetailsProfile', {id: item.id})
                }
                key={`card-astrologer-${item.id}`}>
                <AstrologerCard
                  id={item.id}
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
                  onCallPress={() => {
                    console.log('Calling');

                    handleSessionStart(item?.userId);
                  }}
                  onVideoPress={() => {
                    console.log('Video');
                    handleSessionStart(item?.userId);
                  }}
                  onChatPress={() => {
                    console.log('Chat');
                    handleSessionStart(item?.userId);
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
        astrologerId={selectedAstrologer}
      />
    </ScreenLayout>
  );
};

export default Astrologers;
