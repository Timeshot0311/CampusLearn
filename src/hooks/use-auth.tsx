
"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { User, Role } from '@/services/user-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  roles: Role[]; 
  setUserRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [effectiveRole, setEffectiveRole] = useState<Role | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && db) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = { id: userDocSnap.id, ...userDocSnap.data() } as User;
          setUser(userData);
          setEffectiveRole(userData.role); // Initialize effective role
        } else {
          // Handle case where user exists in Auth but not Firestore
          setUser(null); 
          setEffectiveRole(null);
        }
      } else {
        setUser(null);
        setEffectiveRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setUserRole = (role: Role) => {
    setEffectiveRole(role);
  };
  
  const effectiveUser = useMemo(() => {
      if (!user) return null;
      return { ...user, role: effectiveRole || user.role };
  }, [user, effectiveRole]);

  const value = useMemo(() => ({ 
      user: effectiveUser, 
      loading,
      roles: ['student', 'tutor', 'lecturer', 'admin'], 
      setUserRole
    }), [effectiveUser, loading]);

  if (loading) {
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
  if (!context.user) {
      return {
          ...context,
          user: {
              id: '',
              name: 'Guest',
              email: '',
              role: 'student' as Role,
              status: 'Inactive',
              avatar: ''
          }
      };
  }
  return context;
}
