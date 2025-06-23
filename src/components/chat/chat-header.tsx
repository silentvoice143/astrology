// components/chat/chat-header.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import { scale, verticalScale } from '../../utils/sizer';

interface ChatHeaderProps {
  name: string;
  profileImage: ImageSourcePropType;
  onBackPress: () => void;
  onMenuPress: () => void;
  subtitle?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  profileImage,
  onBackPress,
  onMenuPress,
  subtitle,
  showOnlineStatus = false,
  isOnline = false,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.profileContainer}>
        <View style={styles.imageContainer}>
          <Image source={profileImage} style={styles.profileImage} />
          {showOnlineStatus && (
            <View style={[
              styles.onlineIndicator,
              isOnline ? styles.online : styles.offline
            ]} />
          )}
        </View>
        
        <View style={styles.nameContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {subtitle && (
            <Text style={[
              styles.subtitle,
              subtitle === 'typing...' && styles.typingText
            ]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <Text style={styles.menuIcon}>⋮</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    paddingTop: verticalScale(50), // Account for status bar
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: scale(8),
    marginRight: scale(8),
  },
  backIcon: {
    fontSize: scale(24),
    color: 'white',
    fontWeight: 'bold',
  },
  profileContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginRight: scale(12),
  },
  profileImage: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    borderWidth: 2,
    borderColor: 'white',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    borderWidth: 2,
    borderColor: 'white',
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#757575',
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: scale(12),
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: scale(2),
  },
  typingText: {
    fontStyle: 'italic',
    color: '#FFE082',
  },
  menuButton: {
    padding: scale(8),
    marginLeft: scale(8),
  },
  menuIcon: {
    fontSize: scale(20),
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatHeader;