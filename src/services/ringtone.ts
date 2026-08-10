// src/services/ringtone.ts

import Sound from 'react-native-sound';

Sound.setCategory('Playback');

let ringtone: Sound | null = null;

export const startRingtone = () => {
  if (ringtone?.isPlaying()) {
    return;
  }

  ringtone = new Sound('zego_incoming.mp3', Sound.MAIN_BUNDLE, error => {
    if (error) {
      console.log('Failed to load ringtone', error);
      return;
    }

    ringtone?.setNumberOfLoops(-1); // Infinite loop
    ringtone?.play();
  });
};

export const stopRingtone = () => {
  ringtone?.stop(() => {
    ringtone?.release();
    ringtone = null;
  });
};

Sound.setCategory('Playback');

let outgoing_ringtone: Sound | null = null;

export const startOutgoingRingtone = () => {
  if (ringtone?.isPlaying()) {
    return;
  }

  ringtone = new Sound('zego_outgoing.mp3', Sound.MAIN_BUNDLE, error => {
    if (error) {
      console.log('Failed to load ringtone', error);
      return;
    }

    ringtone?.setNumberOfLoops(-1); // Infinite loop
    ringtone?.play();
  });
};

export const stopOutgoingRingtone = () => {
  ringtone?.stop(() => {
    ringtone?.release();
    ringtone = null;
  });
};
