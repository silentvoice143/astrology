import React from 'react';
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
} from 'react-native';
import {moderateScale, scale} from '../utils/sizer';
import {textStyle} from '../constants/text-style';
import {colors} from '../constants/colors';

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
  scrollViewProps?: any;
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
  function isHeaderObject(header: HeaderContent): header is HeaderObject {
    return typeof header === 'object' && header !== null && 'title' in header;
  }

  const renderHeader = () => {
    if (!header && !showCloseButton) return null;

    if (React.isValidElement(header)) {
      return (
        <View style={[styles.header, headerStyle]}>
          <View style={styles.headerContent}>
            {header}
            {showCloseButton && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    if (isHeaderObject(header)) {
      return (
        <View style={[styles.header, headerStyle]}>
          <View style={styles.headerContent}>
            <View style={{flex: 1}}>
              {typeof header.title === 'string' ? (
                <>
                  <Text style={[textStyle.fs_mont_18_700]}>{header.title}</Text>
                  {header.description && (
                    <Text style={styles.descriptionText}>
                      {header.description}
                    </Text>
                  )}
                </>
              ) : (
                header.title
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
    }

    return null;
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

  const renderModal = () => (
    <View style={[styles.container, containerStyle]}>
      <TouchableWithoutFeedback onPress={() => {}}>
        <View style={[styles.modal, modalStyle]}>
          {renderHeader()}
          {renderContent()}
          {footer && <View style={[styles.footer, footerStyle]}>{footer}</View>}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );

  const modalContent = enableKeyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}>
      {renderModal()}
    </KeyboardAvoidingView>
  ) : (
    renderModal()
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.backdrop, backdropStyle]}>
        <TouchableWithoutFeedback
          onPress={closeOnBackdropPress ? onClose : undefined}>
          <View style={styles.backdropTouchable} />
        </TouchableWithoutFeedback>
        {modalContent}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.bg.overlay,
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
  container: {
    maxWidth: '90%',
    maxHeight: '80%',
    width: '85%',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary_border,
    maxHeight: '100%',
  },
  header: {
    padding: scale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleText: {
    fontWeight: '700',
    color: '#222',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
  },
  scrollView: {
    flexGrow: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(12),
  },
  footer: {
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
  },
});

export default CustomModal;
