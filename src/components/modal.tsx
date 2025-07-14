import React, {useState, useEffect, useRef} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated, // Import Animated
  Easing, // Import Easing
} from 'react-native';
import {moderateScale, scale} from '../utils/sizer';
import {textStyle} from '../constants/text-style';
import {colors, themeColors} from '../constants/colors'; // Ensure themeColors is imported

type HeaderObject = {
  title: string | React.ReactNode;
  description?: string;
};

type HeaderContent = React.ReactNode | HeaderObject;

type CustomModalProps = {
  visible: boolean;
  onClose: (e?: GestureResponderEvent) => void;
  header?: HeaderContent;
  footer?: React.ReactNode;
  children: React.ReactNode;

  // Style overrides
  backdropStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  modalStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  footerStyle?: StyleProp<ViewStyle>;

  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;

  // Keyboard and scroll options
  enableKeyboardAvoiding?: boolean;
  enableScrollView?: boolean;
  keyboardVerticalOffset?: number;
  scrollViewProps?: any; // Consider a more specific type if possible
};

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  header,
  footer,
  children,
  backdropStyle,
  containerStyle,
  modalStyle,
  headerStyle,
  contentStyle,
  footerStyle,
  showCloseButton = true,
  closeOnBackdropPress = true,
  enableKeyboardAvoiding = true,
  enableScrollView = true,
  keyboardVerticalOffset = 0,
  scrollViewProps = {},
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Start slightly scaled down
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Animation logic for modal appearance/disappearance
  useEffect(() => {
    if (visible) {
      // Reset values before showing to ensure smooth re-entry
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]); // Depend on the 'visible' prop

  function isHeaderObject(
    headerContent: HeaderContent,
  ): headerContent is HeaderObject {
    return (
      typeof headerContent === 'object' &&
      headerContent !== null &&
      'title' in headerContent
    );
  }

  const renderHeader = () => {
    if (!header && !showCloseButton) return null;

    let headerTitle: React.ReactNode = null;
    let headerDescription: string | undefined = undefined;

    if (React.isValidElement(header)) {
      headerTitle = header;
    } else if (isHeaderObject(header)) {
      headerTitle =
        typeof header.title === 'string' ? (
          <Text style={styles.headerTitleText}>{header.title}</Text>
        ) : (
          header.title
        );
      headerDescription = header.description;
    }

    console.log(showCloseButton, '-------------show close btn');

    return (
      <View style={[styles.header, headerStyle]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            {headerTitle}
            {headerDescription && (
              <Text style={styles.headerDescriptionText}>
                {headerDescription}
              </Text>
            )}
          </View>
          {showCloseButton && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderContent = () => {
    const content = (
      <View style={[styles.content, contentStyle]}>{children}</View>
    );

    if (enableScrollView) {
      return (
        <ScrollView
          nestedScrollEnabled={true}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}>
          {content}
        </ScrollView>
      );
    }

    return content;
  };

  const renderModalContent = () => (
    <Animated.View // Apply animations here
      style={[
        styles.modal,
        modalStyle,
        {
          transform: [{scale: scaleAnim}],
          opacity: opacityAnim,
        },
      ]}>
      {renderHeader()}
      {renderContent()}
      {footer && <View style={[styles.footer, footerStyle]}>{footer}</View>}
    </Animated.View>
  );

  const modalWrapper = enableKeyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}>
      {renderModalContent()}
    </KeyboardAvoidingView>
  ) : (
    renderModalContent()
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback
        onPress={closeOnBackdropPress ? onClose : undefined}>
        <View style={[styles.backdrop, backdropStyle]}>
          {/* This empty view ensures the backdrop TouchableWithoutFeedback covers the whole screen */}
          <View style={styles.backdropTouchable} />
          <TouchableWithoutFeedback onPress={() => {}}>
            {/* This inner TouchableWithoutFeedback prevents closing when tapping inside the modal content */}
            {modalWrapper}
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: themeColors.surface.overlay, // Using themeColors for consistency
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modal: {
    backgroundColor: themeColors.surface.background, // Primary surface for modal background
    borderRadius: moderateScale(12), // Slightly smaller radius for elegance
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6}, // More pronounced shadow
    shadowOpacity: 0.25,
    shadowRadius: 12, // Larger shadow radius for softness
    elevation: 12, // Higher elevation for Android
    width: '95%', // Default width
    maxWidth: 400, // Max width for larger screens
    maxHeight: '90%', // Max height to prevent overflow
  },
  header: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(15),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: themeColors.border.secondary, // Themed border color
    backgroundColor: themeColors.surface.background, // Slightly different background for header
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Align items center for better vertical alignment
  },
  headerTextContainer: {
    flex: 1, // Allow text to take up space
    marginRight: scale(10), // Space before close button
  },
  headerTitleText: {
    ...textStyle.fs_mont_18_700, // Using provided textStyle
    color: themeColors.text.primary, // Themed text color
    fontWeight: 'bold',
  },
  headerDescriptionText: {
    fontSize: 14,
    color: themeColors.text.secondary, // Themed text color
    marginTop: scale(4),
  },
  closeButton: {
    width: scale(30), // Fixed size for touch target
    height: scale(30),
    borderRadius: scale(15), // Circular button
    backgroundColor: themeColors.surface.secondarySurface, // Subtle background for close button
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    fontWeight: '600',
    color: themeColors.text.primary, // Themed text color for close icon
  },
  scrollView: {
    flexGrow: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: scale(20), // Increased padding
    paddingVertical: scale(20),
    flexGrow: 1, // Allow content to expand
  },
  footer: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(15),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: themeColors.border.secondary, // Themed border color
    backgroundColor: themeColors.surface.background, // Consistent with header background
  },
});

export default CustomModal;
