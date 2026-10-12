// Database Service supporting both Supabase Cloud Database & Local IndexedDB Fallback

import { supabase, isSupabaseConfigured } from './SupabaseClient';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'Student' | 'Professor' | 'Network Architect';
  avatarUrl: string;
  createdAt: string;
}

export interface UserProgress {
  userId: string;
  completedMissionIds: number[];
  claimedRewards: Record<number, boolean>;
  totalTycoonEarned: number;
  quizScores: Array<{
    timestamp: number;
    type: 'PRE_TEST' | 'POST_TEST' | 'AI_QUIZ';
    topic: string;
    score: number;
    total: number;
    percentage: number;
  }>;
  unlockedBadges: string[];
}

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  courseTitle: string;
  issuedAt: string;
  certificateCode: string;
  gpaScore: number;
  completedMissionsCount: number;
}

const DB_NAME = 'NetworkTycoonDB';
const DB_VERSION = 1;

class DatabaseService {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Users table
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
        }

        // User Progress table
        if (!db.objectStoreNames.contains('user_progress')) {
          db.createObjectStore('user_progress', { keyPath: 'userId' });
        }

        // Certificates table
        if (!db.objectStoreNames.contains('certificates')) {
          const certStore = db.createObjectStore('certificates', { keyPath: 'id' });
          certStore.createIndex('userId', 'userId', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  // Check if active backend is Supabase Cloud DB
  isCloudActive(): boolean {
    return isSupabaseConfigured();
  }

  // User Authentication & Sign Up
  async signUpUser(username: string, email: string, pass: string): Promise<{ user: User | null; error?: string }> {
    if (this.isCloudActive()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: { username, role: 'Student' },
          },
        });

        if (error || !data.user) {
          console.error('Supabase Auth SignUp Error:', error);
          return { user: null, error: error?.message || 'SignUp failed on Supabase Cloud.' };
        }

        const newUser: User = {
          id: data.user.id,
          username,
          email,
          role: 'Student',
          avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
          createdAt: new Date().toISOString(),
        };

        // Attempt upserting profile and progress
        const { error: profileErr } = await supabase.from('users_profile').upsert({
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          avatar_url: newUser.avatarUrl,
        });
        if (profileErr) console.warn('users_profile insert warn:', profileErr.message);

        const { error: progErr } = await supabase.from('user_progress').upsert({
          user_id: newUser.id,
          completed_mission_ids: [],
          claimed_rewards: {},
          total_tycoon_earned: 10000,
          quiz_scores: [],
          unlocked_badges: ['NETWORK_NOVICE'],
        });
        if (progErr) console.warn('user_progress insert warn:', progErr.message);

        // Backup to local IndexedDB
        await this.saveLocalUser(newUser, pass);

        return { user: newUser };
      } catch (err: any) {
        console.error('Supabase signup failed:', err?.message || err);
        return { user: null, error: err?.message || 'Failed to connect to Supabase Cloud.' };
      }
    }

    // Local IndexedDB Fallback
    const newUser: User = {
      id: `usr-${Date.now()}`,
      username,
      email,
      role: 'Student',
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
      createdAt: new Date().toISOString(),
    };
    await this.saveLocalUser(newUser, pass);
    return { user: newUser };
  }

  // User Sign In Log In
  async signInUser(email: string, pass: string): Promise<{ user: User | null; error?: string }> {
    if (this.isCloudActive()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (error || !data.user) {
          console.error('Supabase Auth SignIn Error:', error);
          return { user: null, error: error?.message || 'Invalid email or password.' };
        }

        // Fetch user profile from Supabase
        const { data: profile } = await supabase
          .from('users_profile')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        let username = profile?.username || data.user.user_metadata?.username || email.split('@')[0];
        let role = profile?.role || 'Student';
        let avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${email}`;

        const userObj: User = {
          id: data.user.id,
          username,
          email,
          role,
          avatarUrl,
          createdAt: data.user.created_at || new Date().toISOString(),
        };

        // If profile row was missing, create it now
        if (!profile) {
          await supabase.from('users_profile').upsert({
            id: userObj.id,
            username: userObj.username,
            email: userObj.email,
            role: userObj.role,
            avatar_url: userObj.avatarUrl,
          });
        }

        // Cache local copy
        await this.saveLocalUser(userObj, pass);

        return { user: userObj };
      } catch (err: any) {
        console.error('Supabase signIn error:', err);
        return { user: null, error: err?.message || 'Login failed.' };
      }
    }

    const localUser = await this.getLocalUserByEmail(email, pass);
    return { user: localUser, error: localUser ? undefined : 'User not found in local database.' };
  }

  // Get User Progress from Supabase or IndexedDB
  async getUserProgress(userId: string): Promise<UserProgress> {
    if (this.isCloudActive()) {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (data) {
          const prog: UserProgress = {
            userId: data.user_id,
            completedMissionIds: data.completed_mission_ids || [],
            claimedRewards: data.claimed_rewards || {},
            totalTycoonEarned: data.total_tycoon_earned || 10000,
            quizScores: data.quiz_scores || [],
            unlockedBadges: data.unlocked_badges || ['NETWORK_NOVICE'],
          };
          await this.saveLocalUserProgress(prog);
          return prog;
        } else {
          // Create default progress row if not present
          const defaultProg: UserProgress = {
            userId,
            completedMissionIds: [],
            claimedRewards: {},
            totalTycoonEarned: 10000,
            quizScores: [],
            unlockedBadges: ['NETWORK_NOVICE'],
          };
          await supabase.from('user_progress').upsert({
            user_id: userId,
            completed_mission_ids: [],
            claimed_rewards: {},
            total_tycoon_earned: 10000,
            quiz_scores: [],
            unlocked_badges: ['NETWORK_NOVICE'],
          });
          return defaultProg;
        }
      } catch (err) {
        console.error('Failed to fetch user progress from Supabase:', err);
      }
    }

    return await this.getLocalUserProgress(userId);
  }

  // Save User Progress to Supabase Cloud & IndexedDB
  async saveUserProgress(progress: UserProgress): Promise<UserProgress> {
    await this.saveLocalUserProgress(progress);

    if (this.isCloudActive()) {
      try {
        const { error } = await supabase.from('user_progress').upsert({
          user_id: progress.userId,
          completed_mission_ids: progress.completedMissionIds,
          claimed_rewards: progress.claimedRewards,
          total_tycoon_earned: progress.totalTycoonEarned,
          quiz_scores: progress.quizScores,
          unlocked_badges: progress.unlockedBadges,
          updated_at: new Date().toISOString(),
        });
        if (error) console.error('Supabase user_progress upsert error:', error.message);
      } catch (err) {
        console.error('Failed to upsert progress to Supabase Cloud DB:', err);
      }
    }

    return progress;
  }

  // Issue Certificate to Supabase Cloud & IndexedDB
  async issueCertificate(cert: Certificate): Promise<Certificate> {
    await this.saveLocalCertificate(cert);

    if (this.isCloudActive()) {
      try {
        const { error } = await supabase.from('certificates').insert({
          id: cert.id,
          user_id: cert.userId,
          user_name: cert.userName,
          course_title: cert.courseTitle,
          issued_at: cert.issuedAt,
          certificate_code: cert.certificateCode,
          gpa_score: cert.gpaScore,
          completed_missions_count: cert.completedMissionsCount,
        });
        if (error) console.error('Supabase certificate insert error:', error.message);
      } catch (err) {
        console.error('Failed to issue certificate to Supabase Cloud DB:', err);
      }
    }

    return cert;
  }

  // Get User Certificates from Supabase Cloud or IndexedDB
  async getUserCertificates(userId: string): Promise<Certificate[]> {
    if (this.isCloudActive()) {
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .eq('user_id', userId);

        if (data && data.length > 0) {
          return data.map((c: any) => ({
            id: c.id,
            userId: c.user_id,
            userName: c.user_name,
            courseTitle: c.course_title,
            issuedAt: c.issued_at,
            certificateCode: c.certificate_code,
            gpaScore: c.gpa_score,
            completedMissionsCount: c.completed_missions_count,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch certificates from Supabase:', err);
      }
    }

    return await this.getLocalUserCertificates(userId);
  }

  // --- LOCAL INDEXEDDB HELPERS ---
  private async saveLocalUser(user: User, passwordHash: string): Promise<User> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['users', 'user_progress'], 'readwrite');
      const userStore = tx.objectStore('users');
      const progressStore = tx.objectStore('user_progress');

      userStore.put({ ...user, passwordHash });

      const initialProgress: UserProgress = {
        userId: user.id,
        completedMissionIds: [],
        claimedRewards: {},
        totalTycoonEarned: 10000,
        quizScores: [],
        unlockedBadges: ['NETWORK_NOVICE'],
      };
      progressStore.put(initialProgress);

      tx.oncomplete = () => resolve(user);
      tx.onerror = () => reject(tx.error);
    });
  }

  private async getLocalUserByEmail(email: string, pass: string): Promise<User | null> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      const index = store.index('email');
      const req = index.get(email);

      req.onsuccess = () => {
        if (!req.result) return resolve(null);
        if (req.result.passwordHash === pass) {
          const { passwordHash, ...user } = req.result;
          resolve(user as User);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  private async getLocalUserProgress(userId: string): Promise<UserProgress> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('user_progress', 'readonly');
      const store = tx.objectStore('user_progress');
      const req = store.get(userId);

      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result);
        } else {
          resolve({
            userId,
            completedMissionIds: [],
            claimedRewards: {},
            totalTycoonEarned: 10000,
            quizScores: [],
            unlockedBadges: ['NETWORK_NOVICE'],
          });
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  private async saveLocalUserProgress(progress: UserProgress): Promise<UserProgress> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('user_progress', 'readwrite');
      const store = tx.objectStore('user_progress');
      store.put(progress);

      tx.oncomplete = () => resolve(progress);
      tx.onerror = () => reject(tx.error);
    });
  }

  private async saveLocalCertificate(cert: Certificate): Promise<Certificate> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('certificates', 'readwrite');
      const store = tx.objectStore('certificates');
      store.put(cert);

      tx.oncomplete = () => resolve(cert);
      tx.onerror = () => reject(tx.error);
    });
  }

  private async getLocalUserCertificates(userId: string): Promise<Certificate[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('certificates', 'readonly');
      const store = tx.objectStore('certificates');
      const index = store.index('userId');
      const req = index.getAll(userId);

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }
}

export const dbService = new DatabaseService();
