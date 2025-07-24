import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  FlatList,
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
import {RouteProp, useRoute} from '@react-navigation/native';
import {
  sendSessionRequest,
  setOtherUser,
  setSession,
} from '../store/reducer/session';
import {useDebounce} from '../hooks/use-debounce';

type SessionType = 'chat' | 'audio' | 'video'; // NEW

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

type AstrologersRouteParams = {
  initialSearch?: string;
  sort?: string;
};

type AstrologersScreenRouteProp = RouteProp<
  {Astrologers: AstrologersRouteParams},
  'Astrologers'
>;

const Astrologers = () => {
  const route = useRoute<AstrologersScreenRouteProp>(); // Use useRoute hook to access params
  const {initialSearch = '', sort = ''} = route.params || {};
  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 500);
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
  const {freeChatUsed} = useAppSelector(state => state.auth.user);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const activeSession = useAppSelector(state => state.session.activeSession);

  const fetchAstrologersData = async (
    pageNumber = 1,
    append = false,
    search = '',
  ) => {
    if (loading || isFetchingMore || (!hasMore && append)) return;
    try {
      if (append) setIsFetchingMore(true);
      else setLoading(true);

      const payload = await dispatch(
        getAllAstrologers(`?page=${pageNumber}&search=${search}&sort=${sort}`),
      ).unwrap();
      if (payload.success) {
        const newData = payload.astrologers || [];
        setAstrologersData(prev => (append ? [...prev, ...newData] : newData));
        setPage(payload.currentPage);
        setHasMore(!payload.isLastPage);
      }
    } catch (error) {
      console.log('fetchAstrologersData Error : ', error);
    } finally {
      if (append) setIsFetchingMore(false);
      else setLoading(false);
    }
  };

  // const fetchAstrologersData = async () => {
  //   try {
  //     setLoading(true);
  //     const payload = await dispatch(getAllAstrologers('?page=1')).unwrap();
  //     console.log(payload, 'payload----------------- fetchAstrologersData');
  //     if (payload.success) {
  //       const customAstro = payload?.astrologers?.map((astro: any) => {
  //         return {
  //           online: astro?.online,
  //           id: astro?.id,
  //           name: astro?.user?.name,
  //           userId: astro?.user?.id,
  //           user: astro?.user,
  //           expertise: astro?.expertise,
  //           pricePerMinuteChat: astro?.pricePerMinuteChat || 0, // CHANGED: Use actual numbers
  //           pricePerMinuteVideo: astro?.pricePerMinuteVideo || 0,
  //           pricePerMinuteVoice: astro?.pricePerMinuteVoice || 0,
  //           rating: astro?.rating || null,
  //           experience: `${astro?.experienceYears} Years`,
  //           languages: astro?.languages,
  //           imageUri:
  //             astro?.imgUri ||
  //             'https://img.freepik.com/free-vector/young-man-orange-hoodie_1308-175788.jpg?ga=GA1.1.1570607994.1749976697&semt=ais_hybrid&w=740',
  //         };
  //       });
  //       setAstrologersData(customAstro);
  //     }
  //   } catch (error) {
  //     console.log('fetchAstrologersData Error : ', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const requestSession = async (astrologer: AstrologerWithPricing) => {
    if (activeSession && activeSession?.astrologer?.id === astrologer.id) {
      setSession(activeSession);
      navigation.navigate('chat');
    }
    try {
      const body = {astrologerId: astrologer?.id, duration: 2};
      const payload = await dispatch(sendSessionRequest(body)).unwrap();

      if (payload.success) {
        dispatch(setOtherUser(astrologer));
        navigation.navigate('chat');
      }

      console.log(payload);
    } catch (err) {
      console.log('sendSessionRequest Error : ', err);
    }
  };

  useEffect(() => {
    console.log('fetching data');
    fetchAstrologersData(1, false, debouncedSearch); // reset to page 1 on new search
  }, [debouncedSearch, sort]);

  // CHANGED: Handle session start with session type and pricing
  const handleSessionStart = (
    astrologer: AstrologersType,
    sessionType: SessionType,
  ) => {
    console.log('starting session');
    if (isProfileComplete) {
      console.log('handling session');
      const astrologerWithPricing: AstrologerWithPricing = {
        ...astrologer.user,
        pricePerMinuteChat: astrologer.pricePerMinuteChat,
        pricePerMinuteVideo: astrologer.pricePerMinuteVideo,
        pricePerMinuteVoice: astrologer.pricePerMinuteVoice,
      };
      if (freeChatUsed) {
        setSelectedAstrologer(astrologerWithPricing);
        setSelectedSessionType(sessionType);
        setIsRequestModalOpen(true);
      } else {
        requestSession(astrologerWithPricing);
      }
      // Create astrologer with pricing info
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

  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [debouncedSearch]);

  if (loading) {
    return (
      <ScreenLayout>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size={20} />
          <Text
            style={[textStyle.fs_mont_14_400, {marginTop: verticalScale(10)}]}>
            Fetching astrologer data
          </Text>
        </View>
      </ScreenLayout>
    );
  }

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
            value={search}
            onChangeText={text => setSearch(text)}
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

      <FlatList
        showsVerticalScrollIndicator={false}
        data={astrologersData}
        keyExtractor={item => `card-astrologer-${item.id}`}
        contentContainerStyle={{paddingBottom: verticalScale(20)}}
        onEndReached={() => {
          if (hasMore && !isFetchingMore && !loading) {
            fetchAstrologersData(page + 1, true, debouncedSearch);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingMore ? (
            <View style={{paddingVertical: 10}}>
              <ActivityIndicator />
              <Text style={[textStyle.fs_mont_12_400, {textAlign: 'center'}]}>
                Loading more astrologers...
              </Text>
            </View>
          ) : null
        }
        renderItem={({item}) => (
          <Pressable
            onPress={() => navigation.navigate('DetailsProfile', {id: item.id})}
            style={{marginHorizontal: scale(10)}}
            key={`card-astrologer-${item.id}`}>
            <AstrologerCard
              id={item.id}
              online={item.online}
              pricePerMinuteChat={item.pricePerMinuteChat}
              pricePerMinuteVideo={item.pricePerMinuteVideo}
              pricePerMinuteVoice={item.pricePerMinuteVoice}
              expertise={item.expertise}
              name={item?.user?.name}
              rate={''}
              rating={4}
              experience={item?.experienceYears.toString()}
              languages={item?.languages}
              imageUri={item?.user?.imgUri}
              freeChatAvailable={!freeChatUsed}
              onSessionPress={sessionType => {
                handleSessionStart(item, sessionType);
              }}
            />
          </Pressable>
        )}
        ListEmptyComponent={
          <View
            style={{
              height: verticalScale(200),

              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {
              <Text style={[textStyle.fs_mont_12_400, {textAlign: 'center'}]}>
                No astrologers found.
              </Text>
            }
          </View>
        }
      />

      {/* <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{
              backgroundColor: colors.primary_surface,
              flex: 1,
              paddingHorizontal: scale(12),
              marginBottom: verticalScale(20),
            }}>
            {astrologersData.map((item: any, idx) => (
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
        </ScrollView> */}
      {isRequestModalOpen && (
        <RequestSessionModal
          isOpen={isRequestModalOpen}
          onClose={() => {
            setIsRequestModalOpen(false);
            setSelectedAstrologer(null);
          }}
          astrologer={selectedAstrologer}
          initialSessionType={selectedSessionType}
        />
      )}
    </ScreenLayout>
  );
};

export default Astrologers;
