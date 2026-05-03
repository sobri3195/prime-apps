import { create } from 'zustand';
import { Badge, DailyMission, PointTransaction, Reward, UserGamification, ActivityType } from './types';

const POINT_RULES: Record<ActivityType, number> = {
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

const today = () => new Date().toISOString().slice(0, 10);
const isYesterday = (d: string) => new Date(`${d}T00:00:00`).getTime() === new Date(`${today()}T00:00:00`).getTime() - 86400000;

interface Store {
  user: UserGamification;
  badges: Badge[];
  rewards: Reward[];
  transactions: PointTransaction[];
  dailyMissions: DailyMission[];
  counts: Record<ActivityType, number>;
  error: string | null;
  checkInDaily: (userId: string) => { success: boolean; message: string };
  addPoints: (userId: string, activityType: ActivityType, points?: number) => void;
  calculateStreak: (userId: string) => number;
  completeMission: (userId: string, missionId: string) => { success: boolean; message: string };
  unlockBadgeIfEligible: (userId: string) => void;
  redeemReward: (userId: string, rewardId: string) => { success: boolean; message: string };
  getUserGamificationSummary: (userId: string) => UserGamification;
  getDailyMissions: (userId: string) => DailyMission[];
  getAvailableRewards: (userId: string) => Reward[];
}

const initialMissions = (): DailyMission[] => [
  { id: 'm1', title: 'Check-in kesehatan mata', description: 'Lakukan check-in harian untuk menjaga konsistensi.', pointReward: 10, missionType: 'daily_check_in', isCompleted: false, completedAt: null },
  { id: 'm2', title: 'Baca 1 tips mata sehat', description: 'Pelajari edukasi singkat kesehatan mata hari ini.', pointReward: 5, missionType: 'read_eye_tips', isCompleted: false, completedAt: null },
  { id: 'm3', title: 'Istirahat mata 20-20-20', description: 'Istirahatkan mata 20 detik tiap 20 menit.', pointReward: 5, missionType: 'eye_break_202020', isCompleted: false, completedAt: null },
  { id: 'm4', title: 'Isi AI Screening Mata', description: 'Selesaikan AI screening jika ada keluhan.', pointReward: 15, missionType: 'ai_screening_completed', isCompleted: false, completedAt: null },
  { id: 'm5', title: 'Cek jadwal pemeriksaan', description: 'Pastikan jadwal pemeriksaan Anda terbaru.', pointReward: 5, missionType: 'schedule_checked', isCompleted: false, completedAt: null },
];

export const useGamificationStore = create<Store>((set, get) => ({
  user: { userId: 'patient-001', totalPoints: 120, currentStreak: 2, longestStreak: 5, lastCheckInDate: null, level: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  badges: [
    { id: 'b1', name: 'Mata Sehat Starter', description: 'Berhasil check-in pertama.', icon: '🏅', requirementType: 'check_in_count', requirementValue: 1, isUnlocked: false, unlockedAt: null },
    { id: 'b2', name: '7 Day Eye Care', description: 'Jaga streak check-in selama 7 hari.', icon: '🔥', requirementType: 'streak', requirementValue: 7, isUnlocked: false, unlockedAt: null },
    { id: 'b3', name: 'AI Screening Hero', description: 'Menyelesaikan AI Screening 3 kali.', icon: '🏆', requirementType: 'activity_count', requirementValue: 3, isUnlocked: false, unlockedAt: null },
    { id: 'b4', name: 'Rajin Kontrol', description: 'Booking pemeriksaan sebanyak 3 kali.', icon: '🎖️', requirementType: 'activity_count', requirementValue: 3, isUnlocked: false, unlockedAt: null },
    { id: 'b5', name: 'Prime Care Member', description: 'Kumpulkan total 500 poin.', icon: '🥇', requirementType: 'total_points', requirementValue: 500, isUnlocked: false, unlockedAt: null },
  ],
  rewards: [
    { id: 'r1', title: 'Voucher pemeriksaan Rp10.000', description: 'Potongan biaya pemeriksaan mata.', pointsRequired: 150, rewardType: 'voucher', value: 'Rp 10.000', isAvailable: true },
    { id: 'r2', title: 'Voucher marketplace 5%', description: 'Diskon produk marketplace.', pointsRequired: 180, rewardType: 'voucher', value: '5%', isAvailable: true },
    { id: 'r3', title: 'Gratis konsultasi online', description: 'Konsultasi singkat dengan tenaga medis.', pointsRequired: 250, rewardType: 'consultation', value: '1 sesi', isAvailable: true },
    { id: 'r4', title: 'Prioritas antrean', description: 'Layanan antrean prioritas satu kali.', pointsRequired: 300, rewardType: 'queue_priority', value: '1 kali', isAvailable: true },
  ],
  transactions: [], counts: { daily_check_in: 0, read_eye_tips: 0, ai_screening_completed: 0, booking_created: 0, clinic_exam_completed: 0, marketplace_purchase: 0, reward_redeemed: 0, eye_break_202020: 0, schedule_checked: 0 },
  dailyMissions: initialMissions(), error: null,
  checkInDaily: (userId) => {
    const state = get();
    if (state.user.userId !== userId) return { success: false, message: 'User tidak ditemukan.' };
    if (state.user.lastCheckInDate === today()) return { success: false, message: 'Anda sudah check-in hari ini. Kembali lagi besok untuk menjaga streak Anda.' };
    const streak = state.calculateStreak(userId);
    set((s) => ({ user: { ...s.user, currentStreak: streak, longestStreak: Math.max(streak, s.user.longestStreak), lastCheckInDate: today() } }));
    state.addPoints(userId, 'daily_check_in', 10);
    state.unlockBadgeIfEligible(userId);
    return { success: true, message: 'Check-in berhasil! Mata sehat, semangat terjaga ✨' };
  },
  addPoints: (userId, activityType, points) => {
    const value = points ?? POINT_RULES[activityType]; if (value < 0) return;
    set((s) => ({
      user: { ...s.user, totalPoints: s.user.totalPoints + value, level: Math.floor((s.user.totalPoints + value) / 100) + 1, updatedAt: new Date().toISOString() },
      counts: { ...s.counts, [activityType]: s.counts[activityType] + 1 },
      transactions: [{ id: crypto.randomUUID(), userId, activityType, points: value, description: `Aktivitas ${activityType}`, createdAt: new Date().toISOString() }, ...s.transactions],
    }));
  },
  calculateStreak: () => {
    const { user } = get();
    if (!user.lastCheckInDate) return 1;
    if (isYesterday(user.lastCheckInDate)) return user.currentStreak + 1;
    return 1;
  },
  completeMission: (userId, missionId) => {
    const mission = get().dailyMissions.find((m) => m.id === missionId);
    if (!mission) return { success: false, message: 'Misi tidak ditemukan.' };
    if (mission.isCompleted) return { success: false, message: 'Misi ini sudah selesai.' };
    set((s) => ({ dailyMissions: s.dailyMissions.map((m) => (m.id === missionId ? { ...m, isCompleted: true, completedAt: new Date().toISOString() } : m)) }));
    get().addPoints(userId, mission.missionType, mission.pointReward);
    get().unlockBadgeIfEligible(userId);
    return { success: true, message: 'Misi selesai. Poin berhasil ditambahkan.' };
  },
  unlockBadgeIfEligible: () => {
    const state = get();
    set({ badges: state.badges.map((b) => {
      if (b.isUnlocked) return b;
      const unlock =
        (b.id === 'b1' && state.counts.daily_check_in >= b.requirementValue) ||
        (b.id === 'b2' && state.user.currentStreak >= b.requirementValue) ||
        (b.id === 'b3' && state.counts.ai_screening_completed >= b.requirementValue) ||
        (b.id === 'b4' && state.counts.booking_created >= b.requirementValue) ||
        (b.id === 'b5' && state.user.totalPoints >= b.requirementValue);
      return unlock ? { ...b, isUnlocked: true, unlockedAt: new Date().toISOString() } : b;
    }) });
  },
  redeemReward: (userId, rewardId) => {
    const state = get();
    const reward = state.rewards.find((r) => r.id === rewardId && r.isAvailable);
    if (!reward) return { success: false, message: 'Reward tidak tersedia.' };
    if (state.user.totalPoints < reward.pointsRequired) return { success: false, message: 'Poin belum cukup untuk menukar reward ini.' };
    set((s) => ({ user: { ...s.user, totalPoints: s.user.totalPoints - reward.pointsRequired }, transactions: [{ id: crypto.randomUUID(), userId, activityType: 'reward_redeemed', points: -reward.pointsRequired, description: `Tukar reward: ${reward.title}`, createdAt: new Date().toISOString() }, ...s.transactions] }));
    return { success: true, message: 'Reward berhasil ditukar.' };
  },
  getUserGamificationSummary: () => get().user,
  getDailyMissions: () => {
    const list = get().dailyMissions;
    if (list.some((m) => m.completedAt && !m.completedAt.startsWith(today()))) set({ dailyMissions: initialMissions() });
    return get().dailyMissions;
  },
  getAvailableRewards: () => get().rewards.filter((r) => r.isAvailable),
}));
