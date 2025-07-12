import {useAppSelector} from './redux-hook'; // assuming you have this hook
// OR use `useSelector` directly if not using a typed wrapper

export const useUserRole = () => {
  const role = useAppSelector(state => state.auth.user.role);
  return role;
};
