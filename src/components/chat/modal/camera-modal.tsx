import React, {useEffect, useRef, useState} from 'react';
import {View, TouchableOpacity, StyleSheet, Modal, Text} from 'react-native';
import {Camera, useCameraDevice} from 'react-native-vision-camera';
import {moderateScale} from '../../../utils/sizer';
import {useIsFocused} from '@react-navigation/native';
import {useCameraPermission} from '../../../hooks/use-camera-permission';
import CloseIcon from '../../../assets/icons/close-icon';
import {colors, themeColors} from '../../../constants/colors';
import PalmIcon from '../../../assets/icons/palm-icon';

const CameraModal = ({visible, onClose, onCapture}: any) => {
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const isFocused = useIsFocused();
  const {hasPermission, requestPermission} = useCameraPermission();

  const takePhoto = async () => {
    if (camera.current == null) return;
    const photo = await camera.current.takePhoto({flash: 'off'});
    onCapture(photo.path); // local path to image
    onClose();
  };

  useEffect(() => {
    requestPermission();
  }, []);

  if (!device) return null;
  if (!hasPermission) return null;

  return (
    <Modal visible={visible} transparent>
      <View style={styles.modalContainer}>
        {isFocused && (
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={visible}
            photo={true}
          />
        )}

        <View style={styles.control}>
          <TouchableOpacity onPress={onClose} style={styles.close}>
            <CloseIcon color={themeColors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={takePhoto} style={styles.capture}>
            <View style={styles.innerCapture} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {flex: 1, backgroundColor: '#000'},
  control: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  capture: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCapture: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
  },
  close: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: themeColors.surface.background,
    borderRadius: 20,
    padding: 6,
  },
});

export default CameraModal;
