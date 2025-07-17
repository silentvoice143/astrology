// screens/DetailsProfile.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
// Import necessary components and utilities. Adjust paths based on your project structure.
import ScreenLayout from '../components/screen-layout';
import CustomButton from '../components/custom-button';
import ChatIcon from '../assets/icons/chat-icon';
import CallIcon from '../assets/icons/call-icon';
import {textStyle} from '../constants/text-style';
import {moderateScale, scale, scaleFont, verticalScale} from '../utils/sizer';
import LinearGradient from 'react-native-linear-gradient';
import Avatar from '../components/avatar';
// import ReviewAvatar from '../components/Profile/ReviewAvatar';
// import CircularRating from '../components/Profile/CircularRating';
// import ReviewItem from '../components/Profile/ReviewItem';

// Import interfaces for data types
import {Review, UserDetail} from '../utils/types';
import {colors, themeColors} from '../constants/colors';
import ProfileSectionItem from '../components/Profile/ProfileSectionItem';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../hooks/navigation';
import {getAllAstrologerById} from '../store/reducer/astrologers';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {sendSessionRequest, setChatUser} from '../store/reducer/session';
import VideoCallIcon from '../assets/icons/video-call-icon';
import {setProfileModelToggle} from '../store/reducer/auth';
import RequestSessionModal from '../components/session/modals/request-session-modal';

