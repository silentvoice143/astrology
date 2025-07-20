import {useState, useEffect, useRef} from 'react';
import { useAppSelector } from '../../hooks/redux-hook';
import { useWebSocket } from '../../hooks/use-socket';
import { useUserRole } from '../../hooks/use-role';
import { decodeMessageBody } from '../../utils/utils';

interface CallRequest {
  sessionId: string;
  userId: string;
  userName: string;
  userImage?: string;
  callType: 'voice' | 'video';
  duration: number;
  timestamp: string;
  pricePerMinute: number;
}

export const useCallRequests = () => {
  const [currentCallRequest, setCurrentCallRequest] = useState<CallRequest | null>(null);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [callRequestHistory, setCallRequestHistory] = useState<CallRequest[]>([]);
  
  const {user} = useAppSelector(state => state.auth);
  console.log(user,"user");
  
  const {subscribe} = useWebSocket(user?.id || '');
  const role = useUserRole();
  
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log(role,"role");
  

  useEffect(() => {
    // Only astrologers should listen for call requests
    if (role !== 'ASTROLOGER' || !user?.id) {
      return;
    }

    console.log('[useCallRequests] Setting up call request listener for astrologer:', user.id);

    // Listen for incoming call requests
    const callRequestSub = subscribe(`/topic/queue/${user.id}`, (msg) => {
      try {
        const requestData = JSON.parse(decodeMessageBody(msg));
        console.log('[useCallRequests] Call request received:', requestData);
        
        // Check if this is a call request (not chat request)
        if (requestData.type === 'voice' || requestData.type === 'video') {
          const callRequest: CallRequest = {
            sessionId: requestData.sessionId,
            userId: requestData.userId,
            userName: requestData.userName,
            userImage: requestData.userImage,
            callType: requestData.type,
            duration: requestData.duration,
            timestamp: new Date().toISOString(),
            pricePerMinute: requestData.pricePerMinute,
          };

          // Show notification
          showCallRequest(callRequest);
          
          // Add to history
          setCallRequestHistory(prev => [callRequest, ...prev.slice(0, 9)]); // Keep last 10
        }
      } catch (err) {
        console.error('[useCallRequests] Failed to parse call request:', err);
      }
    });

    return () => {
      console.log('[useCallRequests] Cleaning up call request listener');
      callRequestSub?.unsubscribe();
      
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [user?.id, role, subscribe]);

  const showCallRequest = (callRequest: CallRequest) => {
    // If there's already a notification showing, dismiss it first
    if (isNotificationVisible) {
      dismissCallRequest();
    }

    // Clear any existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    // Show new notification
    setCurrentCallRequest(callRequest);
    setIsNotificationVisible(true);

    // Auto-dismiss after 30 seconds if not responded
    notificationTimeoutRef.current = setTimeout(() => {
      dismissCallRequest();
    }, 30000);
  };

  const dismissCallRequest = () => {
    setIsNotificationVisible(false);
    setCurrentCallRequest(null);
    
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
      notificationTimeoutRef.current = null;
    }
  };

  const acceptCallRequest = () => {
    console.log('[useCallRequests] Call request accepted:', currentCallRequest?.sessionId);
    dismissCallRequest();
  };

  const rejectCallRequest = () => {
    console.log('[useCallRequests] Call request rejected:', currentCallRequest?.sessionId);
    dismissCallRequest();
  };

  // Get pending call requests count
  const getPendingRequestsCount = () => {
    return isNotificationVisible ? 1 : 0;
  };

  // Get recent call requests
  const getRecentCallRequests = () => {
    return callRequestHistory.slice(0, 5); // Last 5 requests
  };

  return {
    // Current state
    currentCallRequest,
    isNotificationVisible,
    
    // Actions
    dismissCallRequest,
    acceptCallRequest,
    rejectCallRequest,
    
    // Utility functions
    getPendingRequestsCount,
    getRecentCallRequests,
    
    // History
    callRequestHistory,
  };
};