import {View, Text, TouchableOpacity, Touchable, Pressable} from 'react-native';
import React, {useState} from 'react';
import CustomModal from '../../modal';
import ControlledTagSelector from '../../controlled-tag-selector';
import CustomButton from '../../custom-button';
import {scale, verticalScale} from '../../../utils/sizer';
import {colors} from '../../../constants/colors';
import {textStyle} from '../../../constants/text-style';
import CheckIcon from '../../../assets/icons/checkIcon';
import {useAppDispatch} from '../../../hooks/redux-hook';
import {
  sendSessionRequest,
  setChatUser,
  setOtherUser,
} from '../../../store/reducer/session';
import {useNavigation} from '@react-navigation/native';

const RequestSessionModal = ({isOpen, onClose, astrologerId}) => {
  const durationOptions = [
    {label: '5m', id: '5m', value: 5},
    {label: '10m', id: '10m', value: 10},
    {label: '15m', id: '15m', value: 15},
    {label: '30m', id: '30m', value: 30},
    {label: '1h', id: '1h', value: 60},
  ];
  const [selected, setSelected] = useState<null | {
    label: string;
    id: string;
    value: number;
  }>(null);

  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  const requestSession = async () => {
    try {
      const body = {astrologerId: astrologerId, duration: selected?.value};
      const payload = await dispatch(sendSessionRequest(body)).unwrap();
      console.log(body, payload, '----body');

      if (payload.success) {
        dispatch(setOtherUser(astrologerId));
        navigation.navigate('chat');
      }

      console.log(payload);
    } catch (err) {
      console.log('sendSessionRequest Error : ', err);
    }
  };
  return (
    <CustomModal
      header={{title: 'Start Session', description: 'Choose the options'}}
      visible={isOpen}
      onClose={onClose}
      footer={
        <CustomButton
          title="Start Session"
          onPress={() => {
            requestSession();
          }}
        />
      }>
      <Text
        style={[textStyle.fs_mont_14_700, {marginBottom: verticalScale(8)}]}>
        Choose Duration
      </Text>
      <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: scale(16)}}>
        {durationOptions.map(item => (
          <Pressable
            onPress={() => setSelected(item)}
            key={item.id}
            style={{flexDirection: 'row', gap: scale(8), alignItems: 'center'}}>
            <View
              style={{
                borderRadius: scale(6),
                borderWidth: 1,
                borderColor:
                  selected?.id === item.id
                    ? colors.success.base
                    : colors.secondaryText,
                backgroundColor:
                  selected?.id === item.id
                    ? colors.success.base
                    : colors.primary_surface,
              }}>
              <CheckIcon size={16} color={colors.whiteText} />
            </View>
            <Text style={[textStyle.fs_mont_14_700]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </CustomModal>
  );
};

export default RequestSessionModal;
