import {View, Text, ScrollView} from 'react-native';
import React, {useEffect, useState} from 'react';
import ScreenLayout from '../components/screen-layout';
import {useAppDispatch} from '../hooks/redux-hook';
import {
  clearSession,
  getQueueRequest,
  setChatUser,
  setOtherUser,
  setQueueCount,
  setSession,
  skipSessionRequest,
} from '../store/reducer/session';
import CustomButton from '../components/custom-button';
import {acceptSessionRequest} from '../store/reducer/session';
import {UserDetail, UserPersonalDetail} from '../utils/types';
import UserRequestCard from '../components/session/user-request-card';
import {scale, verticalScale} from '../utils/sizer';
import {useNavigation} from '@react-navigation/native';
import {textStyle} from '../constants/text-style';
import Toast from 'react-native-toast-message';
import AboutIcon from '../assets/icons/about-icon';
import {themeColors} from '../constants/colors';

const RequestScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const [request, setReuest] = useState<UserDetail[]>([]);
  const getAllRequests = async () => {
    try {
      const payload = await dispatch(getQueueRequest()).unwrap();
      console.log(payload, '-----all session requests');
      if (payload.success) {
        setReuest(payload?.users);
        dispatch(setQueueCount(payload?.users.length));
      } else {
        Toast.show({
          type: 'info',
          text1: 'Something went wrong! try again',
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAccept = async (user: UserDetail) => {
    try {
      const payload = await dispatch(acceptSessionRequest(user.id)).unwrap();
      console.log(payload, '----accepted res');
      if (payload.success) {
        dispatch(setOtherUser(user));
        navigation.navigate('chat');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSkip = async (user: UserDetail) => {
    try {
      const payload = await dispatch(skipSessionRequest(user.id)).unwrap();
      console.log(payload, '----skip res');
      if (payload.success) {
        dispatch(clearSession());
        getAllRequests();
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAllRequests();
  }, []);
  return (
    <ScreenLayout>
      <ScrollView style={{flex: 1}} contentContainerStyle={{flex: 1}}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: scale(20),
            paddingVertical: verticalScale(20),
          }}>
          {request.length > 0 ? (
            request.map((user, index) => (
              <View key={`${index}-${user?.id}`}>
                <UserRequestCard
                  data={user}
                  onAccept={() => {
                    handleAccept(user);
                  }}
                  onSkip={() => {
                    handleSkip(user);
                  }}
                  showActions={index === 0}
                />
              </View>
            ))
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                  padding: scale(20),
                }}>
                <AboutIcon color={themeColors.status.info.dark} />
                <Text style={[textStyle.fs_mont_14_400]}>No Request Yet</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

export default RequestScreen;
