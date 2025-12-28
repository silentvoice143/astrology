import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
} from 'react-native';
import React from 'react';
import {textStyle} from '../../constants/text-style';
import {COLORS} from '../../constants/colors';
import PageWithHeader from '../../componentsV1/layout/page-with-header';
import HeadphoneIcon from '../../assets/icons/customer-support';
import BackIcon from '../../assets/icons/back-icon';
import ChatIcon from '../../assets/icons/chat-icon';
import EmailIcon from '../../assets/icons/email';
import ChevronRightIcon from '../../assets/icons/chevron-right';
import CallIcon from '../../assets/icons/call-icon';
import HelpIcon from '../../assets/icons/customer-support-icon';

const CustomerSupport = () => {
  const supportNumber = '+916297940225';
  const whatsappNumber = '916297940225';

  const handleCallPress = () => {
    const phoneNumber = `tel:${supportNumber}`;
    Linking.canOpenURL(phoneNumber)
      .then(supported => {
        if (supported) {
          return Linking.openURL(phoneNumber);
        } else {
          Alert.alert(
            'Phone Not Available',
            'Phone calls are not supported on this device',
          );
        }
      })
      .catch(err => {
        console.error('Error opening phone dialer:', err);
        Alert.alert('Error', 'Unable to open phone dialer');
      });
  };

  const handleWhatsAppPress = () => {
    const whatsappUrl = `whatsapp://send?phone=${whatsappNumber}`;
    Linking.canOpenURL(whatsappUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          Alert.alert(
            'WhatsApp Not Available',
            'WhatsApp is not installed on this device',
          );
        }
      })
      .catch(err => {
        console.error('Error opening WhatsApp:', err);
        Alert.alert('Error', 'Unable to open WhatsApp');
      });
  };

  const handleEmailPress = () => {
    const emailUrl = 'mailto:support@yourcompany.com';
    Linking.openURL(emailUrl).catch(err => {
      console.error('Error opening email:', err);
      Alert.alert('Error', 'Unable to open email client');
    });
  };

  const handleFAQPress = () => {
    // Navigate to FAQ screen
    console.log('Navigate to FAQ');
  };

  return (
    <PageWithHeader title="Support" scrollEnabled={false}>
      <View style={styles.container}>
        {/* Header Icon & Text */}
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <HeadphoneIcon height={80} width={80} color="#FFC107" />
          </View>
          <Text style={styles.headerText}>Hello, How can we</Text>
          <Text style={styles.headerText}>Help you?</Text>
        </View>

        {/* Support Options */}
        <View style={styles.optionsContainer}>
          {/* Contact Live Chat */}
          <TouchableOpacity
            style={styles.optionCard}
            activeOpacity={0.7}
            onPress={handleWhatsAppPress}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, {backgroundColor: '#E8F5E9'}]}>
                <ChatIcon size={24} color="#4CAF50" />
              </View>
              <Text style={styles.optionText}>Contact Live Chat</Text>
            </View>
            <ChevronRightIcon size={24} color="#999" />
          </TouchableOpacity>

          {/* Send us an E-mail */}
          {/* <TouchableOpacity
            style={styles.optionCard}
            activeOpacity={0.7}
            onPress={handleEmailPress}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, {backgroundColor: '#E3F2FD'}]}>
                <EmailIcon size={24} color="#2196F3" />
              </View>
              <Text style={styles.optionText}>Send us an E-mail</Text>
            </View>
            <ChevronRightIcon size={24} color="#999" />
          </TouchableOpacity> */}

          {/* Call Now */}
          <TouchableOpacity
            style={styles.optionCard}
            activeOpacity={0.7}
            onPress={handleCallPress}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, {backgroundColor: '#FFF3E0'}]}>
                <CallIcon size={24} color="#FF9800" />
              </View>
              <Text style={styles.optionText}>Call Now</Text>
            </View>
            <ChevronRightIcon size={24} color="#999" />
          </TouchableOpacity>

          {/* FAQs */}
          {/* <TouchableOpacity
            style={styles.optionCard}
            activeOpacity={0.7}
            onPress={handleFAQPress}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, {backgroundColor: '#F3E5F5'}]}>
                <HelpIcon size={24} color="#9C27B0" />
              </View>
              <Text style={styles.optionText}>FAQs</Text>
            </View>
            <ChevronRightIcon size={24} color="#999" />
          </TouchableOpacity> */}
        </View>

        {/* Support Hours */}
        <View style={styles.hoursSection}>
          <Text style={styles.hoursTitle}>Support Hours</Text>
          <Text style={styles.hoursText}>
            Monday - Friday: 9:00 AM - 6:00 PM{'\n'}
            Saturday: 10:00 AM - 4:00 PM{'\n'}
            Sunday: Closed
          </Text>
        </View>
      </View>
    </PageWithHeader>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  hoursSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  hoursText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default CustomerSupport;
