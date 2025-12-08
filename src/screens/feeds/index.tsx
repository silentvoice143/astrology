import React from 'react';
import {View, FlatList} from 'react-native';
import PageWithHeader from '../../componentsV1/layout/page-with-header';
import FeedPost from './components/feed-post';
import {COLORS} from '../../constants/colors';

/* ✅ DUMMY FEED DATA (Multiple Images Per Post) */
const DUMMY_FEEDS = [
  {
    id: '1',
    astrologerName: 'Astro Riya',
    postImages: [
      require('../../assets/imgs/astrology-feed-demo.jpg'),
      require('../../assets/imgs/home-demo-img.png'),
      require('../../assets/imgs/astrology-feed-demo.jpg'),
    ],
    caption:
      '✨ Your stars today indicate financial growth and spiritual calmness.',
  },
  {
    id: '2',
    astrologerName: 'Tarot Master Kunal',
    postImages: [
      require('../../assets/imgs/home-demo-img.png'),
      require('../../assets/imgs/astrology-feed-demo.jpg'),
    ],
    caption:
      'Your tarot card for the day: The Star ⭐ A sign of hope and positivity.',
  },
  {
    id: '3',
    astrologerName: 'Pandit Arvind',
    postImages: [
      require('../../assets/imgs/astrology-feed-demo.jpg'),
      require('../../assets/imgs/astrology-feed-demo.jpg'),
    ],
    caption:
      '🪐 Shani Dev blessings will guide your career decisions this week.',
  },
  {
    id: '4',
    astrologerName: 'Numerology Expert Meena',
    postImages: [
      require('../../assets/imgs/home-demo-img.png'),
      require('../../assets/imgs/home-demo-img.png'),
      require('../../assets/imgs/astrology-feed-demo.jpg'),
    ],
    caption: '🔢 Number 5 people will feel energetic and adventurous today.',
  },
];

const Feeds = () => {
  return (
    <PageWithHeader themeMode="light" title="Astrosevaa" scrollEnabled={false}>
      <View style={{flex: 1, backgroundColor: COLORS.theme.white}}>
        <FlatList
          data={DUMMY_FEEDS}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 60}}
          renderItem={({item}) => (
            <FeedPost
              astrologerName={item.astrologerName}
              postImages={item.postImages}
              caption={item.caption}
            />
          )}
        />
      </View>
    </PageWithHeader>
  );
};

export default Feeds;
