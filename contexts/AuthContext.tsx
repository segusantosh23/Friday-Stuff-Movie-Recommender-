
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut, 
  updateProfile,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../services/firebase';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggingIn: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserDisplayName: (newUsername: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch or create user profile in Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            // Create initial profile
            await setDoc(userDocRef, {
              userId: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'User',
              photoURL: firebaseUser.photoURL || '',
              termsAccepted: true,
              createdAt: serverTimestamp()
            });
            
            setUser({
              uid: firebaseUser.uid,
              username: firebaseUser.displayName || 'User',
              email: firebaseUser.email,
              profilePicture: firebaseUser.photoURL || undefined,
              termsAccepted: true
            });
          } else {
            const data = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              username: data.displayName || firebaseUser.displayName || 'User',
              email: firebaseUser.email,
              profilePicture: data.photoURL || firebaseUser.photoURL || undefined,
              termsAccepted: true
            });
          }
        } catch (error) {
          console.error("Error fetching user profile", error);
          setUser({
            uid: firebaseUser.uid,
            username: firebaseUser.displayName || 'User',
            email: firebaseUser.email,
            profilePicture: firebaseUser.photoURL || undefined
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request') {
        console.warn("A login popup was already open. Please check your browser windows.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log("User closed the login popup.");
      } else {
        console.error("Login failed", error);
        throw error;
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Email login failed", error);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
    } catch (error: any) {
      console.error("Signup failed", error);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const updateUserDisplayName = async (newUsername: string) => {
    if (auth.currentUser) {
      try {
        // Update Firebase Auth profile
        await updateProfile(auth.currentUser, { displayName: newUsername });
        
        // Update Firestore profile
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userDocRef, {
          displayName: newUsername
        }, { merge: true });

        setUser(prev => prev ? { ...prev, username: newUsername } : null);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isLoggingIn, 
      login, 
      loginWithEmail, 
      signupWithEmail, 
      logout, 
      updateUserDisplayName
    }}>
      {children}
    </AuthContext.Provider>
  );
};
