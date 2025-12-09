import {View, Text, Pressable} from 'react-native';
import React from 'react';
import PageWithHeader from '../../componentsV1/layout/page-with-header';
import {COLORS} from '../../constants/colors';
import ChatIcon from '../../assets/icons/chat-icon';
import CallIcon from '../../assets/icons/call-icon';
import {scale} from '../../utils/sizer';
import {set} from 'date-fns';
import ChatScreen from './chatScreen';
import CallScreen from './callScreen';

const CallChat = () => {
  const [activeTab, setActiveTab] = React.useState<'call' | 'chat'>('chat');
  return (
    <PageWithHeader title="History" scrollEnabled={false}>
      <View
        style={{
          flex: 1,

          backgroundColor: COLORS.theme.white,
        }}>
        {activeTab === 'chat' ? <ChatScreen /> : <CallScreen />}
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingVertical: scale(8),
          backgroundColor: COLORS.theme.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.theme.gray.light,
        }}>
        <Pressable
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
          onPress={() => {
            setActiveTab('chat');
          }}>
          <View
            style={{
              paddingHorizontal: scale(16),
              paddingVertical: scale(4),
              borderRadius: 25,
              overflow: 'hidden',
              backgroundColor:
                activeTab === 'chat'
                  ? COLORS.theme.primaryLight + 40
                  : 'transparent',
            }}>
            <ChatIcon size={16} color={COLORS.theme.black} />
          </View>
          <Text style={{color: COLORS.theme.black}}>Chat</Text>
        </Pressable>
        <Pressable
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
          onPress={() => {
            setActiveTab('call');
          }}>
          <View
            style={{
              paddingHorizontal: scale(16),
              paddingVertical: scale(4),
              borderRadius: 25,
              overflow: 'hidden',
              backgroundColor:
                activeTab === 'call'
                  ? COLORS.theme.primaryLight + 40
                  : 'transparent',
            }}>
            <CallIcon size={14} color={COLORS.theme.black} />
          </View>
          <Text style={{color: COLORS.theme.black}}>Call</Text>
        </Pressable>
      </View>
    </PageWithHeader>
  );
};

export default CallChat;
