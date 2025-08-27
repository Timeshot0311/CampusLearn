
"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '@/services/user-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // Kept for type compatibility in sidebar for now, but is unused.
  roles: string[]; 
  setUserRole: (role: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && db) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser({ id: userDocSnap.id, ...userDocSnap.data() } as User);
        } else {
          // Handle case where user exists in Auth but not Firestore
          setUser(null); 
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(() => ({ 
      user, 
      loading,
      roles: ['student', 'tutor', 'lecturer', 'admin'], // Dummy data, not used
      setUserRole: () => {} // Dummy function, not used
    }), [user, loading]);

  if (loading) {
    // You can return a global loader here if you want
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // This provides a fallback user object to prevent the app from crashing on logout
  // before a redirect can happen. Components expecting a user will get a dummy object.
  if (!context.user) {
      return {
          ...context,
          user: {
              id: '',
              name: 'Guest',
              email: '',
              role: 'student',
              status: 'Inactive',
              avatar: ''
          }
      };
  }
  return context;
}
