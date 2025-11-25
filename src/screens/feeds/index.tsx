import React from 'react';
import {View} from 'react-native';
import PageWithHeader from '../../componentsV1/layout/page-with-header';
import FeedPost from './components/feed-post';
import {COLORS} from '../../constants/colors';

const Feeds = () => {
  return (
    <PageWithHeader themeMode="light">
      <View style={{paddingBottom: 60, backgroundColor: COLORS.theme.white}}>
        {/* Multiple posts like Instagram */}

        <FeedPost
          astrologerName="Astro Riya"
          postImage={require('../../assets/imgs/astrology-feed-demo.jpg')}
          caption="✨ Your stars today indicate financial growth and spiritual calmness."
        />
        <FeedPost
          astrologerName="Tarot Master Kunal"
          postImage={require('../../assets/imgs/home-demo-img.png')}
          caption="Your tarot card for the day: The Star ⭐ A sign of hope and positivity."
        />
      </View>
    </PageWithHeader>
  );
};

export default Feeds;
