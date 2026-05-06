import { create } from 'zustand';
import type { ActivityType, Badge, DailyMission, PointTransaction, Reward, UserGamification } from './types';

export const POINT_RULES: Record<ActivityType, number> = {
  daily_check_in: 10,
  read_eye_tips: 5,
  ai_screening_completed: 15,
  booking_created: 25,
  clinic_exam_completed: 50,
  marketplace_purchase: 20,
  reward_redeemed: 0,
  eye_break_202020: 5,
  schedule_checked: 5,
};

const CHECKED_IN_MESSAGE = 'Anda sudah check-in hari ini. Kembali lagi besok untuk menjaga streak Anda.';
const INSUFFICIENT_POINTS_MESSAGE = 'Poin belum cukup untuk menukar reward ini.';
const MISSION_COMPLETED_MESSAGE = 'Misi ini sudah selesai.';
const DAY_IN_MS = 86_400_000;

const getTodayKey = () => new Date().toISOString().slice(0, 10);
const getDateKey = (date: Date) => date.toISOString().slice(0, 10);
const getNow = () => new Date().toISOString();
const getInitialDate = () => getDateKey(new Date(Date.now() - DAY_IN_MS));
const createTransactionId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `trx-${Date.now()}`);

function dateDiffInDays(fromDate: string, toDate = getTodayKey()) {
  const from = new Date(`${fromDate}T00:00:00.000Z`).getTime();
  const to = new Date(`${toDate}T00:00:00.000Z`).getTime();

  return Math.round((to - from) / DAY_IN_MS);
}

const createInitialMissions = (): DailyMission[] => [
  {
    id: 'daily-check-in',
    title: 'Check-in kesehatan mata',
    description: 'Mulai hari dengan komitmen kecil menjaga mata tetap nyaman.',
    pointReward: POINT_RULES.daily_check_in,
    missionType: 'daily_check_in',
    isCompleted: false,
    completedAt: null,
  },
  {
    id: 'read-eye-tips',
    title: 'Baca 1 tips mata sehat',
    description: 'Luangkan 1 menit untuk edukasi kesehatan mata yang praktis.',
    pointReward: POINT_RULES.read_eye_tips,
    missionType: 'read_eye_tips',
    isCompleted: false,
    completedAt: null,
  },
  {
    id: 'eye-break-202020',
    title: 'Lakukan istirahat mata 20-20-20',
    description: 'Alihkan pandangan ke jarak jauh selama 20 detik.',
    pointReward: POINT_RULES.eye_break_202020,
    missionType: 'eye_break_202020',
    isCompleted: false,
    completedAt: null,
  },
  {
    id: 'ai-screening',
    title: 'Isi AI Screening Mata jika ada keluhan',
    description: 'Screening awal membantu Anda tahu langkah lanjutan yang tepat.',
    pointReward: POINT_RULES.ai_screening_completed,
    missionType: 'ai_screening_completed',
    isCompleted: false,
    completedAt: null,
  },
  {
    id: 'check-schedule',
    title: 'Cek jadwal pemeriksaan',
    description: 'Pastikan jadwal kontrol dan antrean Anda tidak terlewat.',
    pointReward: POINT_RULES.schedule_checked,
    missionType: 'schedule_checked',
    isCompleted: false,
    completedAt: null,
  },
];

interface GamificationStore {
  user: UserGamification;
  badges: Badge[];
  rewards: Reward[];
  transactions: PointTransaction[];
  dailyMissions: DailyMission[];
  dailyMissionDate: string;
  counts: Record<ActivityType, number>;
  error: string | null;
  checkInDaily: (userId: string) => { success: boolean; message: string };
  addPoints: (userId: string, activityType: ActivityType, points?: number, description?: string) => void;
  calculateStreak: (userId: string) => number;
  completeMission: (userId: string, missionId: string) => { success: boolean; message: string };
  unlockBadgeIfEligible: (userId: string) => void;
  redeemReward: (userId: string, rewardId: string) => { success: boolean; message: string };
  getUserGamificationSummary: (userId: string) => UserGamification;
  getDailyMissions: (userId: string) => DailyMission[];
  getAvailableRewards: (userId: string) => Reward[];
}

