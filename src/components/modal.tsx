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
} from 'react-native';
import {scale} from '../utils/sizer';
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

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View>
        <TouchableWithoutFeedback
          onPress={closeOnBackdropPress ? onClose : undefined}>
          <View style={[styles.backdrop, backdropStyle]} />
        </TouchableWithoutFeedback>
      </View>

      <View style={[styles.container, containerStyle]}>
        <View style={[styles.modal, modalStyle]}>
          {renderHeader()}

          <View style={[styles.content, contentStyle]}>{children}</View>

          {footer && <View style={[styles.footer, footerStyle]}>{footer}</View>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    borderWidth: 1,
    borderColor: colors.primary_border,
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
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
    fontWeight: 700,
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
  content: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(0),
  },
  footer: {
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
  },
});

export default CustomModal;
