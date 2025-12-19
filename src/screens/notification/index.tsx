import React, {useEffect, useRef, useCallback, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ViewToken,
} from 'react-native';
import PageWithHeader from '../../componentsV1/layout/page-with-header';
import {useAppDispatch, useAppSelector} from '../../hooks/redux-hook';
import {
  getAllNotifications,
  markNotificationRead,
} from '../../store/reducer/notifications';
import {verticalScale} from '../../utils/sizer';
import {formatNotificationTime} from '../../utils/utils';

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
  const [page, setPage] = useState(1);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setPage(1);
      await dispatch(getAllNotifications({page: 1, limit: 10}));
    } finally {
      setRefreshing(false);
    }
  };

  /** 🔹 Initial load */
  useEffect(() => {
    dispatch(getAllNotifications({page: 1, limit: 10}));
  }, []);

  /** 🔹 Pagination */
  const loadMore = () => {
    if (!loading && !isLastPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      dispatch(getAllNotifications({page: nextPage, limit: 10}));
    }
  };

  /** 🔹 Mark visible unread notifications as read */
  const onViewableItemsChanged = useRef(
    async ({viewableItems}: {viewableItems: ViewToken[]}) => {
      const unreadIds = viewableItems
        .filter(v => v.item?.read === false)
        .map(v => v.item.id);

      if (!unreadIds.length) return;

      await Promise.all(
        unreadIds.map(id => dispatch(markNotificationRead(id)).unwrap()),
      );
    },
  ).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 60,
  };

  const renderItem = useCallback(({item}: any) => {
    return (
      <TouchableOpacity
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

  console.log(notifications, '-----notifications');

  return (
    <PageWithHeader
      title="Notifications"
      themeMode="light"
      scrollEnabled={false}>
      <View style={styles.container}>
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          showsVerticalScrollIndicator={false}
          /* ✅ Pull to refresh */
          refreshing={refreshing}
          onRefresh={onRefresh}
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
});
