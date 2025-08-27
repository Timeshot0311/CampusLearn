"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from 'react';

export type Role = 'student' | 'tutor' | 'admin' | 'lecturer';

type User = {
  name: string;
  email: string;
  role: Role;
  avatar: string;
};

const users: Record<Role, User> = {
  student: {
    name: 'Alex Doe',
    email: 'alex.doe@campus.edu',
    role: 'student',
    avatar: 'https://i.pravatar.cc/150?u=alex',
  },
  tutor: {
    name: 'Dr. Evelyn Reed',
    email: 'e.reed@campus.edu',
    role: 'tutor',
    avatar: 'https://i.pravatar.cc/150?u=evelyn',
  },
  lecturer: {
    name: 'Dr. Samuel Green',
    email: 's.green@campus.edu',
    role: 'lecturer',
    avatar: 'https://i.pravatar.cc/150?u=samuel'
  },
  admin: {
    name: 'Sam Wallace',
    email: 's.wallace@campus.edu',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?u=sam',
  },
};

interface AuthContextType {
  user: User;
  setUserRole: (role: Role) => void;
  roles: Role[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<Role>('student');

  const setUserRole = (role: Role) => {
    if (users[role]) {
      setCurrentRole(role);
    }
  };
  
  const user = users[currentRole];
  const roles = Object.keys(users) as Role[];

  const value = useMemo(() => ({ user, setUserRole, roles }), [user, roles]);

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
  return context;
}
