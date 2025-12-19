import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Keyboard,
  Image,
  ActivityIndicator,
} from 'react-native';
import RNModal from 'react-native-modal';

import {useAppDispatch, useAppSelector} from '../../../hooks/redux-hook';
import {
  addComment,
  getPostComments,
  deleteComment,
} from '../../../store/reducer/posts';

import TrashIcon from '../../../assets/icons/TrashIcon';

interface Props {
  visible: boolean;
  onClose: () => void;
  postId: string;
}

const PAGE_SIZE = 10;

const CommentsBottomSheet = ({visible, onClose, postId}: Props) => {
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(store => store.auth);
  const inputRef = useRef<TextInput>(null);
  const initialLoadDone = useRef(false);

  const [text, setText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [comments, setComments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  /* ---------------- KEYBOARD ---------------- */

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardHeight(10);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  /* ---------------- INITIAL LOAD ---------------- */

  useEffect(() => {
    if (!visible) return;

    setComments([]);
    setPage(1);
    setHasMore(true);
    initialLoadDone.current = false;

    fetchComments(1);
  }, [visible, postId]);

  /* ---------------- FETCH COMMENTS ---------------- */

  const fetchComments = async (pageNo: number) => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const payload = await dispatch(
        getPostComments({postId, page: pageNo, limit: PAGE_SIZE}),
      ).unwrap();

      const {comments: newComments, last} = payload.data;

      if (!newComments || newComments.length === 0) {
        setHasMore(false);
        initialLoadDone.current = true;
        return;
      }

      setComments(prev =>
        pageNo === 1 ? newComments : [...prev, ...newComments],
      );

      setHasMore(!last);
      setPage(pageNo + 1);

      if (pageNo === 1) initialLoadDone.current = true;
    } catch (e) {
      console.log('get comments error', e);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ADD COMMENT ---------------- */

  const handleComment = async () => {
    if (!text.trim() || sending) return;

    setSending(true);
    requestAnimationFrame(() => inputRef.current?.focus());

    try {
      const payload = await dispatch(
        addComment({postId, comment: text}),
      ).unwrap();

      setComments(prev => [payload.comment.comment, ...prev]);
      setText('');
    } catch (e) {
      console.log('add comment error', e);
    } finally {
      setSending(false);
    }
  };

  /* ---------------- DELETE COMMENT ---------------- */

  const confirmDelete = (commentId: string) => {
    setDeleteTargetId(commentId);
  };

  const handleDelete = async (commentId: string) => {
    if (deletingId) return;

    setDeletingId(commentId);
    try {
      const payload = await dispatch(
        deleteComment({commentId, postId}),
      ).unwrap();
      setComments(prev => prev.filter(c => c.id !== commentId));
      console.log(payload, 'delete api');
    } catch (e) {
      console.log('delete comment error', e);
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------------- RENDER COMMENT ---------------- */

  const renderItem = ({item}: any) => {
    const parsedBody =
      typeof item.body === 'string' ? JSON.parse(item.body) : item.body;

    // replace with real auth user check later
    const isMine = item.user?.id === user.id;
    console.log(item, 'item-------');

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
        }}>
        <Image
          source={
            item.user?.imgUri
              ? {uri: item.user.imgUri}
              : require('../../../assets/imgs/profile-demo.jpg')
          }
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            marginRight: 10,
          }}
        />

        <View style={{flex: 1}}>
          <Text style={{fontWeight: '600'}}>{item.user?.name || 'User'}</Text>
          <Text>{parsedBody?.comment}</Text>
        </View>

        {isMine && (
          <TouchableOpacity
            onPress={() => confirmDelete(item.id)}
            disabled={deletingId === item.id}
            style={{padding: 6}}>
            {deletingId === item.id ? (
              <ActivityIndicator size="small" />
            ) : (
              <TrashIcon />
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /* ---------------- RENDER ---------------- */

  return (
    <>
      {/* MAIN COMMENTS MODAL */}
      <RNModal
        isVisible={visible}
        onBackdropPress={onClose}
        onBackButtonPress={onClose}
        style={{margin: 0, justifyContent: 'flex-end'}}
        backdropOpacity={0.3}
        useNativeDriver>
        <View
          style={{
            maxHeight: '85%',
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingBottom: keyboardHeight,
          }}>
          {/* HEADER */}
          <View
            style={{
              paddingVertical: 14,
              alignItems: 'center',
              borderBottomWidth: 1,
              borderColor: '#eee',
            }}>
            <Text style={{fontWeight: '600'}}>Comments</Text>
          </View>

          {/* LIST */}
          <FlatList
            data={comments}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{padding: 16}}
            renderItem={renderItem}
            onEndReached={() => {
              if (!initialLoadDone.current || loading || !hasMore) return;
              fetchComments(page);
            }}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              loading ? <ActivityIndicator size="small" /> : null
            }
            ListEmptyComponent={
              !loading ? (
                <Text style={{textAlign: 'center', color: '#999'}}>
                  No comments yet
                </Text>
              ) : null
            }
          />

          {/* INPUT */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderTopWidth: 1,
              borderColor: '#eee',
            }}>
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={setText}
              placeholder="Add a comment..."
              style={{
                flex: 1,
                height: 40,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 20,
              }}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleComment}
              disabled={sending}
              style={{marginLeft: 10}}>
              {sending ? (
                <ActivityIndicator size="small" color="#3897f0" />
              ) : (
                <Text style={{fontWeight: '600', color: '#3897f0'}}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </RNModal>

      {/* DELETE CONFIRMATION MODAL */}
      <RNModal
        isVisible={!!deleteTargetId}
        onBackdropPress={() => setDeleteTargetId(null)}
        useNativeDriver>
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 20,
          }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 8,
              textAlign: 'center',
            }}>
            Delete comment?
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: '#666',
              textAlign: 'center',
              marginBottom: 20,
            }}>
            This action cannot be undone.
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: '#ff3b30',
              paddingVertical: 12,
              borderRadius: 8,
              marginBottom: 10,
            }}
            onPress={() => {
              if (!deleteTargetId) return;
              handleDelete(deleteTargetId);
              setDeleteTargetId(null);
            }}>
            <Text
              style={{
                color: '#fff',
                fontWeight: '600',
                textAlign: 'center',
              }}>
              Delete
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{paddingVertical: 12}}
            onPress={() => setDeleteTargetId(null)}>
            <Text
              style={{
                color: '#3897f0',
                fontWeight: '600',
                textAlign: 'center',
              }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </RNModal>
    </>
  );
};

export default CommentsBottomSheet;
