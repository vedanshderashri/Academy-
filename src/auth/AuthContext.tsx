import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProgress, Certificate, dbService } from '../db/DatabaseService';

interface AuthContextType {
  user: User | null;
  progress: UserProgress | null;
  certificates: Certificate[];
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
  recordMissionCompleted: (missionId: number, rewardAmount: number) => Promise<void>;
  recordQuizCompleted: (quizResult: { type: 'PRE_TEST' | 'POST_TEST' | 'AI_QUIZ'; topic: string; score: number; total: number; percentage: number }) => Promise<void>;
  generateCertificate: (courseTitle?: string) => Promise<Certificate | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_GUEST_USER: User = {
  id: 'guest-demo-id',
  username: 'Vedansh Engineer',
  email: 'vedansh@networktycoon.io',
  role: 'Network Architect',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load active session from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedUserId = localStorage.getItem('nt_active_user_id');
      if (savedUserId) {
        if (savedUserId === DEMO_GUEST_USER.id) {
          setUser(DEMO_GUEST_USER);
          const userProg = await dbService.getUserProgress(DEMO_GUEST_USER.id);
          const certs = await dbService.getUserCertificates(DEMO_GUEST_USER.id);
          setProgress(userProg);
          setCertificates(certs);
        } else {
          // fetch from db
          const progressData = await dbService.getUserProgress(savedUserId);
          const certs = await dbService.getUserCertificates(savedUserId);
          setProgress(progressData);
          setCertificates(certs);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await dbService.signInUser(email, pass);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('nt_active_user_id', res.user.id);
        const prog = await dbService.getUserProgress(res.user.id);
        const certs = await dbService.getUserCertificates(res.user.id);
        setProgress(prog);
        setCertificates(certs);
        return { success: true };
      }
      return { success: false, error: res.error || 'Invalid email or password.' };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e?.message || 'Login failed.' };
    }
  };

  const signup = async (username: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await dbService.signUpUser(username, email, pass);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('nt_active_user_id', res.user.id);
        const prog = await dbService.getUserProgress(res.user.id);
        setProgress(prog);
        setCertificates([]);
        return { success: true };
      }
      return { success: false, error: res.error || 'Signup failed.' };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e?.message || 'Signup failed.' };
    }
  };

  const loginAsGuest = async () => {
    setUser(DEMO_GUEST_USER);
    localStorage.setItem('nt_active_user_id', DEMO_GUEST_USER.id);
    const userProg = await dbService.getUserProgress(DEMO_GUEST_USER.id);
    const certs = await dbService.getUserCertificates(DEMO_GUEST_USER.id);
    setProgress(userProg);
    setCertificates(certs);
  };

  const logout = () => {
    setUser(null);
    setProgress(null);
    setCertificates([]);
    localStorage.removeItem('nt_active_user_id');
  };

  const recordMissionCompleted = async (missionId: number, rewardAmount: number) => {
    if (!user || !progress) return;
    const isNew = !progress.completedMissionIds.includes(missionId);
    const updatedMissions = isNew ? [...progress.completedMissionIds, missionId] : progress.completedMissionIds;
    
    const updatedProgress: UserProgress = {
      ...progress,
      completedMissionIds: updatedMissions,
      claimedRewards: { ...progress.claimedRewards, [missionId]: true },
      totalTycoonEarned: progress.totalTycoonEarned + (isNew ? rewardAmount : 0),
      unlockedBadges: updatedMissions.length >= 5 && !progress.unlockedBadges.includes('NETWORK_PRO')
        ? [...progress.unlockedBadges, 'NETWORK_PRO']
        : progress.unlockedBadges,
    };

    setProgress(updatedProgress);
    await dbService.saveUserProgress(updatedProgress);
  };

  const recordQuizCompleted = async (quizResult: { type: 'PRE_TEST' | 'POST_TEST' | 'AI_QUIZ'; topic: string; score: number; total: number; percentage: number }) => {
    if (!user || !progress) return;

    const newQuizEntry = {
      timestamp: Date.now(),
      ...quizResult,
    };

    const updatedProgress: UserProgress = {
      ...progress,
      quizScores: [newQuizEntry, ...progress.quizScores],
    };

    setProgress(updatedProgress);
    await dbService.saveUserProgress(updatedProgress);
  };

  const generateCertificate = async (courseTitle = 'Certified Computer Network Architect & Systems Specialist'): Promise<Certificate | null> => {
    if (!user || !progress) return null;

    const newCert: Certificate = {
      id: `CERT-${Date.now().toString(36).toUpperCase()}`,
      userId: user.id,
      userName: user.username,
      courseTitle,
      issuedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      certificateCode: `NT-VERIFIED-${Math.floor(100000 + Math.random() * 900000)}`,
      gpaScore: 4.0,
      completedMissionsCount: progress.completedMissionIds.length,
    };

    await dbService.issueCertificate(newCert);
    setCertificates((prev) => [newCert, ...prev]);
    return newCert;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        progress,
        certificates,
        isLoading,
        login,
        signup,
        loginAsGuest,
        logout,
        recordMissionCompleted,
        recordQuizCompleted,
        generateCertificate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
