
'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { createUserProfile, loadData } from '@/lib/firestore';
import { toast } from 'sonner';
import { getUserData, saveUserData, clearUserData } from '@/lib/local-storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  signInWithGoogle: () => void;
  forceReloadUser?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  signInWithGoogle: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const forceReloadUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        await currentUser.reload();
        setUser({ ...currentUser }); // Create a new object to trigger re-render
    }
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await createUserProfile(user);
        // Check if data is in local storage, if not, load from DB
        const localData = getUserData(user.uid);
        if (!localData) {
          const dbData = await loadData(user.uid);
          if (dbData) {
            saveUserData(user.uid, dbData);
          }
        }
        setUser(user);
        // Fire a custom event to notify other parts of the app
        window.dispatchEvent(new CustomEvent('user-data-loaded'));
      } else {
        setUser(null);
        // Clear local storage on logout
        if (auth.currentUser) {
           clearUserData(auth.currentUser.uid);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      if (user) {
        clearUserData(user.uid);
      }
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const googlePromise = signInWithPopup(auth, provider);
    toast.promise(googlePromise, {
        loading: 'Signing in with Google...',
        success: (userCredential) => {
            router.push('/');
            return 'Signed in successfully!';
        },
        error: 'Failed to sign in with Google.'
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, signInWithGoogle, forceReloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
