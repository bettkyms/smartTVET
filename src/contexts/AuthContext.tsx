import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'admin' | 'trainer';
  subscription: 'free' | 'pro' | 'institution';
  trainerNumber?: string;
  institutionName?: string;
  institutionLogo?: string;
  level?: string;
  createdAt: any;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
  logout: async () => {},
});

const GUEST_ID = 'public-guest-user';
const GUEST_PROFILE: UserProfile = {
  uid: GUEST_ID,
  displayName: 'TVET Trainer',
  email: 'guest@smart-tvet.app',
  photoURL: '',
  role: 'trainer',
  subscription: 'pro',
  createdAt: new Date()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(GUEST_PROFILE);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthReady(true);
        // Listen to user profile changes
        const unsubscribeProfile = onSnapshot(doc(db, 'users', firebaseUser.uid), (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as UserProfile);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user profile:", error);
          setLoading(false);
        });
        
        return () => unsubscribeProfile();
      } else {
        setUser({ uid: GUEST_ID, displayName: 'Guest User', email: 'guest@smart-tvet.app' } as any);
        setProfile(GUEST_PROFILE);
        setIsAuthReady(true);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const logout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
