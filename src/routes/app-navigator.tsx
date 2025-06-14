import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';

import PublicRoutes from './public-route';
import PrivateRoutes from './private-route';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {userDetail} from '../store/reducer/user';
import {logout} from '../store/reducer/auth';

export default function AppNavigator() {
  const {token} = useAppSelector((state: any) => state.auth);
  const isAuthenticated = !!token;
  const dispatch = useAppDispatch();

  const checkAuth = async () => {
    try {
      const {payload} = await dispatch(userDetail());
      if (!payload?.success) {
        dispatch(logout());
      }
    } catch (err) {
      console.log(err);
      dispatch(logout());
    }
  };

  useEffect(() => {
    if (!!token) {
      checkAuth();
    }
  }, [token]);

  return (
    <NavigationContainer>
      {true ? <PrivateRoutes /> : <PublicRoutes />}
    </NavigationContainer>
  );
}
