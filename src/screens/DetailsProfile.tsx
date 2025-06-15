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
import {scale, scaleFont, verticalScale} from '../utils/sizer';
import LinearGradient from 'react-native-linear-gradient';
import Avatar from '../components/avatar';
// import ReviewAvatar from '../components/Profile/ReviewAvatar';
// import CircularRating from '../components/Profile/CircularRating';
// import ReviewItem from '../components/Profile/ReviewItem';

// Import interfaces for data types
import {Review} from '../utils/types';
import {colors} from '../constants/colors';
import ProfileSectionItem from '../components/Profile/ProfileSectionItem';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../hooks/navigation';
import {getAllAstrologerById} from '../store/reducer/astrologers';
import {useAppDispatch} from '../hooks/redux-hook';

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
  user: AstrologerUser;
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

  const astrologerData = {
    name: 'Acharya Vishnukant P',
    languages: ['Vedic', 'English, Hindi'],
    experience: '2 years of Experience',
    followers: 64,
    rating: 4.8,
    consultationCharge: '₹30/min | 5/min',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isOnline: true, // Indicates if the astrologer is currently online
    isVerified: true, // Indicates if the astrologer's profile is verified
    about:
      "Acharya Vishnukant is a highly esteemed astrologer, known for his profound knowledge and years of experience in Vedic Astrology. With a deep-rooted understanding of celestial movements and their impact on planetary science, he has guided individuals through life's complexities with wisdom, precision and compassion.",
    reviews: [
      {
        id: 1,
        phoneNumber: '918078*****',
        date: '7 Jun 2025',
        rating: 5,
        isFreeRating: true,
      },
      {
        id: 2,
        phoneNumber: '918134*****',
        date: '6 Jun 2025',
        rating: 5,
        isFreeRating: true,
      },
    ],
    totalReviews: 11,
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Text
          key={i} // Unique key for each star in the list
          style={[
            styles.star, // Base style for all stars
            i < rating ? styles.filledStar : styles.emptyStar, // Conditional styling
          ]}>
          ★
        </Text>,
      );
    }
    return stars;
  };

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
      {/* ScrollView allows the content to be scrollable if it exceeds screen height */}
      {data && (
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}>
          {/* Header Section with a Linear Gradient background for a visually appealing top area */}
          <LinearGradient
            colors={['#1a1a1a', '#2d2d2d', '#3d3d3d']}
            style={styles.headerGradient}>
            {/* Top Navigation Bar containing the astrologer's name and a share button */}
            <View style={styles.topNavBar}>
              <View style={styles.profileTitleContainer}>
                <Text style={[styles.profileTitle, textStyle.fs_mont_20_700]}>
                  {data.user.name}
                </Text>
                {/* Verified badge for verified astrologers */}
                {astrologerData.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Text
                      style={[styles.verifiedCheck, textStyle.fs_mont_12_700]}>
                      ✓
                    </Text>
                    
                  </View>
                )}
              </View>
              {/* Share button (ellipsis icon) */}
              <TouchableOpacity style={styles.shareButton}>
                <Text style={styles.shareIcon}>⋯</Text>
              </TouchableOpacity>
            </View>

            {/* Profile Card section displaying avatar and key information */}
            <View style={styles.profileCardContainer}>
              <View style={styles.profileImageContainer}>
                {/* Avatar component for the astrologer's profile picture */}
                <Avatar
                  image={{
                    uri: data.imgUri
                      ? data.imgUri
                      : 'https://cdn-icons-png.flaticon.com/512/6596/6596121.png',
                  }}
                  fallbackText="AV"
                  size={scale(100)}
                  borderColor="#ffffff"
                  borderWidth={3}
                />
                {/* Active status indicator (green dot) */}
                {astrologerData.isOnline && (
                  <View style={styles.activeStatus}></View>
                )}
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

                  {/* Follow Section (commented out as per original provided code) */}
                  {/* <View style={styles.followSection}>
                  <TouchableOpacity style={styles.followButton}>
                    <Text style={styles.followButtonText}>Follow</Text>
                  </TouchableOpacity>
                  <Text style={styles.followersText}>
                    {astrologerData.followers} Followers
                  </Text>
                </View> */}
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Consultation Charges Section */}
          <View style={styles.consultationSection}>
            <View style={styles.consultationLeft}>
              <Text
                style={[styles.consultationTitle, textStyle.fs_mont_16_500]}>
                Consultation Charges
              </Text>
              <View style={styles.priceContainer}>
                <Text style={[styles.priceText, textStyle.fs_mont_14_700]}>
                  Chat : ₹{data.pricePerMinuteChat}/min |
                </Text>
                <Text style={[styles.priceText, textStyle.fs_mont_14_700]}>
                  Voice Call : ₹{data.pricePerMinuteVoice}/min |
                </Text>
                <Text style={[styles.priceText, textStyle.fs_mont_14_700]}>
                  Video Call : ₹{data.pricePerMinuteVideo}/min
                </Text>
                {/* Offer badge */}
                {/* <View style={styles.offerBadge}>
                  <Text style={[styles.offerText, textStyle.fs_mont_10_600]}>
                    30% OFFER
                  </Text>
                </View> */}
              </View>
            </View>
            {/* CircularRating component for overall astrologer rating */}
            {/* <View style={styles.ratingBox}>
            <CircularRating rating={astrologerData.rating} size={70} />
          </View> */}
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
                <Text
                  style={[styles.aboutText, textStyle.fs_abyss_14_400]}
                  numberOfLines={expandedAbout ? undefined : 4}>
                  {data.about}
                </Text>
                {expandedAbout && (
                  <View>
                    <ProfileSectionItem
                      icon={require('../assets/imgs/experience.jpg')}
                      title="Expertise"
                      description={data.expertise}
                    />
                  </View>
                )}
                {/* "Read More/Read Less" toggle button */}
                <TouchableOpacity
                  onPress={() => setExpandedAbout(!expandedAbout)}
                  style={styles.readMoreButton}>
                  <Text style={[styles.readMoreText, textStyle.fs_mont_14_700]}>
                    {expandedAbout ? 'Read Less' : 'Read More'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Ratings and Reviews Section */}
            <View style={styles.reviewsSection}>
              {/* <View style={styles.reviewsHeader}>
              <Text style={[styles.sectionTitle, textStyle.fs_abyss_12_400]}>
                Ratings and reviews
              </Text>
              <View style={styles.reviewCountContainer}>
                <View style={styles.infoIcon}>
                  <Text style={styles.infoIconText}>ⓘ</Text>
                </View>
                <Text style={[styles.reviewCount, textStyle.fs_abyss_12_400]}>
                  ({astrologerData.totalReviews})
                </Text>
              </View>
            </View>
            <Text style={[styles.reviewSubtext, textStyle.fs_abyss_12_400]}>
              (Only verified purchase ratings are used for final calculation)
            </Text> */}

              {/* Map through the reviews data and render each using the new ReviewItem component */}
              {/* <View style={styles.reviewsList}>
              {astrologerData.reviews.map(review => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  renderStars={renderStars}
                />
              ))}
            </View> */}
              {/* Button to see all reviews */}
              {/* <TouchableOpacity style={styles.seeAllButton}>
              <Text style={[styles.seeAllText,textStyle.fs_mont_14_700]}>See all reviews</Text>
            </TouchableOpacity> */}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Bottom Action Buttons for Call and Chat */}
      <View style={styles.bottomActions}>
        <CustomButton
          style={[styles.actionButton, styles.callButton]}
          leftIcon={<CallIcon colors={['#ffffff']} height={18} width={18} />}
          textStyle={styles.buttonText}
          onPress={() => {
            // Handle call action
            console.log('Call button pressed');
          }}
          title={'Call'}
        />
        <CustomButton
          style={[styles.actionButton, styles.chatButton]}
          leftIcon={<ChatIcon colors={['#ffffff']} height={18} width={18} />}
          textStyle={textStyle.fs_mont_14_700}
          onPress={() => {
            // Handle chat action
            console.log('Chat button pressed');
          }}
          title={'Chat'}
        />
      </View>
    </ScreenLayout>
  );
};

