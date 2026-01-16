
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  User as FirebaseUser,
  signInAnonymously
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

interface AuthContextType {
  user: User | null;
  uid: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapUser = (fbUser: FirebaseUser): User => {
    const role = fbUser.email === 'optistyle.india@gmail.com' ? 'admin' : 'user';
    return {
      id: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
      email: fbUser.email || '',
      photoURL: fbUser.photoURL || undefined,
      role,
      isAnonymous: fbUser.isAnonymous
    };
  };

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase Auth not initialized. Skipping auth listener.");
      setUid(null);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUid(fbUser.uid);
        if (fbUser.isAnonymous) {
          setUser(null);
          setIsLoading(false);
        } else {
          if (db) {
            (async () => {
              try {
                const userRef = doc(db, "users", fbUser.uid);
                const snap = await getDoc(userRef);
                if (snap.exists()) {
                  const data = snap.data() as any;
                  let role = data.role || (fbUser.email === 'optistyle.india@gmail.com' ? 'admin' : 'user');
                  if (fbUser.email === 'optistyle.india@gmail.com' && data.role !== 'admin') {
                    role = 'admin';
                    await setDoc(userRef, { ...data, role }, { merge: true });
                  }
                  setUser({
                    id: fbUser.uid,
                    name: data.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
                    email: data.email || fbUser.email || '',
                    photoURL: data.photoURL || fbUser.photoURL || undefined,
                    role,
                    isAnonymous: fbUser.isAnonymous
                  });
                } else {
                  const mapped = mapUser(fbUser);
                  setUser(mapped);
                  await setDoc(userRef, {
                    uid: fbUser.uid,
                    email: mapped.email,
                    name: mapped.name,
                    role: mapped.role,
                    photoURL: mapped.photoURL || null,
                    createdAt: new Date().toISOString()
                  });
                }
              } catch {
                setUser(mapUser(fbUser));
              } finally {
                setIsLoading(false);
              }
            })();
          } else {
            setUser(mapUser(fbUser));
            setIsLoading(false);
          }
        }
      } else {
        setUser(null);
        setUid(null);
        (async () => {
          try {
            await signInAnonymously(auth!);
          } catch (e) {
            console.error("Anonymous sign-in failed", e);
            setIsLoading(false);
          }
        })();
      }
    });

    return () => unsubscribe();
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
    } catch (err: any) {
      let msg = "Failed to login.";
      if (err.code === 'auth/user-not-found') msg = "No account found with this email.";
      if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
      if (err.code === 'auth/invalid-email') msg = "Invalid email address.";
      if (err.code === 'auth/invalid-credential') msg = "Incorrect email or password.";
      setError(msg);
      setIsLoading(false);
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);

    if (!auth || !googleProvider) {
      const msg = "Authentication service is not configured. Please check .env file.";
      setError(msg);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      if (db) {
        try {
          const userRef = doc(db, "users", fbUser.uid);
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            const role = fbUser.email === 'optistyle.india@gmail.com' ? 'admin' : 'user';
            await setDoc(userRef, {
              uid: fbUser.uid,
              email: fbUser.email,
              name: fbUser.displayName || fbUser.email || 'Google User',
              role,
              createdAt: new Date().toISOString(),
              provider: 'google'
            });
          }
        } catch (e) {
        }
      }
      setIsLoading(false);
    } catch (err: any) {
      let msg = "Failed to login with Google.";
      if (err.code === 'auth/popup-closed-by-user') msg = "Login cancelled.";
      if (err.code === 'auth/popup-blocked') msg = "Popup blocked. Please allow popups and try again.";
       if (err.code === 'auth/operation-not-allowed') msg = "Google login is not enabled. Please use email login.";
      setError(msg);
      setIsLoading(false);
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
      setUser(mapUser({ ...userCredential.user, displayName: name } as FirebaseUser));
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
      uid,
      login, 
      register, 
      logout, 
      resetPassword,
      loginWithGoogle,
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
