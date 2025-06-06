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

type CustomModalProps = {
  visible: boolean;
  onClose: (e?: GestureResponderEvent) => void;
  header?: React.ReactNode;
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
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback
        onPress={closeOnBackdropPress ? onClose : undefined}>
        <View style={[styles.backdrop, backdropStyle]} />
      </TouchableWithoutFeedback>

      <View style={[styles.container, containerStyle]}>
        <View style={[styles.modal, modalStyle]}>
          {(header || showCloseButton) && (
            <View style={[styles.header, headerStyle]}>
              <View style={styles.headerContent}>
                {header}
                {showCloseButton && (
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}>
                    <Text style={styles.closeText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

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
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#999',
  },
  content: {
    padding: 16,
  },
  footer: {
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
  },
});

export default CustomModal;
