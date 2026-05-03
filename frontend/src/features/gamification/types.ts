export type ActivityType =
  | 'daily_check_in'
  | 'read_eye_tips'
  | 'ai_screening_completed'
  | 'booking_created'
  | 'clinic_exam_completed'
  | 'marketplace_purchase'
  | 'reward_redeemed'
  | 'eye_break_202020'
  | 'schedule_checked';

export interface UserGamification {
  userId: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  pointReward: number;
  missionType: ActivityType;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirementType: 'check_in_count' | 'streak' | 'activity_count' | 'total_points';
  requirementValue: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  rewardType: 'voucher' | 'consultation' | 'queue_priority';
  value: string;
  isAvailable: boolean;
}

export interface PointTransaction {
  id: string;
  userId: string;
  activityType: ActivityType;
  points: number;
  description: string;
  createdAt: string;
}
