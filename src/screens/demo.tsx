import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  StyleSheet,
  PanResponder,
  Animated,
} from 'react-native';
import CheckIcon from '../assets/icons/checkIcon';
import MenuIcon from '../assets/icons/menu-icon';
import SearchIcon from '../assets/icons/search-icon';

const {width: screenWidth} = Dimensions.get('window');

const tabs = [
  {label: 'All', count: 10},
  {label: 'Mine', count: null},
  {label: 'Lufy', count: null},
  {label: 'Dhgddgdfff', count: null},
  {label: 'Groups', count: null},
];

const TelegramInterface = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const tabScrollRef = useRef<ScrollView | null>(null);
  const contentTranslateX = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const tabPositions = useRef<{x: number; width: number}[]>([]).current;

  const scrollToActiveTab = (tabIndex: number) => {
    if (tabScrollRef.current && tabPositions[tabIndex]) {
      const tabInfo = tabPositions[tabIndex];
      const tabCenterX = tabInfo.x + tabInfo.width / 2;
      const screenCenterX = screenWidth / 2;
      const scrollPosition = Math.max(0, tabCenterX - screenCenterX);

      tabScrollRef.current.scrollTo({
        x: scrollPosition,
        animated: true,
      });
    }
  };

  const changeTab = (newTab: number) => {
    if (newTab !== activeTab) {
      const direction = newTab > activeTab ? 1 : -1;

      // Start exit animation
      Animated.parallel([
        Animated.timing(contentTranslateX, {
          toValue: -direction * 30,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Change tab and reset position for entry animation
        setActiveTab(newTab);
        contentTranslateX.setValue(direction * 30);

        // Start entry animation
        Animated.parallel([
          Animated.timing(contentTranslateX, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();

        // Scroll to active tab after a short delay
        setTimeout(() => scrollToActiveTab(newTab), 100);
      });
    }
  };

  useEffect(() => {
    scrollToActiveTab(activeTab);
  }, []);

  const onTabLayout = (event: any, index: number) => {
    const {x, width} = event.nativeEvent.layout;
    tabPositions[index] = {x, width};
  };

  const chatData: Record<number, any[]> = {
    0: [
      // All chats
      {
        id: 1,
        name: 'Sunshine😍',
        message: 'Hn',
        time: 'Fri',
        avatar: 'S',
        avatarColor: '#3b82f6',
        unread: 0,
      },
      {
        id: 2,
        name: 'Shailu Yaduvanshi',
        message: 'Bye bye',
        time: 'Tue',
        avatar: 'S',
        avatarColor: '#6b7280',
        unread: 0,
      },
      {
        id: 3,
        name: 'Harry Trader | Trading Signals',
        message: '📊 Update: July 26 - Profit 10/...',
        time: '5:21 PM',
        avatar: 'H',
        avatarColor: '#10b981',
        unread: 4,
        verified: true,
      },
      {
        id: 4,
        name: 'GETMODSAPK.COM - Official',
        message: '📱 YouTube Premium v20.30.32...',
        time: '4:55 PM',
        avatar: 'G',
        avatarColor: '#059669',
        unread: 366,
      },
      {
        id: 5,
        name: 'Saved Messages',
        message: 'Doreamon all movies in hindi: Doraemo...',
        time: '3:35 PM',
        avatar: 'bookmark',
        avatarColor: '#2563eb',
        unread: 0,
        isIcon: true,
      },
      {
        id: 6,
        name: 'HELLO DOWNLOAD LINK',
        message: 'E4 Betrothed Sister Ex 1080p Sub...',
        time: '11:08 AM',
        avatar: 'H',
        avatarColor: '#8b5cf6',
        unread: 9,
      },
      {
        id: 7,
        name: 'WIND BREAKER',
        message: '💥😁 Tougen Anki: Legend of the C...',
        time: '4:33 AM',
        avatar: 'W',
        avatarColor: '#4b5563',
        unread: 0,
      },
      {
        id: 8,
        name: 'THE LAST SUMMONER HINDI DUBBED',
        message: '🚀 📱 ━━━━━━━━━ ...',
        time: 'Fri',
        avatar: 'T',
        avatarColor: '#1d4ed8',
        unread: 1,
      },
      {
        id: 9,
        name: 'Classroom For Heroes',
        message: '🚀 ⚔️ 🔧 Record of Ragnarok Seaso...',
        time: 'Fri',
        avatar: 'C',
        avatarColor: '#ef4444',
        unread: 2,
      },
      {
        id: 10,
        name: 'Pankaj Sarkar',
        message: '',
        time: 'Fri',
        avatar: 'P',
        avatarColor: '#6b7280',
        unread: 0,
      },
    ],
    1: [
      // Mine
      {
        id: 1,
        name: 'Saved Messages',
        message: 'My personal notes and files',
        time: '2:30 PM',
        avatar: 'bookmark',
        avatarColor: '#2563eb',
        unread: 0,
        isIcon: true,
      },
      {
        id: 2,
        name: 'My Channel',
        message: 'Latest updates from my channel',
        time: '1:15 PM',
        avatar: 'M',
        avatarColor: '#8b5cf6',
        unread: 3,
      },
    ],
    2: [
      // Lufy
      {
        id: 1,
        name: 'Lufy Official',
        message: 'One Piece latest episode is out!',
        time: '6:45 PM',
        avatar: 'L',
        avatarColor: '#ef4444',
        unread: 5,
      },
      {
        id: 2,
        name: 'Lufy Updates',
        message: 'Manga chapter 1088 discussion',
        time: '4:20 PM',
        avatar: 'L',
        avatarColor: '#f97316',
        unread: 12,
      },
    ],
    3: [
      // Dhgddgdfff
      {
        id: 1,
        name: 'Random Group Chat',
        message: 'Hey everyone, how are you doing?',
        time: '3:15 PM',
        avatar: 'R',
        avatarColor: '#10b981',
        unread: 7,
      },
    ],
    4: [
      // Groups
      {
        id: 1,
        name: 'Anime Lovers',
        message: "Sarah: What's your favorite anime?",
        time: '7:30 PM',
        avatar: 'group',
        avatarColor: '#6366f1',
        unread: 15,
        isIcon: true,
      },
      {
        id: 2,
        name: 'Tech Discussion',
        message: 'Mike: Check out this new framework',
        time: '6:15 PM',
        avatar: 'group',
        avatarColor: '#06b6d4',
        unread: 8,
        isIcon: true,
      },
      {
        id: 3,
        name: 'Movie Club',
        message: "Emma: Tonight's movie suggestions",
        time: '5:45 PM',
        avatar: 'group',
        avatarColor: '#ec4899',
        unread: 23,
        isIcon: true,
      },
    ],
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
      Math.abs(gestureState.dx) > 10,
    onPanResponderGrant: () => {
      translateX.setOffset((translateX as any)._value);
    },
    onPanResponderMove: (_, gestureState) => {
      translateX.setValue(gestureState.dx);
    },
    onPanResponderRelease: (_, gestureState) => {
      translateX.flattenOffset();
      const threshold = screenWidth * 0.2;
      let newTab = activeTab;

      if (gestureState.dx > threshold && activeTab > 0) {
        newTab = activeTab - 1;
      } else if (gestureState.dx < -threshold && activeTab < tabs.length - 1) {
        newTab = activeTab + 1;
      }

      if (newTab !== activeTab) {
        changeTab(newTab);
      }

      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    },
  });

  const renderAvatar = (chat: any) => (
    <View style={[styles.avatar, {backgroundColor: chat.avatarColor}]}>
      <Text style={styles.avatarText}>{chat.avatar || 'T'}</Text>
    </View>
  );

  const renderChatItem = (chat: any) => (
    <TouchableOpacity key={chat.id} style={styles.chatItem}>
      {renderAvatar(chat)}
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <View style={styles.nameContainer}>
            <Text style={styles.chatName} numberOfLines={1}>
              {chat.name}
            </Text>
            {chat.verified && (
              <View style={styles.verifiedBadge}>
                <CheckIcon />
              </View>
            )}
          </View>
          <Text style={styles.chatTime}>{chat.time}</Text>
        </View>
        <View style={styles.messageContainer}>
          <Text style={styles.chatMessage} numberOfLines={1}>
            {chat.message}
          </Text>
          {chat.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {chat.unread > 99 ? '99+' : chat.unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1f2937" barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MenuIcon />
          <Text style={styles.headerTitle}>Telegram</Text>
        </View>
        <SearchIcon />
      </View>

      <View style={styles.tabContainer}>
        <ScrollView
          ref={tabScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => changeTab(index)}
              onLayout={e => onTabLayout(e, index)}
              style={[styles.tab, activeTab === index && styles.activeTab]}>
              <Animated.View
                style={[
                  styles.tabContent,
                  {
                    transform: [
                      {
                        scale: activeTab === index ? 1.05 : 1,
                      },
                    ],
                  },
                ]}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === index && styles.activeTabText,
                  ]}>
                  {tab.label}
                </Text>
                {tab.count && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{tab.count}</Text>
                  </View>
                )}
              </Animated.View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Animated.View
        style={[styles.chatContainer, {transform: [{translateX}]}]}
        {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.chatList,
            {
              transform: [{translateX: contentTranslateX}],
              opacity: contentOpacity,
            },
          ]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {chatData[activeTab]?.map(renderChatItem)}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1f2937',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  tabContainer: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabScrollContent: {
    paddingRight: 32,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginRight: 20,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#60a5fa',
  },
  tabText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#60a5fa',
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#4b5563',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  chatTime: {
    color: '#9ca3af',
    fontSize: 14,
    marginLeft: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    color: '#d1d5db',
    fontSize: 14,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default TelegramInterface;
