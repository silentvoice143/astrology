import {View, Text, ScrollView} from 'react-native';
import React from 'react';
import ScreenLayout from '../components/screen-layout';

const About = () => {
  return (
    <ScreenLayout>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
        <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>
          About AstroSeva
        </Text>
        <Text style={{fontSize: 16, textAlign: 'center', color: '#555'}}>
          AstroSeva is your personalized astrology companion, bringing ancient
          Vedic wisdom to your fingertips. Explore detailed kundli charts, daily
          horoscopes, and expert predictions in a modern, easy-to-use interface.
          Built with React Native for Android, AstroSeva delivers accurate
          astrological insights and seamless chat sessions with astrologers,
          helping you make informed decisions about your future — all in a
          beautifully crafted, secure mobile experience.
        </Text>
        <Text style={{marginTop: 20, fontSize: 14, color: '#888'}}>
          Version 0.0.1
        </Text>
      </ScrollView>
    </ScreenLayout>
  );
};

export default About;
