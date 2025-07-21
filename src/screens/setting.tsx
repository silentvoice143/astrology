import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors, themeColors} from '../constants/colors';
import {moderateScale, scale, scaleFont, verticalScale} from '../utils/sizer';
import {textStyle} from '../constants/text-style';
import ScreenLayout from '../components/screen-layout';
import ChevronRightIcon from '../assets/icons/chevron-right';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {logout} from '../store/reducer/auth';
import {clearSession} from '../store/reducer/session';
import {useTranslation} from 'react-i18next';

const settingsOptions = [
  {title: 'Language', screen: 'Language'},
  // {title: 'Notifications', screen: 'Notifications'},
  {title: 'Terms & Conditions', screen: 'TermsAndConditions'},
  {title: 'Rate the App', screen: 'RateApp'},
  {title: 'Help / Contact Support', screen: 'customer-support'},

  {title: 'Logout', screen: 'Logout'},
];

const Setting = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(state => state.auth);
  const {t} = useTranslation();
  const handleLogout = async () => {
    try {
      await dispatch(logout());
      dispatch(clearSession());
    } catch (err) {
      console.log(err);
    }
  };
  const handlePress = (screen: string) => {
    if (screen === 'Logout') {
      handleLogout();
      return;
    }
    navigation.navigate(screen);
  };

  const profileImage =
    user?.gender === 'MALE' || !user?.gender
      ? require('../assets/imgs/male.jpg')
      : require('../assets/imgs/female.jpg');

  return (
    <ScreenLayout headerBackgroundColor={themeColors.surface.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={{}}>
            {user.imgUri ? (
              <Image source={{uri: user.imgUri}} style={styles.profileImage} />
            ) : (
              <Image source={profileImage} style={styles.profileImage} />
            )}
          </View>

          <View
            style={{
              justifyContent: 'space-between',
              flexDirection: 'row',
              flex: 1,
              alignItems: 'center',
            }}>
            <View>
              <Text style={styles.name}>{'Hello'}</Text>
              <Text style={styles.phone}>{'+91 1234567890'}</Text>
            </View>
            <View style={{justifyContent: 'center'}}>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                <Text style={[textStyle.fs_mont_14_600]}>{t('Manage')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Text
          style={[
            textStyle.fs_mont_12_400,
            {color: themeColors.text.muted, paddingHorizontal: scale(10)},
          ]}>
          {t('setting&preferences')}
        </Text>
        {settingsOptions.map((item, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => handlePress(item.screen)}>
              <Text style={styles.optionText}>{t(item.title)}</Text>
              {item.title !== 'Logout' && <ChevronRightIcon strokeWidth={1} />}
            </TouchableOpacity>

            {/* 🔹 Separator after Notifications */}
            {item.title === 'Language' && <View style={styles.separator} />}

            {/* 🔹 Separator after Help */}
            {item.title === 'Help / Contact Support' && (
              <View style={styles.separator} />
            )}
          </React.Fragment>
        ))}
      </ScrollView>
    </ScreenLayout>
  );
};

export default Setting;

const styles = StyleSheet.create({
  container: {
    padding: scale(16),
    backgroundColor: themeColors.surface.background ?? '#F5F5F5',
  },
  header: {
    paddingHorizontal: scale(10),
    flexDirection: 'row',
    gap: scale(20),
    backgroundColor: themeColors.surface.background,
    paddingVertical: 16,
    marginBottom: verticalScale(20),
  },
  profileImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(24),
    borderWidth: 1,
    borderColor: themeColors.border.primary,
  },
  name: {
    fontSize: scaleFont(18),
    fontWeight: '600',
  },
  phone: {
    fontSize: scaleFont(14),
    fontWeight: '400',
  },
  option: {
    backgroundColor: themeColors.surface.background ?? '#FFFFFF',
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(20),
    borderRadius: scale(10),
    marginBottom: verticalScale(6),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionText: {
    ...textStyle.fs_mont_14_400,
    color: colors.primaryText ?? '#333',
  },
  separator: {
    height: 1,
    backgroundColor: themeColors.surface.border ?? '#E0E0E0',
    marginVertical: verticalScale(12),
  },
});