export interface AstrologerUser {
  id: string;
  name: string;
  mobile: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate: string; // ISO date format: YYYY-MM-DD
  birthTime: string; // HH:mm:ss
  birthPlace: string;
  latitude: number;
  longitude: number;
  role: 'ASTROLOGER' | string; // add more roles if needed
  walletBalance: number;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface AstrologerProfile {
  id: string;
  user: UserDetail;
  about: string | null;
  expertise: string;
  experienceYears: number;
  languages: string | null;
  imgUri: string | null;
  pricePerMinuteChat: number;
  pricePerMinuteVoice: number;
  pricePerMinuteVideo: number;
  blocked: boolean;
}

type DetailsProfileRouteProp = RouteProp<RootStackParamList, 'DetailsProfile'>;
const DetailsProfile: React.FC = () => {
  const route = useRoute<DetailsProfileRouteProp>();
  const id = route.params?.id;

  // State to manage the expansion of the 'About Astrologer' section
  const [expandedAbout, setExpandedAbout] = useState<boolean>(false);
  const [data, setData] = useState<AstrologerProfile>();
  const [selectedAstrologer, setSelectedAstrologer] =
    useState<UserDetail | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const {isProfileComplete} = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  const fetchAstrologersDataById = async (id: string) => {
    if (id) {
      try {
        const payload = await dispatch(getAllAstrologerById({id})).unwrap();
        console.log(payload, 'fetchAstrologersDataById-----');
        if (payload.success) {
          setData(payload.astrologer);
        }
      } catch (error) {
        console.log('fetchAstrologersDataById Error : ', error);
      }
    }
  };

  useEffect(() => {
    fetchAstrologersDataById(id);
  }, [id]);

  const handleSessionStart = (astrologer: UserDetail) => {
    if (isProfileComplete) {
      setSelectedAstrologer(astrologer);
      setIsRequestModalOpen(true);
    } else {
      dispatch(setProfileModelToggle());
    }
  };

  // const requestSession = async () => {
  //   try {
  //     const body = {astrologerId: data?.user?.id, duration: 6};
  //     console.log(body, '----body');
  //     const payload = await dispatch(sendSessionRequest(body)).unwrap();
  //     dispatch(setChatUser(data?.user?.id));

  //     console.log(payload);
  //   } catch (err) {
  //     console.log('sendSessionRequest Error : ', err);
  //   }
  // };

  // const renderStars = (rating: number) => {
  //   const stars = [];
  //   for (let i = 0; i < 5; i++) {
  //     stars.push(
  //       <Text
  //         key={i} // Unique key for each star in the list
  //         style={[
  //           styles.star, // Base style for all stars
  //           i < rating ? styles.filledStar : styles.emptyStar, // Conditional styling
  //         ]}>
  //         ★
  //       </Text>,
  //     );
  //   }
  //   return stars;
  // };

  const renderLanguageItem = (text: string, icon: string) => (
    <View style={styles.languageItem}>
      <Text style={styles.languageIcon}>{icon}</Text>
      <Text style={[styles.languageItemText, textStyle.fs_mont_14_400]}>
        {text}
      </Text>
    </View>
  );

  return (
    // ScreenLayout provides a consistent layout structure for the screen
    <ScreenLayout headerBackgroundColor="transparent">
      {data && (
        <ScrollView
          style={styles.container}
          contentContainerStyle={{paddingBottom: verticalScale(20)}}
          showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={['#fff', '#fff', '#fff']}
            style={styles.headerGradient}>
            <View style={styles.topNavBar}>
              <View style={styles.profileTitleContainer}>
                <Text style={[styles.profileTitle, textStyle.fs_mont_20_700]}>
                  {data?.user?.name}
                </Text>
              </View>

              {/* <TouchableOpacity style={styles.shareButton}>
                <Text style={styles.shareIcon}>⋯</Text>
              </TouchableOpacity> */}
            </View>

            {/* Profile Card section displaying avatar and key information */}
            <View style={styles.profileCardContainer}>
              <View style={styles.profileImageContainer}>
                {/* Avatar component for the astrologer's profile picture */}
                <Avatar
                  image={{
                    uri: data?.user?.imgUri
                      ? data?.user?.imgUri
                      : 'https://cdn-icons-png.flaticon.com/512/6596/6596121.png',
                  }}
                  fallbackText="AV"
                  size={scale(100)}
                  borderColor={colors.secondary_Card}
                  borderWidth={3}
                />
              </View>
              <View style={styles.profileCard}>
                <View style={styles.profileInfoSection}>
                  {renderLanguageItem(data.expertise, '🔮')}
                  {renderLanguageItem(
                    data.languages ? data.languages : '-',
                    '🌐',
                  )}
                  {renderLanguageItem(
                    `${data.experienceYears} years of experience`,
                    '🎯',
                  )}
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Consultation Charges Section */}
          <View style={styles.consultationSection}>
            <View style={styles.consultationLeft}>
              <Text
                style={[styles.consultationTitle, textStyle.fs_mont_16_700]}>
                Consultation Charges
              </Text>

              <View style={styles.priceContainer}>
                <View style={[styles.priceWrapper]}>
                  <Text style={[styles.priceText, textStyle.fs_mont_14_400]}>
                    Chat :
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.secondary_Card,
                      paddingVertical: scale(2),
                      paddingHorizontal: scale(6),
                      borderRadius: scale(12),
                    }}>
                    <Text
                      style={[
                        {color: colors.whiteText},
                        textStyle.fs_mont_14_700,
                      ]}>
                      ₹{data.pricePerMinuteChat}/min
                    </Text>
                  </View>
                </View>
                <View style={[styles.priceWrapper]}>
                  <Text style={[styles.priceText, textStyle.fs_mont_14_400]}>
                    Voice Call :
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.secondary_Card,
                      paddingVertical: scale(2),
                      paddingHorizontal: scale(6),
                      borderRadius: scale(12),
                    }}>
                    <Text
                      style={[
                        {color: colors.whiteText},
                        textStyle.fs_mont_14_700,
                      ]}>
                      ₹{data.pricePerMinuteVoice}/min
                    </Text>
                  </View>
                </View>
                <View style={[styles.priceWrapper]}>
                  <Text style={[styles.priceText, textStyle.fs_mont_14_400]}>
                    Video Call :
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.secondary_Card,
                      paddingVertical: scale(2),
                      paddingHorizontal: scale(6),
                      borderRadius: scale(12),
                    }}>
                    <Text
                      style={[
                        {color: colors.whiteText},
                        textStyle.fs_mont_14_700,
                      ]}>
                      ₹{data.pricePerMinuteVideo}/min
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Main Content Area */}
          <View style={styles.mainContent}>
            {/* About Section for astrologer's biography */}
            <View style={styles.aboutSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, textStyle.fs_mont_16_700]}>
                  About Astrologer
                </Text>
                {/* Info icon (commented out as per original provided code) */}
                {/* <View style={styles.orangeInfoIcon}>
                <Text style={styles.orangeInfoIconText}>ⓘ</Text>
              </View> */}
              </View>
              <View style={styles.aboutContent}>
                <View>
                  <ProfileSectionItem
                    icon={require('../assets/imgs/experience.jpg')}
                    title="Expertise"
                    description={data.expertise}
                  />
                </View>

                {data?.about && expandedAbout && (
                  <Text
                    style={[styles.aboutText, textStyle.fs_abyss_14_400]}
                    numberOfLines={expandedAbout ? undefined : 4}>
                    {data.about}
                  </Text>
                )}

                {data?.about && (
                  <TouchableOpacity
                    onPress={() => setExpandedAbout(!expandedAbout)}
                    style={[styles.readMoreButton]}>
                    <Text
                      style={[
                        {color: colors.highlight_text},
                        textStyle.fs_mont_14_700,
                      ]}>
                      {expandedAbout ? 'Read Less' : 'Read More'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Bottom Action Buttons for Call and Chat */}
      <View style={styles.bottomActions}>
        <CustomButton
          disabled={true}
          style={[styles.actionButton, styles.callButton]}
          leftIcon={<VideoCallIcon colors={['#ffffff']} size={18} />}
          textStyle={styles.buttonText}
          onPress={() => {
            // Handle call action
            console.log('Call button pressed');
            handleSessionStart(data?.user as UserDetail);
          }}
          title={'Voice Call'}
        />
        <CustomButton
          disabled={true}
          style={[styles.actionButton, styles.callButton]}
          leftIcon={<CallIcon colors={['#ffffff']} height={18} width={18} />}
          textStyle={styles.buttonText}
          onPress={() => {
            // Handle call action
            console.log('Call button pressed');
            handleSessionStart(data?.user as UserDetail);
          }}
          title={'Video Call'}
        />
        <CustomButton
          style={[styles.actionButton, styles.chatButton]}
          leftIcon={
            <ChatIcon height={18} width={18} colors={[colors.whiteText]} />
          }
          textStyle={textStyle.fs_mont_14_700}
          onPress={() => {
            // Handle chat action
            handleSessionStart(data?.user as UserDetail);
          }}
          title={'Chat'}
        />
      </View>
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

// StyleSheet for the DetailsProfile component, defining all its visual styles.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary_surface,
    marginBottom: verticalScale(40),
  } as ViewStyle,

  headerGradient: {
    paddingVertical: verticalScale(10),
    paddingBottom: 0,
    paddingHorizontal: scale(16),
  } as ViewStyle,

  topNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  } as ViewStyle,

  profileTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  profileTitle: {
    color: colors.primaryText,
    marginRight: scale(8),
  } as TextStyle,

  verifiedBadge: {
    backgroundColor: colors.blue,
    borderRadius: scale(12),
    width: scale(20),
    height: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  verifiedCheck: {
    color: colors.primaryText,
  } as TextStyle,

  shareButton: {
    padding: scale(8),
  } as ViewStyle,

  shareIcon: {
    fontSize: scaleFont(20),
    color: colors.primaryText,
    fontWeight: 'bold',
  } as TextStyle,

  profileCardContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  } as ViewStyle,

  profileCard: {
    backgroundColor: themeColors.surface.background,
    borderRadius: scale(16),
    padding: scale(16),
    flexDirection: 'row',
    marginBottom: verticalScale(16),
    flex: 1,
    marginLeft: scale(50),
    paddingLeft: scale(70),
  } as ViewStyle,

  profileImageContainer: {
    position: 'absolute',
    marginRight: scale(16),
    marginTop: -verticalScale(16),
    zIndex: 1,
  } as ViewStyle,

  activeStatus: {
    height: 15,
    width: 15,
    backgroundColor: 'green',
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primaryText,
  } as ViewStyle,

  profileInfoSection: {
    flex: 1,

    justifyContent: 'space-between',
  } as ViewStyle,

  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  } as ViewStyle,

  languageIcon: {
    fontSize: scaleFont(14),
    marginRight: scale(8),
    color: colors.primaryText,
  } as TextStyle,

  languageItemText: {
    color: themeColors.text.primary,
  } as TextStyle,

  followSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(4),
  } as ViewStyle,

  followButton: {
    backgroundColor: colors.primarybtn,
    borderRadius: scale(16),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(6),
    marginRight: scale(10),
  } as ViewStyle,

  followButtonText: {
    color: colors.whiteText,
    fontSize: scaleFont(12),
    fontWeight: '600',
  } as TextStyle,

  followersText: {
    color: colors.whiteText,
    fontSize: scaleFont(12),
    fontWeight: '400',
  } as TextStyle,

  consultationSection: {
    borderRadius: scale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary_surface,
    position: 'relative',
  } as ViewStyle,

  ratingBox: {
    position: 'absolute',
    top: -verticalScale(16),
    right: scale(20),
  } as ViewStyle,

  consultationLeft: {
    flex: 1,
  } as ViewStyle,

  consultationTitle: {
    color: colors.secondaryText,
    marginBottom: verticalScale(8),
  } as TextStyle,

  priceContainer: {
    backgroundColor: colors.primary_card_2,
    padding: moderateScale(12),
    borderRadius: scale(12),
    gap: scale(8),
  } as ViewStyle,

  priceWrapper: {
    // borderWidth: 1,
    // borderColor: colors.secondary_Card,
    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: scale(12),
  },

  priceText: {
    color: colors.secondaryText,
    marginRight: scale(8),
  } as TextStyle,

  offerBadge: {
    backgroundColor: '#FF1744',
    borderRadius: scale(4),
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
  } as ViewStyle,

  offerText: {
    color: colors.whiteText,
  } as TextStyle,

  mainContent: {
    marginVertical: verticalScale(16),
    padding: scale(16),
    // backgroundColor: colors.primary_surface_2,
  } as ViewStyle,

  aboutSection: {} as ViewStyle,

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  } as ViewStyle,

  sectionTitle: {
    color: colors.primaryText,
    flex: 1,
  } as TextStyle,

  orangeInfoIcon: {
    backgroundColor: colors.primarybtn,
    borderRadius: scale(12),
    width: scale(24),
    height: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  orangeInfoIconText: {
    color: colors.whiteText,
    fontSize: scaleFont(14),
    fontWeight: 'bold',
  } as TextStyle,

  aboutContent: {
    backgroundColor: colors.primary_card_2,
    borderRadius: scale(12),
    padding: scale(16),
  } as ViewStyle,

  aboutText: {
    marginTop: verticalScale(20),
    color: colors.secondaryText,
    marginBottom: verticalScale(8),
  } as TextStyle,

  readMoreButton: {
    alignSelf: 'flex-start',
  } as ViewStyle,

  readMoreText: {
    color: colors.primaryText,
  } as TextStyle,

  reviewsSection: {
    marginBottom: verticalScale(100),
  } as ViewStyle,

  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  } as ViewStyle,

  reviewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  infoIcon: {
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    backgroundColor: colors.secondary_surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(4),
  } as ViewStyle,

  infoIconText: {
    color: colors.secondaryText,
    fontSize: scaleFont(10),
    fontWeight: 'bold',
  } as TextStyle,

  reviewCount: {
    color: colors.secondaryText,
  } as TextStyle,

  reviewSubtext: {
    color: colors.secondaryText,
    marginBottom: verticalScale(16),
  } as TextStyle,

  reviewsList: {
    marginBottom: verticalScale(16),
  } as ViewStyle,

  star: {
    fontSize: scaleFont(14),
    marginRight: scale(1),
  } as TextStyle,

  filledStar: {
    color: colors.primary_yellow,
  } as TextStyle,

  emptyStar: {
    color: colors.secondary_surface,
  } as TextStyle,

  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    backgroundColor: colors.primary_surface,
    borderTopWidth: 1,
    borderTopColor: colors.secondary_surface,
    shadowColor: '#000',
    gap: scale(8),
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  } as ViewStyle,

  actionButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    borderRadius: scale(25),
  } as ViewStyle,

  callButton: {
    backgroundColor: themeColors.button.primary,
  } as ViewStyle,

  chatButton: {
    backgroundColor: themeColors.button.primary,
  } as ViewStyle,

  buttonText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: colors.whiteText,
  } as TextStyle,
});

export default DetailsProfile;
