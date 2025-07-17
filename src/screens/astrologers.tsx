import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Keyboard,
  FlatList,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
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
import {sendSessionRequest, setOtherUser} from '../store/reducer/session';

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

// Define the type for the route parameters for the 'Astrologers' screen
type AstrologersRouteParams = {
  initialSearch?: string;
  sort?: string;
};

// Define the type for the route object using RouteProp
type AstrologersScreenRouteProp = RouteProp<
  {Astrologers: AstrologersRouteParams},
  'Astrologers'
>;

const Astrologers = () => {
  const route = useRoute<AstrologersScreenRouteProp>(); // Use useRoute hook to access params
  const {initialSearch = '', sort = ''} = route.params || {};
  const [search, setSearch] = useState(initialSearch); // Initialize search state with initialSearch param
  const [selected, setSelected] = useState<string[]>(['all']);
  const [selectedAstrologer, setSelectedAstrologer] =
    useState<UserDetail | null>(null);
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
  const fetchAstrologersData = async (pageNumber = 1, append = false) => {
    if (loading || isFetchingMore || !hasMore) return;
    try {
      if (append) setIsFetchingMore(true);
      else setLoading(true);

      const payload = await dispatch(
        getAllAstrologers(`?page=${pageNumber}&search=&sort=${sort}`),
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

  const requestSession = async (astrologer: UserDetail) => {
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
    fetchAstrologersData(1);
  }, []);

  const handleSessionStart = (astrologer: UserDetail) => {
    if (isProfileComplete) {
      if (freeChatUsed) {
        setSelectedAstrologer(astrologer);
        setIsRequestModalOpen(true);
      } else {
        requestSession(astrologer);
      }
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
            placeholder="Search for astrologers..." // Updated placeholder for clarity
            value={search} // Controlled component with search state
            onChangeText={setSearch} // Update search state on text change
            onSubmitEditing={() => Keyboard.dismiss()} // Dismiss keyboard on submit
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
        <FlatList
          showsVerticalScrollIndicator={false}
          data={astrologersData}
          keyExtractor={item => `card-astrologer-${item.id}`}
          contentContainerStyle={{paddingBottom: verticalScale(20)}}
          onEndReached={() => {
            if (hasMore && !isFetchingMore && !loading) {
              fetchAstrologersData(page + 1, true);
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
              onPress={() =>
                navigation.navigate('DetailsProfile', {id: item.id})
              }
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
                onCallPress={() => handleSessionStart(item.user)}
                onVideoPress={() => handleSessionStart(item.user)}
                onChatPress={() => handleSessionStart(item.user)}
              />
            </Pressable>
          )}
          ListEmptyComponent={
            !loading && (
              <Text style={[textStyle.fs_mont_12_400, {textAlign: 'center'}]}>
                No astrologers found.
              </Text>
            )
          }
        />
      )}
      <RequestSessionModal
        isOpen={isRequestModalOpen}
        onClose={() => {
          setIsRequestModalOpen(false);
          setSelectedAstrologer(null);
        }}
        astrologer={selectedAstrologer}
      />
    </ScreenLayout>
  );
};

export default Astrologers;
