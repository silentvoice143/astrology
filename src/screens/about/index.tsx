import {View, Text, ScrollView, Image} from 'react-native';
import React from 'react';
import PageWithHeader from '../../componentsV1/layout/page-with-header';
import {COLORS} from '../../constants/colors';
import DeviceInfo from 'react-native-device-info';
import {Linking} from 'react-native';

const About = () => {
  const appVersion = DeviceInfo.getVersion(); // e.g. 1.0.3
  const buildNumber = DeviceInfo.getBuildNumber(); // optional
  return (
    <PageWithHeader title="About AstroSevaa">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
          backgroundColor: COLORS.theme.white,
        }}>
        <Image
          style={{marginBottom: 20, height: 100, width: 100}}
          source={require('../../assets/imgs/logo.png')}
        />
        <Text style={{fontSize: 16, textAlign: 'center', color: '#555'}}>
          Astrosevaa is a trusted astrology app designed to deliver accurate,
          personalized guidance through expert astrologers. Users can consult
          professionals via audio and video calls for insights on career,
          relationships, finance, health, and life decisions. The app combines
          traditional Vedic astrology with modern technology to ensure fast,
          private, and reliable consultations. With easy appointment booking,
          secure payments, and verified astrologers, Astrosevaa removes
          guesswork and fake predictions. Whether you seek clarity, direction,
          or solutions, Astrosevaa focuses on practical answers—not
          superstition—helping users make informed decisions with confidence and
          convenience, anytime and anywhere.
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontSize: 13,
            color: COLORS.theme.primary,
          }}
          onPress={() => Linking.openURL('https://insapimarketing.com')}>
          Developed & Marketed by insapimarketing.com
        </Text>
        <Text style={{marginTop: 20, fontSize: 14, color: '#888'}}>
          Version {appVersion} ({buildNumber})
        </Text>
      </ScrollView>
    </PageWithHeader>
  );
};

export default About;
