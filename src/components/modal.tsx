import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import RNModal from 'react-native-modal';
import {moderateScale, scale} from '../utils/sizer';
import {textStyle} from '../constants/text-style';
import {themeColors} from '../constants/colors';

type HeaderObject = {
  title: string | React.ReactNode;
  description?: string;
};

type HeaderContent = React.ReactNode | HeaderObject;

type CustomModalProps = {
  parent: string;
  visible: boolean;
  onClose: (e?: GestureResponderEvent) => void;
  header?: HeaderContent;
  footer?: React.ReactNode;
  children: React.ReactNode;
  backdropStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  modalStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  footerStyle?: StyleProp<ViewStyle>;
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  enableKeyboardAvoiding?: boolean;
  enableScrollView?: boolean;
  keyboardVerticalOffset?: number;
  scrollViewProps?: any;
};

const CustomModal: React.FC<CustomModalProps> = ({
  parent,
  visible,
  onClose,
  header,
  footer,
  children,
  backdropStyle,
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
  console.log('opened modal', parent);
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
    let headerDescription: string | undefined;

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
    if (enableScrollView) {
      return (
        <ScrollView
          nestedScrollEnabled
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContentContainer,
            {flexGrow: 1, minHeight: 200},
            contentStyle,
          ]}
          removeClippedSubviews={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}>
          {children}
        </ScrollView>
      );
    }

    return (
      <View style={[styles.contentNoScroll, contentStyle]}>{children}</View>
    );
  };

  const renderModalContent = () => (
    <View style={[styles.modal, modalStyle]}>
      {renderHeader()}
      {renderContent()}
      {footer && <View style={[styles.footer, footerStyle]}>{footer}</View>}
    </View>
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
    <RNModal
      isVisible={visible}
      animationIn="bounceIn"
      animationOut="fadeInDown"
      animationInTiming={200}
      animationOutTiming={150}
      backdropTransitionOutTiming={0}
      backdropOpacity={0.3}
      useNativeDriver
      propagateSwipe
      onBackdropPress={closeOnBackdropPress ? onClose : undefined}
      style={[styles.backdrop, backdropStyle]}>
      {modalWrapper}
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: themeColors.surface.background,
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    width: '95%',
    maxWidth: 400,
    maxHeight: '100%',
  },
  header: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(15),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: themeColors.border.secondary,
    backgroundColor: themeColors.surface.background,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: scale(10),
  },
  headerTitleText: {
    ...textStyle.fs_mont_18_700,
    color: themeColors.text.primary,
    fontWeight: 'bold',
  },
  headerDescriptionText: {
    fontSize: 14,
    color: themeColors.text.secondary,
    marginTop: scale(4),
  },
  closeButton: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: themeColors.surface.secondarySurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    fontWeight: '600',
    color: themeColors.text.primary,
  },
  scrollView: {
    flexGrow: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(20),
  },
  contentNoScroll: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(20),
  },
  footer: {
    height: 'auto',
    paddingHorizontal: scale(20),
    paddingVertical: scale(15),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: themeColors.border.secondary,
    backgroundColor: themeColors.surface.background,
  },
});

export default CustomModal;
