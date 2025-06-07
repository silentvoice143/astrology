import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';

import PublicRoutes from './public-route';
import PrivateRoutes from './private-route';

// Mock authentication check (replace with real auth logic)
const checkAuth = () => {
  // return true if logged in, false if not
  // e.g., check token in AsyncStorage or Context
  return true;
};

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const auth = checkAuth();
    setIsAuthenticated(auth);
  }, []);

  return (
    <NavigationContainer>
      {isAuthenticated ? <PrivateRoutes /> : <PublicRoutes />}
    </NavigationContainer>
  );
}
