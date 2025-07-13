import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Switch,
  StyleSheet,
  Touchable,
  TouchableOpacity,
} from 'react-native';
import EditIcon from '../assets/icons/edit-icon';
import HomeIcon from '../assets/icons/home-icon';
import ChatIcon from '../assets/icons/chat-icon';
import VideoCallIcon from '../assets/icons/video-call-icon';
import CallIcon from '../assets/icons/call-icon';
import ScreenLayout from '../components/screen-layout';
import {scale, scaleFont, verticalScale} from '../utils/sizer';
import {colors, themeColors} from '../constants/colors';

const ProfilePage = () => {
  const role = 'astrologer';
  const isAstrologer = role === 'astrologer';

  const data = {
    name: 'Sharma Ji',
    fullName: 'Om Prakash Rajan',
    age: 27,
    profileImage: 'https://your-cdn.com/profile.jpg',
    isActive: true,
    about:
      'Namaste! I am Acharya Rajesh Sharma, a professional astrologer with over 15 years...',
    address: '123, This colony near location',
    services: [
      {type: 'Chat', rate: 20},
      {type: 'Audio call', rate: 20},
      {type: 'Video call', rate: 20},
    ],
  };

  return (
    <ScreenLayout>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{}}>
            <Image
              source={{uri: 'https://i.pravatar.cc/300?img=5'}}
              style={styles.profileImage}
            />
          </View>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: verticalScale(20),
              right: scale(20),
            }}>
            <EditIcon size={16} color="black" />
          </TouchableOpacity>
          <View style={{justifyContent: 'center'}}>
            <Text style={styles.name}>{data.name}</Text>
            <Text style={styles.phone}>{'+91 1234567890'}</Text>
          </View>
        </View>

        {/* Status */}
        {isAstrologer && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Active Status</Text>
            <Switch value={data.isActive} />
          </View>
        )}

        {/* About Me */}
        {isAstrologer && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>About Me</Text>
            </View>
            <View style={styles.aboutBox}>
              <Text style={styles.aboutText}>{data.about}</Text>
            </View>
          </View>
        )}

        {/* Personal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <Text style={styles.detailText}>Name: {data.fullName}</Text>
          <Text style={styles.detailText}>Age: {data.age} Years</Text>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <View style={styles.cardBox}>
            <Text style={styles.cardTitle}>
              <HomeIcon size={14} color="red" /> Address
            </Text>
            <Text style={styles.cardText}>{data.address}</Text>
          </View>
        </View>

        {/* Services */}
        {isAstrologer && (
          <View style={styles.section}>
            <View style={styles.cardBox}>
              <Text style={styles.cardTitle}>Services</Text>
              {data.services.map((service, i) => (
                <View key={i} style={styles.serviceItem}>
                  <View style={styles.serviceType}>
                    {service.type === 'Chat' && <ChatIcon size={14} />}
                    {service.type === 'Audio call' && <CallIcon size={14} />}
                    {service.type === 'Video call' && (
                      <VideoCallIcon size={14} />
                    )}
                    <Text style={styles.serviceText}>{service.type}</Text>
                  </View>
                  <Text style={styles.servicePrice}>{service.rate} ₹/min</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: scale(10),
    flexDirection: 'row',
    gap: scale(20),
    backgroundColor: themeColors.surface.background,
    paddingVertical: 16,
  },
  profileImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(24),
  },
  name: {
    fontSize: scaleFont(18),
    fontWeight: '600',
  },
  phone: {
    fontSize: scaleFont(14),
    fontWeight: '400',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statusLabel: {
    fontWeight: '600',
    color: '#000',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  aboutBox: {
    backgroundColor: themeColors.surface.secondarySurface,
    padding: 12,
    borderRadius: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  detailText: {
    fontSize: 14,
    color: themeColors.text.secondary,
    marginVertical: 2,
  },
  cardBox: {
    borderWidth: 1,
    borderColor: themeColors.border.primary,
    borderRadius: 12,
    padding: 12,
  },
  cardTitle: {
    fontWeight: '700',
    color: themeColors.status.error.base,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    color: themeColors.text.subdued,
    fontSize: 14,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: themeColors.status.error.light,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  serviceType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serviceText: {
    color: '#000',
    fontSize: 14,
    marginLeft: 4,
  },
  servicePrice: {
    backgroundColor: themeColors.status.error.base,
    color: '#fff',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 12,
  },
});

export default ProfilePage;
