import {View, Text} from 'react-native';
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

const RequestScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const [request, setReuest] = useState<UserDetail[]>([]);
  const getAllRequests = async () => {
    try {
      const payload = await dispatch(getQueueRequest()).unwrap();
      console.log(payload, '-----all session requests');
      setReuest(payload?.users);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const payload = await dispatch(acceptSessionRequest(id)).unwrap();
      console.log(payload, '----accepted res');
      if (payload.success) {
        dispatch(setOtherUser(id));
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
      <View
        style={{
          paddingHorizontal: scale(20),
          paddingVertical: verticalScale(20),
        }}>
        {request.length > 0 &&
          request.map((user, index) => (
            <View key={`${index}-${user?.id}`}>
              <UserRequestCard
                data={user}
                onAccept={() => {
                  handleAccept(user?.id);
                }}
                onSkip={() => {}}
              />
            </View>
          ))}
      </View>
    </ScreenLayout>
  );
};

export default RequestScreen;