const activityDescriptions: Record<ActivityType, string> = {
  daily_check_in: 'Check-in harian Daily Wins',
  read_eye_tips: 'Membaca tips kesehatan mata',
  ai_screening_completed: 'Menyelesaikan AI Screening Mata',
  booking_created: 'Booking pemeriksaan mata',
  clinic_exam_completed: 'Menyelesaikan pemeriksaan di klinik',
  marketplace_purchase: 'Pembelian produk/layanan marketplace',
  reward_redeemed: 'Penukaran reward',
  eye_break_202020: 'Istirahat mata 20-20-20',
  schedule_checked: 'Cek jadwal pemeriksaan',
};

const unlockedStarterTransaction: PointTransaction = {
  id: 'trx-seed-read-tips',
  userId: 'patient-001',
  activityType: 'read_eye_tips',
  points: POINT_RULES.read_eye_tips,
  description: activityDescriptions.read_eye_tips,
  createdAt: getInitialDate(),
};

export const useGamificationStore = create<GamificationStore>((set, get) => {
  const resetDailyMissionsIfNeeded = () => {
    if (get().dailyMissionDate !== getTodayKey()) {
      set({ dailyMissions: createInitialMissions(), dailyMissionDate: getTodayKey() });
    }
  };

  const normalizeMissedStreak = () => {
    const { user } = get();

    if (user.lastCheckInDate && dateDiffInDays(user.lastCheckInDate) > 1 && user.currentStreak !== 0) {
      set({ user: { ...user, currentStreak: 0, updatedAt: getNow() } });
    }
  };

  return {
    user: {
      userId: 'patient-001',
      totalPoints: 120,
      currentStreak: 2,
      longestStreak: 5,
      lastCheckInDate: getInitialDate(),
      level: 2,
      createdAt: '2026-05-01T08:00:00.000Z',
      updatedAt: getNow(),
    },
    badges: [
      {
        id: 'mata-sehat-starter',
        name: 'Mata Sehat Starter',
        description: 'Badge pertama untuk pasien yang berhasil melakukan check-in pertama.',
        icon: 'medal',
        requirementType: 'check_in_count',
        requirementValue: 1,
        isUnlocked: false,
        unlockedAt: null,
      },
      {
        id: 'seven-day-eye-care',
        name: '7 Day Eye Care',
        description: 'Jaga streak check-in kesehatan mata selama 7 hari berturut-turut.',
        icon: 'flame',
        requirementType: 'streak',
        requirementValue: 7,
        isUnlocked: false,
        unlockedAt: null,
      },
      {
        id: 'ai-screening-hero',
        name: 'AI Screening Hero',
        description: 'Selesaikan AI Screening Mata sebanyak 3 kali.',
        icon: 'trophy',
        requirementType: 'activity_count',
        requirementValue: 3,
        isUnlocked: false,
        unlockedAt: null,
      },
      {
        id: 'rajin-kontrol',
        name: 'Rajin Kontrol',
        description: 'Booking pemeriksaan mata sebanyak 3 kali.',
        icon: 'calendar',
        requirementType: 'activity_count',
        requirementValue: 3,
        isUnlocked: false,
        unlockedAt: null,
      },
      {
        id: 'prime-care-member',
        name: 'Prime Care Member',
        description: 'Kumpulkan total 500 poin Daily Wins.',
        icon: 'crown',
        requirementType: 'total_points',
        requirementValue: 500,
        isUnlocked: false,
        unlockedAt: null,
      },
    ],
    rewards: [
      {
        id: 'voucher-exam-10000',
        title: 'Voucher diskon pemeriksaan Rp 10.000',
        description: 'Potongan biaya untuk pemeriksaan mata berikutnya di Klinik Utama Prime.',
        pointsRequired: 150,
        rewardType: 'voucher',
        value: 'Rp 10.000',
        isAvailable: true,
      },
      {
        id: 'voucher-marketplace-5',
        title: 'Voucher diskon produk marketplace 5%',
        description: 'Diskon untuk pembelian vitamin mata, tetes mata, atau aksesori optik.',
        pointsRequired: 180,
        rewardType: 'voucher',
        value: '5%',
        isAvailable: true,
      },
      {
        id: 'short-online-consultation',
        title: 'Gratis konsultasi singkat online',
        description: 'Sesi konsultasi singkat untuk pertanyaan ringan seputar kesehatan mata.',
        pointsRequired: 250,
        rewardType: 'consultation',
        value: '1 sesi',
        isAvailable: true,
      },
      {
        id: 'priority-queue',
        title: 'Prioritas antrean',
        description: 'Prioritas antrean satu kali saat kunjungan pemeriksaan.',
        pointsRequired: 300,
        rewardType: 'queue_priority',
        value: '1 kali',
        isAvailable: true,
      },
    ],
    transactions: [unlockedStarterTransaction],
    counts: {
      daily_check_in: 0,
      read_eye_tips: 1,
      ai_screening_completed: 0,
      booking_created: 0,
      clinic_exam_completed: 0,
      marketplace_purchase: 0,
      reward_redeemed: 0,
      eye_break_202020: 0,
      schedule_checked: 0,
    },
    dailyMissions: createInitialMissions(),
    dailyMissionDate: getTodayKey(),
    error: null,

    checkInDaily: (userId) => {
      resetDailyMissionsIfNeeded();
      normalizeMissedStreak();

      const state = get();

      if (state.user.userId !== userId) {
        return { success: false, message: 'User tidak ditemukan.' };
      }

      if (state.user.lastCheckInDate === getTodayKey()) {
        set({ error: CHECKED_IN_MESSAGE });
        return { success: false, message: CHECKED_IN_MESSAGE };
      }

      const nextStreak = state.calculateStreak(userId);
      const now = getNow();

      set((current) => ({
        user: {
          ...current.user,
          currentStreak: nextStreak,
          longestStreak: Math.max(current.user.longestStreak, nextStreak),
          lastCheckInDate: getTodayKey(),
          updatedAt: now,
        },
        dailyMissions: current.dailyMissions.map((mission) =>
          mission.missionType === 'daily_check_in' ? { ...mission, isCompleted: true, completedAt: now } : mission,
        ),
        error: null,
      }));

      get().addPoints(userId, 'daily_check_in', POINT_RULES.daily_check_in, activityDescriptions.daily_check_in);
      get().unlockBadgeIfEligible(userId);

      return { success: true, message: 'Check-in berhasil! Streak Anda aman hari ini ✨' };
    },

    addPoints: (userId, activityType, points, description) => {
      const pointValue = points ?? POINT_RULES[activityType];

      if (pointValue < 0) {
        return;
      }

      set((state) => ({
        user: {
          ...state.user,
          totalPoints: state.user.totalPoints + pointValue,
          level: Math.floor((state.user.totalPoints + pointValue) / 100) + 1,
          updatedAt: getNow(),
        },
        counts: {
          ...state.counts,
          [activityType]: state.counts[activityType] + 1,
        },
        transactions: [
          {
            id: createTransactionId(),
            userId,
            activityType,
            points: pointValue,
            description: description ?? activityDescriptions[activityType],
            createdAt: getNow(),
          },
          ...state.transactions,
        ],
        error: null,
      }));

      get().unlockBadgeIfEligible(userId);
    },

    calculateStreak: (userId) => {
      const { user } = get();

      if (user.userId !== userId) {
        return 0;
      }

      if (!user.lastCheckInDate) {
        return 1;
      }

      const daysSinceLastCheckIn = dateDiffInDays(user.lastCheckInDate);

      if (daysSinceLastCheckIn === 0) {
        return user.currentStreak;
      }

      if (daysSinceLastCheckIn === 1) {
        return user.currentStreak + 1;
      }

      return 1;
    },

    completeMission: (userId, missionId) => {
      resetDailyMissionsIfNeeded();

      const mission = get().dailyMissions.find((item) => item.id === missionId);

      if (!mission) {
        return { success: false, message: 'Misi tidak ditemukan.' };
      }

      if (mission.isCompleted) {
        set({ error: MISSION_COMPLETED_MESSAGE });
        return { success: false, message: MISSION_COMPLETED_MESSAGE };
      }

      if (mission.missionType === 'daily_check_in') {
        return get().checkInDaily(userId);
      }

      const now = getNow();

      set((state) => ({
        dailyMissions: state.dailyMissions.map((item) =>
          item.id === missionId ? { ...item, isCompleted: true, completedAt: now } : item,
        ),
        error: null,
      }));

      get().addPoints(userId, mission.missionType, mission.pointReward, mission.title);
      get().unlockBadgeIfEligible(userId);

      return { success: true, message: `Misi selesai. +${mission.pointReward} poin ditambahkan.` };
    },

    unlockBadgeIfEligible: () => {
      const state = get();
      const now = getNow();

      set({
        badges: state.badges.map((badge) => {
          if (badge.isUnlocked) {
            return badge;
          }

          const shouldUnlock =
            (badge.id === 'mata-sehat-starter' && state.counts.daily_check_in >= badge.requirementValue) ||
            (badge.id === 'seven-day-eye-care' && state.user.currentStreak >= badge.requirementValue) ||
            (badge.id === 'ai-screening-hero' && state.counts.ai_screening_completed >= badge.requirementValue) ||
            (badge.id === 'rajin-kontrol' && state.counts.booking_created >= badge.requirementValue) ||
            (badge.id === 'prime-care-member' && state.user.totalPoints >= badge.requirementValue);

          return shouldUnlock ? { ...badge, isUnlocked: true, unlockedAt: now } : badge;
        }),
      });
    },

    redeemReward: (userId, rewardId) => {
      const state = get();
      const reward = state.rewards.find((item) => item.id === rewardId && item.isAvailable);

      if (!reward) {
        return { success: false, message: 'Reward tidak tersedia.' };
      }

      if (state.user.totalPoints < reward.pointsRequired) {
        set({ error: INSUFFICIENT_POINTS_MESSAGE });
        return { success: false, message: INSUFFICIENT_POINTS_MESSAGE };
      }

      set((current) => ({
        user: {
          ...current.user,
          totalPoints: current.user.totalPoints - reward.pointsRequired,
          level: Math.floor((current.user.totalPoints - reward.pointsRequired) / 100) + 1,
          updatedAt: getNow(),
        },
        counts: {
          ...current.counts,
          reward_redeemed: current.counts.reward_redeemed + 1,
        },
        transactions: [
          {
            id: createTransactionId(),
            userId,
            activityType: 'reward_redeemed',
            points: -reward.pointsRequired,
            description: `Tukar reward: ${reward.title}`,
            createdAt: getNow(),
          },
          ...current.transactions,
        ],
        error: null,
      }));

      return { success: true, message: `${reward.title} berhasil ditukar.` };
    },

    getUserGamificationSummary: (userId) => {
      resetDailyMissionsIfNeeded();
      normalizeMissedStreak();
      const { user } = get();

      return user.userId === userId ? user : get().user;
    },

    getDailyMissions: () => {
      resetDailyMissionsIfNeeded();
      return get().dailyMissions;
    },

    getAvailableRewards: () => get().rewards.filter((reward) => reward.isAvailable),
  };
});
