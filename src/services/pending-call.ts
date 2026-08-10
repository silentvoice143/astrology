export interface PendingCall {
  callId: string;
  roomId: string;
  sessionId?: string;

  callerId: string;
  callerName: string;
  callerImage?: string;

  sessionType: 'AUDIO' | 'VIDEO';
}

let pendingCall: PendingCall | null = null;

export const setPendingCall = (call: PendingCall) => {
  pendingCall = call;
};

export const getPendingCall = () => {
  return pendingCall;
};

export const clearPendingCall = () => {
  pendingCall = null;
};

let pendingWaitingCall: PendingCall | null = null;

export const setPendingWaitingCall = (call: PendingCall) => {
  pendingWaitingCall = call;
};

export const getPendingWaitingCall = () => {
  return pendingWaitingCall;
};

export const clearPendingaitingCall = () => {
  pendingWaitingCall = null;
};
