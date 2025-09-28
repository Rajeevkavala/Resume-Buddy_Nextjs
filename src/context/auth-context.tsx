
'use client';

import { createContext, useState, useEffect, useContext, ReactNode, startTransition } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { createUserProfile, loadData } from '@/lib/firestore';
import { toast } from 'sonner';
import { getUserData, saveUserData, clearUserData } from '@/lib/local-storage';
import { initializeSecureStorage, secureSessionStorage } from '@/lib/secure-storage';
import { fastAuthCheck, setFastAuthCookie, clearFastAuthCookie } from '@/lib/fast-auth';
import { uploadProfilePhotoFromURL } from '@/lib/supabase';

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
  const [loading, setLoading] = useState(true); // Start as true to prevent premature redirects
  const [initialLoad, setInitialLoad] = useState(true);
  const router = useRouter();

  // Remove aggressive timeout that might cause loops

  const forceReloadUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        await currentUser.reload();
        setUser({ ...currentUser }); // Create a new object to trigger re-render
    }
  };


  useEffect(() => {
    // Initialize secure storage on component mount
    initializeSecureStorage();
    
    // Fast auth check for immediate UI state
    const { isLikelyAuthenticated } = fastAuthCheck();
    
    // Check for existing user immediately on mount
    const currentUser = auth.currentUser;
    if (currentUser && initialLoad) {
      // Set authentication cookie immediately for existing user
      setFastAuthCookie(currentUser.uid);
      setUser(currentUser);
      setLoading(false);
      setInitialLoad(false);
      return;
    }

    // If fast auth check suggests user is authenticated, give Firebase more time
    const timeoutDuration = isLikelyAuthenticated ? 1000 : 200;
    
    const timeoutId = setTimeout(() => {
      if (initialLoad && !auth.currentUser) {
        startTransition(() => {
          setLoading(false);
          setInitialLoad(false);
        });
      }
    }, timeoutDuration);

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (newUser) => {
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      // Set or clear authentication cookie for middleware
      if (newUser) {
        // Set authentication cookie using fast auth helper
        setFastAuthCookie(newUser.uid);
      } else {
        // Clear authentication cookie using fast auth helper
        clearFastAuthCookie();
      }
      
      // Use startTransition to avoid blocking UI updates
      startTransition(() => {
        // If the user ID has changed, clear the old user's data
        if (user && newUser?.uid !== user.uid) {
          clearUserData(user.uid);
        }
        
        setUser(newUser);
        setLoading(false);
        setInitialLoad(false);
      });

      if (newUser) {
        // Handle async operations without blocking UI, but with a small delay to ensure context is ready
        Promise.resolve().then(async () => {
          try {
            await createUserProfile(newUser);
            // Check if data is in local storage first, then fallback to server
            const localData = getUserData(newUser.uid);
            if (!localData || Object.keys(localData).length === 0) {
              // No local data, fetch from server
              const dbData = await loadData(newUser.uid);
              if (dbData && Object.keys(dbData).length > 0) {
                saveUserData(newUser.uid, dbData);
              }
            }
            // Fire a custom event to notify other parts of the app that user data is ready
            // Add a small delay to ensure all contexts are ready to handle the event
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('user-data-loaded', { detail: { userId: newUser.uid } }));
            }, 100);
          } catch (error) {
            console.error('Error loading user profile:', error);
          }
        });
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []); // Remove initialLoad dependency to prevent infinite loop

  const logout = async () => {
    try {
      if (user) {
        clearUserData(user.uid);
      }
      
      // Clear authentication cookie
      clearFastAuthCookie();
      
      await auth.signOut();
      setUser(null); // Explicitly set user to null
      
      // Clear only session data, not auth persistence data
      secureSessionStorage.clear();
      
      // Fire event to tell contexts to clear their state
      window.dispatchEvent(new CustomEvent('user-logged-out'));
      
      // Trigger loading animation for navigation
      window.dispatchEvent(new CustomEvent('routeChangeStart'));
      startTransition(() => {
        router.push('/login');
      });
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('routeChangeComplete'));
      }, 100);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  // Function to sync Google profile photo to Supabase
  const syncGoogleProfilePhoto = async (user: User) => {
    if (user.photoURL && user.providerData.some(provider => provider.providerId === 'google.com')) {
      try {
        // Only sync if the photo URL is from Google (starts with https://lh3.googleusercontent.com)
        if (user.photoURL.includes('googleusercontent.com')) {
          const supabasePhotoUrl = await uploadProfilePhotoFromURL(user.uid, user.photoURL);
          
          // You could store this URL in the user's profile or update Firebase Auth
          // For now, we'll let the profile page handle the display logic
        }
      } catch (error) {
        // Non-blocking error - user can still continue
      }
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    
    // Add additional scopes for better user profile data
    provider.addScope('profile');
    provider.addScope('email');
    
    // Set custom parameters for better UX
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      const result = await signInWithPopup(auth, provider);
      
      // Set cookie immediately for faster middleware recognition
      setFastAuthCookie(result.user.uid);
      
      // Load user data immediately after successful authentication
      try {
        await createUserProfile(result.user);
        // Check if data is in local storage first, then fallback to server
        const localData = getUserData(result.user.uid);
        if (!localData || Object.keys(localData).length === 0) {
          // No local data, fetch from server
          const dbData = await loadData(result.user.uid);
          if (dbData && Object.keys(dbData).length > 0) {
            saveUserData(result.user.uid, dbData);
          }
        }
        // Fire event to notify components that user data is ready
        window.dispatchEvent(new CustomEvent('user-data-loaded', { detail: { userId: result.user.uid } }));
      } catch (dataError) {
        console.error('Error loading user data after sign in:', dataError);
        // Continue with redirect even if data loading fails
      }
      
      // Sync Google profile photo to Supabase in the background
      if (result.user.photoURL) {
        syncGoogleProfilePhoto(result.user).catch(console.error);
      }
      
      toast.success('Signed in successfully!');
      
      // Redirect after ensuring data is loaded
      router.push('/dashboard');
      
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in was cancelled.');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Pop-up was blocked. Please allow pop-ups and try again.');
      } else {
        toast.error('Failed to sign in with Google. Please try again.');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, signInWithGoogle, forceReloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