// StyleSheet for the DetailsProfile component, defining all its visual styles.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary_surface,
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
    color: colors.whiteText,
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
    color: colors.whiteText,
  } as TextStyle,

  shareButton: {
    padding: scale(8),
  } as ViewStyle,

  shareIcon: {
    fontSize: scaleFont(20),
    color: colors.whiteText,
    fontWeight: 'bold',
  } as TextStyle,

  profileCardContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(30),
  } as ViewStyle,

  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    borderColor: colors.whiteText,
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
    color: colors.whiteText,
  } as TextStyle,

  languageItemText: {
    color: colors.whiteText,
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
    backgroundColor: colors.primary_surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(20),
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
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

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
    padding: scale(16),
    backgroundColor: colors.primary_surface,
  } as ViewStyle,

  aboutSection: {
    marginBottom: verticalScale(25),
  } as ViewStyle,

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  } as ViewStyle,

  sectionTitle: {
    color: colors.secondaryText,
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
    backgroundColor: colors.secondary_surface_2,
    borderRadius: scale(12),
    padding: scale(16),
  } as ViewStyle,

  aboutText: {
    color: colors.secondaryText,
    marginBottom: verticalScale(8),
  } as TextStyle,

  readMoreButton: {
    alignSelf: 'flex-start',
  } as ViewStyle,

  readMoreText: {
    color: colors.primarybtn,
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
    marginHorizontal: scale(6),
    paddingVertical: verticalScale(14),
    borderRadius: scale(25),
  } as ViewStyle,

  callButton: {
    backgroundColor: colors.primarybtn,
  } as ViewStyle,

  chatButton: {
    backgroundColor: colors.tertiary_btn,
  } as ViewStyle,

  buttonText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: colors.whiteText,
  } as TextStyle,
});

export default DetailsProfile;
