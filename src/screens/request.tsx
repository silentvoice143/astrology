import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import ScreenLayout from '../components/screen-layout';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {
  acceptCallRequest,
  clearSession,
  deleteSessionRequest,
  getQueueRequest,
  setChatUser,
  setOtherUser,
  setQueueCount,
  setSession,
  skipSessionRequest,
} from '../store/reducer/session';
import CustomButton from '../components/custom-button';
import {acceptSessionRequest} from '../store/reducer/session';
import {UserDetail, UserPersonalDetail} from '../utils/types';
import {scale, verticalScale} from '../utils/sizer';
import {useNavigation} from '@react-navigation/native';
import {textStyle} from '../constants/text-style';
import Toast from 'react-native-toast-message';
import AboutIcon from '../assets/icons/about-icon';
import {themeColors} from '../constants/colors';
import CheckIcon from '../assets/icons/checkIcon';

type RequestType = {
  userId: string;
  sessionType: 'AUDIO' | 'VIDEO' | 'CHAT';
  requestedMinutes: number;
  queuePosition: number;
};

// Call type icons (you can replace with your custom icons)
const CallTypeIcon = ({type}: {type: 'AUDIO' | 'VIDEO' | 'CHAT'}) => {
  console.log(type, '-------------session type');
  const iconStyle = {
    fontSize: 16,
    color: themeColors.text.primary,
  };

  switch (type) {
    case 'AUDIO':
      return <Text style={iconStyle}>🎙️</Text>;
    case 'VIDEO':
      return <Text style={iconStyle}>📹</Text>;
    case 'CHAT':
      return <Text style={iconStyle}>💬</Text>;
    default:
      return <Text style={iconStyle}>💬</Text>;
  }
};

