import {View, Text, ScrollView} from 'react-native';
import React, {useState} from 'react';
import AstrologerCard from '../components/astrologers/astrologer-card';
import {colors} from '../constants/colors';
import ScreenLayout from '../components/screen-layout';
import TagSelector from '../components/tag-selector';
import AnimatedSearchInput from '../components/custom-searchbox';
import {scale, verticalScale} from '../utils/sizer';

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

const Astrologers = () => {
  const [selected, setSelected] = useState<string[]>(['all']);
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
        removable={true}
        multiSelect={false}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            backgroundColor: colors.primary_surface,
            flex: 1,
            paddingHorizontal: scale(12),
            marginBottom: verticalScale(20),
          }}>
          {astrologers.map((item, idx) => (
            <AstrologerCard
              key={`card-astrologer-${idx}`}
              name={item?.name}
              rate={item?.rate}
              rating={item?.rating}
              experience={item?.experience}
              languages={item?.languages}
              imageUri={item?.imageUri}
              onCallPress={() => console.log('Calling')}
              onVideoPress={() => console.log('Video')}
              onChatPress={() => console.log('Chat')}
            />
          ))}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

export default Astrologers;
