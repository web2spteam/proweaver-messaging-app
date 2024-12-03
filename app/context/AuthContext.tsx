"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase/config";
import { getData } from "../hooks/useAxios";

interface AuthContextProps {
  user: User | null;
  userType: number | null;
  loading: boolean;
}

interface IUserType {
  user_type: number | null;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  userType: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const response: IUserType = await getData(
            `account/getUserType/${user.uid}`,
          );
          setUserType(response.user_type);
        } catch (error) {
          console.error("Failed to fetch user type:", error);
        }
      } else {
        setUserType(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userType, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