const UserRequestCard = ({
  data,
  onAccept,
  onSkip,
  showActions,
  isAnimating,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleAcceptPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onAccept();
  };

  const handleSkipPress = () => {
    Animated.timing(slideAnim, {
      toValue: -1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onSkip();
    });
  };

  return (
    <Animated.View
      style={{
        transform: [
          {
            translateX: slideAnim.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [-400, -50, 0],
            }),
          },
          {scale: scaleAnim},
        ],
        opacity: slideAnim.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [0, 0.8, 1],
        }),
      }}>
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: scale(16),
          marginBottom: verticalScale(16),
          padding: scale(20),
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          borderWidth: showActions ? 2 : 1,
          borderColor: showActions ? themeColors.border.secondary : '#E5E7EB',
        }}>
        {/* Header with Avatar and Basic Info */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: verticalScale(16),
          }}>
          {/* Avatar */}
          <View
            style={{
              width: scale(60),
              height: scale(60),
              borderRadius: scale(30),
              backgroundColor: themeColors.surface.secondarySurface + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: scale(16),
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: themeColors.border.primary,
            }}>
            {data?.avatar ? (
              <Image
                source={{uri: data.avatar}}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: scale(30),
                }}
              />
            ) : (
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: themeColors.text.primary,
                }}>
                {data?.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            )}
          </View>

          {/* User Info */}
          <View style={{flex: 1}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: verticalScale(4),
              }}>
              <Text
                style={[
                  textStyle.fs_mont_16_600,
                  {color: '#1F2937', maxWidth: '70%'},
                ]}
                numberOfLines={1}>
                {data?.name || 'Anonymous'}
              </Text>

              {/* Call Type Badge */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: themeColors.surface.highlight + '15',
                  paddingHorizontal: scale(8),
                  paddingVertical: verticalScale(4),
                  borderRadius: scale(12),
                  gap: scale(4),
                }}>
                <CallTypeIcon type={data?.sessionType || 'CHAT'} />
                <Text
                  style={[
                    textStyle.fs_mont_12_500,
                    {color: themeColors.text.primary},
                  ]}>
                  {data?.sessionType || 'CHAT'}
                </Text>
              </View>
            </View>

            {/* Age and Location */}
            <Text style={[textStyle.fs_mont_14_400, {color: '#6B7280'}]}>
              {data?.age ? `${data.age} years` : ''}
              {data?.location && data?.age ? ' • ' : ''}
              {data?.location || ''}
            </Text>

            {/* Online Status */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: verticalScale(4),
              }}>
              <View
                style={{
                  width: scale(8),
                  height: scale(8),
                  borderRadius: scale(4),
                  backgroundColor: '#10B981',
                  marginRight: scale(6),
                }}
              />
              <Text style={[textStyle.fs_mont_12_400, {color: '#10B981'}]}>
                Online now
              </Text>
            </View>
          </View>
        </View>

        {/* Interest Tags (if available) */}
        {data?.interests && data.interests.length > 0 && (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginBottom: verticalScale(16),
              gap: scale(8),
            }}></View>
        )}

        {/* Action Buttons - Only for first card */}
        {showActions && (
          <View
            style={{
              flexDirection: 'row',
              gap: scale(12),
            }}>
            <TouchableOpacity
              onPress={handleSkipPress}
              style={{
                flex: 1,
                backgroundColor: themeColors.button.danger,
                paddingVertical: verticalScale(12),
                borderRadius: scale(12),
                alignItems: 'center',
              }}
              disabled={isAnimating}>
              <Text
                style={[
                  textStyle.fs_mont_14_600,
                  {color: themeColors.text.light},
                ]}>
                Skip
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAcceptPress}
              style={{
                flex: 1,
                backgroundColor: themeColors.button.success,
                paddingVertical: verticalScale(12),
                borderRadius: scale(12),
                alignItems: 'center',
              }}
              disabled={isAnimating}>
              <Text style={[textStyle.fs_mont_14_600, {color: '#fff'}]}>
                Accept
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Queue Position Indicator */}
        {!showActions && (
          <View
            style={{
              position: 'absolute',
              top: scale(12),
              right: scale(12),
              backgroundColor: '#6B7280',
              width: scale(24),
              height: scale(24),
              borderRadius: scale(12),
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={[textStyle.fs_mont_12_600, {color: '#fff'}]}>
              {data?.queuePosition || ''}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const RequestScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const [request, setRequest] = useState<RequestType[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const quequeRequestCount = useAppSelector(
    state => state.session.queueRequestCount,
  );
  const astrologer_detail = useAppSelector(state => state.auth.user);
  const {activeSession} = useAppSelector(state => state.session);

  const getAllRequests = async () => {
    try {
      setRefreshing(true);
      const payload = await dispatch(getQueueRequest()).unwrap();
      console.log(payload, '-----all session requests');
      if (payload.success) {
        // Add queue positions and mock call types for demo
        const usersWithExtras = payload?.users.map(
          (user: any, index: number) => ({
            ...user,
            queuePosition: index + 1,
          }),
        );
        setRequest(usersWithExtras);
        dispatch(setQueueCount(usersWithExtras.length));
      } else {
        Toast.show({
          type: 'info',
          text1: 'Something went wrong! try again',
        });
      }
    } catch (err) {
      console.log(err);
      Toast.show({
        type: 'error',
        text1: 'Failed to load requests',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleAcceptCall = async (user: RequestType) => {
    try {
      const response = await dispatch(acceptCallRequest(user.userId)).unwrap();

      console.log(response, 'response of astrologer');

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Call Accepted',
          text2: 'Connecting to the call...',
        });

        navigation.navigate('call', {
          callType: user.sessionType || 'VOICE',
          astrologer: {
            id: astrologer_detail?.id,
            name: astrologer_detail?.name,
            imageUri: astrologer_detail?.imgUri,
          },
          user: {
            id: user.userId,
            name: 'User',
            imageUri: '',
          },
          duration: 30, // Will be updated from session details via socket
          sessionId: undefined, // Will be set when session details arrive via socket
          isAstrologer: true, // This is the key - astrologer starts in 'connecting' state
        });
      } else {
        throw new Error('Failed to accept call');
      }
    } catch (error) {
      console.error('Accept call error:', error);
      Toast.show({
        type: 'error',
        text1: 'Accept Failed',
        text2: 'Unable to accept the call. Please try again.',
      });
    } finally {
      setIsAnimating(false);
      getAllRequests();
    }
  };

  const handleAcceptChat = async (user: RequestType) => {
    if (isAnimating) return;

    setIsAnimating(true);
    try {
      const payload = await dispatch(
        acceptSessionRequest(user.userId),
      ).unwrap();

      if (payload.success) {
        // dispatch(setOtherUser(user));
        if (user.sessionType === 'CHAT') {
          navigation.navigate('chat', {
            sessionType: 'CHAT',
            astrologer: {
              id: astrologer_detail?.id,
              name: astrologer_detail?.name,
              imageUri: astrologer_detail?.imgUri,
            },
            user: {
              id: user.userId,
              name: 'User',
              imageUri: '',
            },
            duration: 30,
            sessionId: undefined,
            isAstrologer: true,
          });
        } else {
          return;
        }
      }
    } catch (err) {
      console.log(err);
      Toast.show({
        type: 'error',
        text1: 'Failed to accept request',
      });
    } finally {
      setIsAnimating(false);
      getAllRequests();
    }
  };

  const handleDelete = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    try {
      const payload = await dispatch(deleteSessionRequest()).unwrap();

      if (payload.success) {
        getAllRequests();
      }
    } catch (err) {
      console.log(err);
      Toast.show({
        type: 'error',
        text1: 'Failed to accept request',
      });
    } finally {
      setIsAnimating(false);
    }
  };

  const handleSkip = async (user: RequestType) => {
    if (isAnimating) return;

    setIsAnimating(true);
    try {
      const payload = await dispatch(skipSessionRequest(user.userId)).unwrap();
      console.log(payload, '----skip res');
      if (payload.success) {
        dispatch(clearSession());
        // Remove the skipped user and update queue positions
        const updatedRequests = request
          .filter(req => req.userId !== user.userId)
          .map((req, index) => ({...req, queuePosition: index + 1}));
        setRequest(updatedRequests);
      }
    } catch (err) {
      console.log(err);
      Toast.show({
        type: 'error',
        text1: 'Failed to skip request',
      });
    } finally {
      setIsAnimating(false);
    }
  };

  useEffect(() => {
    getAllRequests();
  }, [quequeRequestCount]);

  return (
    <ScreenLayout>
      <View style={{flex: 1}}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: scale(20),
            paddingVertical: verticalScale(16),
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
            backgroundColor: '#fff',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
          }}>
          <Text style={[textStyle.fs_mont_16_700]}>All requests</Text>
          <CustomButton
            style={{
              width: 100,
              backgroundColor: themeColors.button.danger,
            }}
            title="Delete"
            onPress={() => handleDelete()}
          />
        </View>

        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{
            paddingHorizontal: scale(20),
            paddingVertical: verticalScale(16),
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}>
          {request.length > 0 ? (
            <>
              {request.map((user, index) => (
                <UserRequestCard
                  key={`${index}-${user?.userId}`}
                  data={user}
                  onAccept={() =>
                    user.sessionType === 'CHAT'
                      ? handleAcceptChat(user)
                      : handleAcceptCall(user)
                  }
                  onSkip={() => handleSkip(user)}
                  showActions={index === 0}
                  isAnimating={isAnimating}
                />
              ))}
            </>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: verticalScale(16),
                  padding: scale(40),
                }}>
                <AboutIcon color={themeColors.status.info.dark} />
                <Text style={[textStyle.fs_mont_16_500, {color: '#4B5563'}]}>
                  No Requests Yet
                </Text>
                <Text
                  style={[
                    textStyle.fs_mont_14_400,
                    {color: '#6B7280', textAlign: 'center'},
                  ]}>
                  When someone wants to connect with you,{'\n'}you'll see their
                  request here
                </Text>

                <TouchableOpacity
                  onPress={getAllRequests}
                  style={{
                    backgroundColor: themeColors.button.secondary,
                    paddingHorizontal: scale(24),
                    paddingVertical: verticalScale(12),
                    borderRadius: scale(12),
                    marginTop: verticalScale(8),
                  }}>
                  <Text style={[textStyle.fs_mont_14_600, {color: '#fff'}]}>
                    Refresh
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenLayout>
  );
};

export default RequestScreen;
