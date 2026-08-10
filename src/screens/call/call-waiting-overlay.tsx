import React, {useEffect} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {startRingtone, stopRingtone} from '../../services/ringtone';

interface Props {
  visible?: boolean;
  callerName?: string;
  sessionType?: 'AUDIO' | 'VIDEO';
  onAccept?(): void;
  onReject?(): void;
  playSound?: boolean;
}

export default function CallWaitingOverlay({
  visible = true,
  callerName = 'John Doe',
  sessionType = 'VIDEO',
  onAccept,
  onReject,
  playSound,
}: Props) {
  useEffect(() => {
    if (visible && playSound) {
      startRingtone();
    } else {
      stopRingtone();
    }

    return () => {
      stopRingtone();
    };
  }, [visible]);
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.callType}>
          Incoming {sessionType === 'VIDEO' ? 'Video' : 'Audio'} Call
        </Text>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {callerName.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>{callerName}</Text>

        <Text style={styles.status}>Calling...</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.reject]}
            onPress={onReject}>
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.accept]}
            onPress={onAccept}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,

    zIndex: 9999999,
    elevation: 9999,

    backgroundColor: 'rgba(17,24,39,0.92)',

    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  callType: {
    color: '#D1D5DB',
    fontSize: 18,
    marginBottom: 40,
  },

  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#2563EB',

    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#fff',
    fontSize: 52,
    fontWeight: '700',
  },

  name: {
    marginTop: 24,
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
  },

  status: {
    marginTop: 8,
    color: '#D1D5DB',
    fontSize: 18,
  },

  actions: {
    flexDirection: 'row',
    marginTop: 80,
    width: '100%',
    justifyContent: 'space-evenly',
  },

  button: {
    width: 130,
    height: 56,

    borderRadius: 28,

    justifyContent: 'center',
    alignItems: 'center',
  },

  reject: {
    backgroundColor: '#EF4444',
  },

  accept: {
    backgroundColor: '#22C55E',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
