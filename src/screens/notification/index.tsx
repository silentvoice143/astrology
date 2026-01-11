import React, {useEffect, useRef, useCallback, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ViewToken,
  ActivityIndicator,
} from 'react-native';
import PageWithHeader from '../../componentsV1/layout/page-with-header';
import {useAppDispatch, useAppSelector} from '../../hooks/redux-hook';
import {
  getAllNotifications,
  markNotificationRead,
} from '../../store/reducer/notifications';
import {verticalScale} from '../../utils/sizer';
import {formatNotificationTime, formatRelativeDate} from '../../utils/utils';
import {handleNotificationNavigation} from '../../utils/notification-handler';
import {setOtherUser, setSession} from '../../store/reducer/session';

const getTypeColor = (type: string) => {
  switch (type) {
    case 'POST_CREATED':
      return '#2563EB';
    case 'BOOKING_APPROVED':
      return '#9C27B0';
    case 'SESSION_CREATED':
      return '#059669';
    default:
      return '#607D8B';
  }
};

const Notification = () => {
  const dispatch = useAppDispatch();

  const {notifications, currentPage, isLastPage, loading} = useAppSelector(
    state => state.notifications,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Track if we're currently fetching to prevent duplicate requests
  const isFetchingRef = useRef(false);

  const onRefresh = async () => {
    if (isFetchingRef.current) return;

    try {
      setRefreshing(true);
      isFetchingRef.current = true;
      await dispatch(getAllNotifications({page: 1, limit: 10})).unwrap();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  };

  /** 🔹 Initial load */
  useEffect(() => {
    if (!isFetchingRef.current) {
      isFetchingRef.current = true;
      dispatch(getAllNotifications({page: 1, limit: 10})).finally(() => {
        isFetchingRef.current = false;
      });
    }
  }, []);

  /** 🔹 Pagination - Fixed to use currentPage from Redux */
  const loadMore = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (isFetchingRef.current || loading || isLastPage || refreshing) {
      return;
    }

    try {
      setLoadingMore(true);
      isFetchingRef.current = true;
      const nextPage = currentPage + 1;
      await dispatch(getAllNotifications({page: nextPage, limit: 10})).unwrap();
    } catch (error) {
      console.error('Load more error:', error);
    } finally {
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [dispatch, loading, isLastPage, currentPage, refreshing]);

  /** 🔹 Mark visible unread notifications as read */
  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: ViewToken[]}) => {
      const unreadIds = viewableItems
        .filter(v => v.item?.read === false)
        .map(v => v.item.id);

      if (!unreadIds.length) return;

      // Fire and forget - don't wait for these to complete
      unreadIds.forEach(id => {
        dispatch(markNotificationRead(id));
      });
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 500, // Wait 500ms before marking as viewed
  }).current;

  const renderItem = useCallback(({item}: any) => {
    console.log('Rendering notification item:', item);
    return (
      <TouchableOpacity
        onPress={() => {
          if (item.type === 'CHAT_MESSAGE') {
            if (!item?.metadata?.session) return;
            dispatch(setOtherUser(item?.metadata?.session?.astrologer));
            dispatch(setSession(item?.metadata?.session));
          }
          handleNotificationNavigation(item);
        }}
        activeOpacity={0.7}
        style={[
          styles.notificationItem,
          !item.read && styles.unreadNotification,
        ]}>
        {/* CENTER */}
        <View style={styles.centerContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body} numberOfLines={2}>
            {item.message}
          </Text>
          {/* TYPE BADGE */}
          <View style={{flexDirection: 'row', marginTop: verticalScale(8)}}>
            <View
              style={[
                styles.typeBadge,
                {backgroundColor: getTypeColor(item.type)},
              ]}>
              <Text style={styles.typeText}>{item.type}</Text>
            </View>
            <View style={{flex: 1}}></View>
          </View>
        </View>

        {/* RIGHT */}
        <View style={styles.rightContainer}>
          <Text style={styles.time}>
            {formatNotificationTime(item.createdAt) ?? 'Just now'}
          </Text>

          {!item.read && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    );
  }, []);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2563EB" />
      </View>
    );
  }, [loadingMore]);

  const renderEmpty = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No notifications yet</Text>
      </View>
    );
  }, [loading]);

  return (
    <PageWithHeader
      title="Notifications"
      themeMode="light"
      scrollEnabled={false}>
      <View style={styles.container}>
        <FlatList
          data={notifications}
          keyExtractor={(item, idx) => `${item.id}-${idx}`}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3} // Trigger slightly earlier
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
        />
      </View>
    </PageWithHeader>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  unreadNotification: {
    backgroundColor: '#F4FAFF',
  },

  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },

  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  centerContainer: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },

  body: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },

  rightContainer: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },

  time: {
    fontSize: 11,
    color: '#888',
  },

  unreadDot: {
    marginTop: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#25D366',
  },

  highPriority: {
    marginTop: 4,
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 14,
  },

  divider: {
    height: 0.5,
    backgroundColor: '#e5e5e5',
    marginLeft: 70,
  },

  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});
