import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import ScreenLayout from '../components/screen-layout';
import AnimatedSearchInput from '../components/custom-searchbox';
import CustomButton from '../components/custom-button';
import HomeStyle from './Home.styles';
import ChatIcon from '../assets/icons/ChatIcon';
import CallIcon from '../assets/icons/CallIcon';
import {textStyle} from '../constants/text-style';
import KundliLogo from '../assets/icons/KundliLogo';

const Home = () => {
  const [search, setSearch] = useState('');

  return (
    <ScreenLayout>
      <View style={HomeStyle.container}>
        {/* Greeting */}
        <View style={HomeStyle.greetingContainer}>
          <Text style={[textStyle.fs_mont_20_400]}>Hello</Text>
          <Text style={[textStyle.fs_mont_32_400, HomeStyle.userName]}>
            Satyam
          </Text>
        </View>

        {/* Horoscope Button */}
        <CustomButton
          title="Today's horoscope"
          onPress={() => {}}
          style={HomeStyle.horoscopeButton}
          textStyle={[textStyle.fs_mont_14_500, HomeStyle.horoscopeText]}
        />

        {/* Search Bar */}
        <AnimatedSearchInput
          placeholder="Search here for pandits"
          value={search}
          onChangeText={setSearch}
          iconPosition="left"
          containerStyle={HomeStyle.searchContainer}
          inputContainerStyle={HomeStyle.searchInput}
        />

        {/* Quick Actions */}
        {/* Quick Actions */}
        <View style={HomeStyle.actionsContainer}>
          <View style={HomeStyle.singleAction}>
            <TouchableOpacity style={HomeStyle.actionCard}>
              <CallIcon />
            </TouchableOpacity>
            <Text
              style={[textStyle.fs_mont_14_400, HomeStyle.actionText]}
              numberOfLines={1}
              ellipsizeMode="tail">
              Talk to Astrologer
            </Text>
          </View>

          <View style={HomeStyle.singleAction}>
            <TouchableOpacity style={HomeStyle.actionCard}>
              <ChatIcon />
            </TouchableOpacity>
            <Text
              style={[textStyle.fs_mont_14_400, HomeStyle.actionText]}
              numberOfLines={1}
              ellipsizeMode="tail">
              Chat with Astrologer
            </Text>
          </View>
        </View>

        {/* View Kundli Button */}
        <TouchableOpacity style={HomeStyle.kundliButton} onPress={() => {}}>
          <KundliLogo />
          <Text style={[textStyle.fs_mont_20_400, HomeStyle.kundliText]}>
            View kundli
          </Text>
        </TouchableOpacity>

        {/* Section Title */}
        <Text style={[textStyle.fs_mont_18_600, HomeStyle.sectionTitle]}>
          Our Astrologers
        </Text>
      </View>
    </ScreenLayout>
  );
};

export default Home;
