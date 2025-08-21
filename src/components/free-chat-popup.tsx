import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import {themeColors} from '../constants/colors';
import CloseIcon from '../assets/icons/close-icon';
import ReactNativeModal from 'react-native-modal';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface FirstChatFreePopupProps {
  onClaimPress: () => void;
  onClose: () => void; // Changed from onClosePress to onClose
  isOpen: boolean; // New prop to control visibility
}

// Removed forwardRef as imperative handle is no longer needed for show/hide
const FirstChatFreePopup: React.FC<FirstChatFreePopupProps> = ({
  onClaimPress,
  onClose,
  isOpen,
}) => {
  // If not open, return null immediately to prevent rendering
  if (!isOpen) {
    return null;
  }

  return (
    <ReactNativeModal
      isVisible={isOpen}
      animationIn="bounceIn"
      animationOut="fadeInDown"
      animationInTiming={200}
      animationOutTiming={150}
      backdropTransitionOutTiming={0}
      backdropOpacity={0.3}
      useNativeDriver
      propagateSwipe
      onBackdropPress={onClose}
      style={[styles.backdrop]}>
      <View style={[styles.popupContainer]}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <CloseIcon />
        </TouchableOpacity>

        <View style={styles.iconPlaceholder}>
          {/* You can replace this with an actual icon (e.g., a gift, star, chat icon) */}
          <Text style={styles.iconText}>✨</Text>
        </View>

        <Text style={styles.title}>Your First Chat is FREE!</Text>
        <Text style={styles.subtitle}>
          Connect with an astrologer and get your first chat absolutely free.
        </Text>

        <TouchableOpacity style={styles.claimButton} onPress={onClaimPress}>
          <Text style={styles.claimButtonText}>Claim Your Free Chat Now!</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          *Terms and conditions apply. Limited time offer.
        </Text>
      </View>
    </ReactNativeModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: themeColors.surface.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    width: '85%',
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
  },
  iconPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700', // Gold color for a festive look
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconText: {
    fontSize: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  claimButton: {
    backgroundColor: '#4CAF50', // Green for action
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginBottom: 15,
    shadowColor: '#4CAF50',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default FirstChatFreePopup;
