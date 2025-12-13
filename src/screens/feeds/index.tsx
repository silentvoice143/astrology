import React, {useCallback, useEffect, useState, useRef} from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Text,
} from 'react-native';
import PageWithHeader from '../../componentsV1/layout/page-with-header';
import FeedPost from './components/feed-post';
import {COLORS} from '../../constants/colors';
import {useAppDispatch} from '../../hooks/redux-hook';
import {getPosts} from '../../store/reducer/posts';

const LIMIT = 10;

const Feeds = () => {
  const dispatch = useAppDispatch();

  const [posts, setPosts] = useState([]); // array of post objects from API
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false); // loading for initial / more
  const [refreshing, setRefreshing] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);

  // prevent multiple onEndReached triggers
  const onEndReachedCalledDuringMomentum = useRef(true);

  const fetchPosts = useCallback(
    async (pageToLoad = 1, replace = false) => {
      // don't run if already loading
      if (loading && !replace) return;

      if (pageToLoad === 1) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const {payload} = await dispatch(
          // your thunk expects {page, limit}
          getPosts({page: pageToLoad, limit: LIMIT}),
        );

        if (payload?.success) {
          const fetchedPosts = payload.posts ?? [];

          // map posts to the shape expected by FeedPost
          // FeedPost expects: astrologerName, postImages, caption (we'll populate these)
          const mapped = fetchedPosts.map(p => {
            const astrologerName = p?.astrologer?.user?.name ?? 'Astrologer';
            const astrologerExpertise = p?.astrologer?.expertise;
            const postImages =
              Array.isArray(p.images) && p.images.length > 0
                ? p.images.map(img => img.imagUrl) // remote urls from API
                : [];
            const caption = p.text ?? '';

            return {
              id: p.id,
              astrologerName,
              astrologerExpertise,
              postImages,
              caption,
              raw: p, // keep original if you need it later
            };
          });

          if (replace) {
            setPosts(mapped);
          } else {
            // append for next pages, but avoid duplicates (by id)
            setPosts(prev => {
              const existingIds = new Set(prev.map(x => x.id));
              const newItems = mapped.filter(x => !existingIds.has(x.id));
              return pageToLoad === 1 ? mapped : [...prev, ...newItems];
            });
          }

          // update last page flag based on API
          setIsLastPage(!!payload.isLastPage);
          setPage(payload.currentPage ?? pageToLoad);
        } else {
          // API returned success: false
          console.warn('getPosts returned success:false', payload);
        }
      } catch (err) {
        console.error('fetchPosts error', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
        // allow onEndReached again after momentum ends
        onEndReachedCalledDuringMomentum.current = true;
      }
    },
    [dispatch, loading],
  );

  useEffect(() => {
    // initial load
    fetchPosts(1, true);
  }, [fetchPosts]);

  const handleRefresh = async () => {
    setIsLastPage(false);
    await fetchPosts(1, true);
  };

  const handleLoadMore = () => {
    if (loading || refreshing || isLastPage) return;

    // avoid multiple triggers during momentum
    if (!onEndReachedCalledDuringMomentum.current) return;

    const nextPage = page + 1;
    fetchPosts(nextPage, false);
    onEndReachedCalledDuringMomentum.current = false;
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={{padding: 12, alignItems: 'center'}}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading || refreshing) return null;
    return (
      <View style={{padding: 20, alignItems: 'center'}}>
        <Text>No posts available.</Text>
      </View>
    );
  };

  return (
    <PageWithHeader themeMode="light" title="Astrosevaa" scrollEnabled={false}>
      <View style={{flex: 1, backgroundColor: COLORS.theme.white}}>
        <FlatList
          data={posts}
          keyExtractor={(item: any) => item?.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 60}}
          renderItem={({item}: any) => (
            <FeedPost
              astrologerName={item.astrologerName}
              postImages={item.postImages}
              caption={item.caption}
              astrologerExpertise={item.astrologerExpertise}
            />
          )}
          onEndReachedThreshold={0.5}
          onEndReached={handleLoadMore}
          onMomentumScrollBegin={() => {
            // allow onEndReached to be called once during momentum
            onEndReachedCalledDuringMomentum.current = true;
          }}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      </View>
    </PageWithHeader>
  );
};

export default Feeds;
