import { createContext, useContext } from 'react';

export const AuthContext = createContext({ logout: () => {} });
export const useAuth = () => useContext(AuthContext);