
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../../types';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map Firebase User to App User
  const mapUser = (fbUser: FirebaseUser, role: User['role']): User => {
    return {
      id: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
      email: fbUser.email || '',
      role
    };
  };

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase Auth not initialized. Skipping auth listener.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      let role: User['role'] = fbUser.email === 'optistyle.india@gmail.com' ? 'admin' : 'user';

      if (db) {
        try {
          const userRef = doc(db, "users", fbUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data() as any;
            if (data?.role === 'admin' || data?.role === 'user') {
              role = data.role;
            }
          } else {
            await setDoc(userRef, {
              uid: fbUser.uid,
              email: fbUser.email || '',
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
              role,
              createdAt: new Date().toISOString()
            });
          }
        } catch (e) {
          console.error("Failed to load user role from Firestore", e);
        }
      }

      if (!cancelled) {
        setUser(mapUser(fbUser, role));
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    if (!auth) {
      const msg = "Authentication service is not configured. Please check .env file.";
      setError(msg);
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // State updates handled by onAuthStateChanged
    } catch (err: any) {
      console.error("Login Failed", err);
      let msg = "Failed to login.";
      if (err.code === 'auth/user-not-found') msg = "No account found with this email.";
      if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
      if (err.code === 'auth/invalid-email') msg = "Invalid email address.";
      setError(msg);
      setIsLoading(false); // Manually stop loading on error since auth state won't change
      throw new Error(msg);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);

    if (!auth) {
      const msg = "Authentication service is not configured. Please check .env file.";
      setError(msg);
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Create user document in Firestore for Backend Role Verification
      // Mirror the frontend logic: if email is optistyle.india@gmail.com, make them admin in DB too
      const role = email === 'optistyle.india@gmail.com' ? 'admin' : 'user';
      
      if (db) {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: email,
          name: name,
          role: role,
          createdAt: new Date().toISOString()
        });
      } else {
        console.error("Firestore not initialized, cannot create user profile in DB.");
      }

      // Force update user state immediately to reflect name change before reload
      setUser(mapUser({ ...userCredential.user, displayName: name } as FirebaseUser, role));
    } catch (err: any) {
      console.error("Registration Failed", err);
      let msg = "Failed to register.";
      if (err.code === 'auth/email-already-in-use') msg = "Email is already in use.";
      if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
      setError(msg);
      setIsLoading(false);
      throw new Error(msg);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);

    if (!auth) {
      setError("Authentication service unavailable.");
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error("Reset Password Failed", err);
      // We generally do NOT want to tell the user if the email doesn't exist for security (enumeration protection)
      // unless it's a critical network error.
      if (err.code === 'auth/invalid-email') {
        throw new Error("Please enter a valid email address.");
      }
      // For user-not-found, we swallow the error in the UI layer to simulate success,
      // or handle it here depending on strictness.
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      resetPassword,
      isLoading,
      isAdmin: user?.role === 'admin',
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
