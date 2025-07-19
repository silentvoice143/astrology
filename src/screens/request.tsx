import {View, Text, ScrollView} from 'react-native';
import React, {useEffect, useState} from 'react';
import ScreenLayout from '../components/screen-layout';
import {useAppDispatch} from '../hooks/redux-hook';
import {
  getQueueRequest,
  setChatUser,
  setOtherUser,
} from '../store/reducer/session';
import CustomButton from '../components/custom-button';
import {acceptSessionRequest} from '../store/reducer/session/action';
import {UserDetail, UserPersonalDetail} from '../utils/types';
import UserRequestCard from '../components/session/user-request-card';
import {scale, verticalScale} from '../utils/sizer';
import {useNavigation} from '@react-navigation/native';
import {textStyle} from '../constants/text-style';
import Toast from 'react-native-toast-message';

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

  useEffect(() => {
    getAllRequests();
  }, []);
  return (
    <ScreenLayout>
      <ScrollView>
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
                  onSkip={() => {}}
                />
              </View>
            ))
          ) : (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={[textStyle.fs_mont_16_500]}>No Request Yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

export default RequestScreen;
