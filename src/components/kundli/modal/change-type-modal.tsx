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
import {Astrologers, UserDetail} from '../../../utils/types';
import {useEffect, useState} from 'react';
import CustomModal from '../../modal';
import {Pressable, Text, View} from 'react-native';

const ChangeKundliTypeModal = ({
  isOpen,
  onClose,
  selectedOption,
  onChange,
}: {
  selectedOption: {label: string; id: string; value: string};
  isOpen: boolean;
  onClose: () => void;
  onChange: (obj: {label: string; id: string; value: string} | null) => void;
}) => {
  const durationOptions = [
    {label: 'East-Indian Style', id: 'east_indian_style', value: 'east'},
    {
      label: 'South-Indian Style',
      id: 'south_indian_style',
      value: 'south',
    },
    {
      label: 'North-Indian Style',
      id: 'north_indian_style',
      value: 'north',
    },
  ];
  const [selected, setSelected] = useState<null | {
    label: string;
    id: string;
    value: string;
  }>(selectedOption);

  useEffect(() => {
    setSelected(selectedOption);
  }, [selectedOption]);
  return (
    <CustomModal
      parent="kundli-type"
      header={{title: 'Chart Type', description: 'Choose the options'}}
      visible={isOpen}
      onClose={onClose}
      footer={
        <CustomButton
          title="Submit"
          onPress={() => {
            onChange(selected);
          }}
        />
      }>
      <Text
        style={[textStyle.fs_mont_14_700, {marginBottom: verticalScale(8)}]}>
        Choose Kundli Type
      </Text>
      <View style={{flexDirection: 'column', gap: scale(16)}}>
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

export default ChangeKundliTypeModal;
