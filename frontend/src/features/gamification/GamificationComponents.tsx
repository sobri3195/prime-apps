import {
  Award,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  Coins,
  Crown,
  Flame,
  Gift,
  LockKeyhole,
  Medal,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useGamificationStore } from './gamificationStore';
import type { Badge } from './types';

const todayKey = () => new Date().toISOString().slice(0, 10);

const missionActionLabels: Record<string, string> = {
  daily_check_in: 'Check-in',
  read_eye_tips: 'Baca Tips',
  eye_break_202020: 'Mulai 20-20-20',
  ai_screening_completed: 'Isi Screening',
  schedule_checked: 'Cek Jadwal',
};

const badgeIcons: Record<Badge['icon'], typeof Medal> = {
  medal: Medal,
  flame: Flame,
  trophy: Trophy,
  calendar: CalendarCheck2,
  crown: Crown,
};

function formatDate(date: string | null) {
  if (!date) {
    return null;
  }

  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function DailyWinsCard() {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'warning'; message: string } | null>(null);
  const { checkInDaily, completeMission, getDailyMissions, getUserGamificationSummary } = useGamificationStore();
  const user = getUserGamificationSummary('patient-001');
  const missions = getDailyMissions(user.userId);
  const completedMissionCount = missions.filter((mission) => mission.isCompleted).length;
  const checkInDone = user.lastCheckInDate === todayKey();

  const showFeedback = (result: { success: boolean; message: string }) => {
    setFeedback({ type: result.success ? 'success' : 'warning', message: result.message });
    window.setTimeout(() => setFeedback(null), 2600);
  };

  return (
    <article className="overflow-hidden rounded-[20px] border border-prime-gold/20 bg-white shadow-lg shadow-prime-gold/10">
      <div className="bg-gradient-to-br from-prime-gold via-[#c8aa44] to-prime-cream p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
              <Sparkles size={13} /> Daily Wins
            </p>
            <h2 className="mt-3 text-lg font-semibold">Rawat mata, kumpulkan poin sehat.</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/90">
              Check-in harian dan selesaikan misi ringan untuk menjaga rutinitas kesehatan mata Anda.
            </p>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <Trophy size={22} />
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white/15 p-2.5 backdrop-blur">
            <p className="text-[11px] text-white/90">Status</p>
            <p className="mt-1 text-xs font-semibold">{checkInDone ? 'Sudah check-in hari ini' : 'Belum check-in hari ini'}</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-2.5 backdrop-blur">
            <p className="text-[11px] text-white/90">Streak</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold">
              <Flame size={13} /> {user.currentStreak} hari
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 p-2.5 backdrop-blur">
            <p className="text-[11px] text-white/90">Poin</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold">
              <Coins size={13} /> {user.totalPoints}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <button
          type="button"
          onClick={() => showFeedback(checkInDaily(user.userId))}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-md transition duration-200 ${
            checkInDone
              ? 'bg-slate-100 text-slate-500 shadow-slate-100'
              : 'bg-prime-gold text-white shadow-prime-gold/20 hover:-translate-y-0.5 hover:bg-[#9e8629] active:scale-[0.98]'
          }`}
        >
          <CheckCircle2 size={16} />
          {checkInDone ? 'Check-in selesai hari ini' : 'Check-in Harian +10 poin'}
        </button>

        {feedback && (
          <div
            className={`rounded-2xl px-3 py-2 text-xs font-medium ${
              feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Misi Hari Ini</h3>
            <p className="text-xs text-slate-500">{completedMissionCount} dari {missions.length} misi selesai</p>
          </div>
          <span className="rounded-full bg-prime-cream/70 px-3 py-1 text-xs font-semibold text-prime-gold">Reset harian</span>
        </div>

        <div className="space-y-2">
          {missions.map((mission) => (
            <div key={mission.id} className="rounded-2xl border border-prime-gold/15 bg-prime-cream/35 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{mission.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{mission.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-prime-gold">
                  +{mission.pointReward}
                </span>
              </div>
              <button
                type="button"
                disabled={mission.isCompleted}
                onClick={() => showFeedback(completeMission(user.userId, mission.id))}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-prime-gold shadow-sm transition hover:bg-prime-cream/50 disabled:cursor-not-allowed disabled:text-emerald-700 disabled:opacity-80"
              >
                {mission.isCompleted ? <CheckCircle2 size={14} /> : <ChevronRight size={14} />}
                {mission.isCompleted ? 'Completed' : missionActionLabels[mission.missionType]}
              </button>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export function PointsStreakCard() {
  const user = useGamificationStore((state) => state.getUserGamificationSummary('patient-001'));

  return (
    <article className="rounded-[20px] bg-white p-4 shadow-md shadow-slate-200/70">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-prime-gold">Prime Daily Wins</p>
          <h2 className="mt-1 text-base font-semibold text-slate-900">Progress kesehatan mata</h2>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-prime-cream/60 text-prime-gold">
          <Award size={18} />
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-prime-cream/60 p-3">
          <p className="text-xs text-slate-500">Total Poin</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xl font-semibold text-prime-gold">
            <Coins size={17} /> {user.totalPoints}
          </p>
        </div>
        <div className="rounded-2xl bg-orange-50 p-3">
          <p className="text-xs text-slate-500">Streak Harian</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xl font-semibold text-amber-600">
            <Flame size={17} /> {user.currentStreak} hari
          </p>
        </div>
      </div>
      <p className="mt-3 inline-flex items-center gap-1 text-xs text-slate-500">
        <CheckCircle2 size={14} className="text-emerald-600" /> Level {user.level} • Longest streak {user.longestStreak} hari
      </p>
    </article>
  );
}

export function BadgeSection() {
  const badges = useGamificationStore((state) => state.badges);

  return (
    <section className="rounded-[20px] bg-white p-4 shadow-md shadow-slate-200/70">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Medal size={17} className="text-prime-gold" />
          <h2 className="text-base font-semibold text-slate-900">Badge Achievement</h2>
        </div>
        <span className="rounded-full bg-prime-cream/60 px-2.5 py-1 text-xs font-semibold text-prime-gold">
          {badges.filter((badge) => badge.isUnlocked).length}/{badges.length}
        </span>
      </div>

      <div className="mt-3 space-y-2.5">
        {badges.map((badge) => {
          const Icon = badgeIcons[badge.icon] ?? Medal;

          return (
            <article
              key={badge.id}
              className={`rounded-2xl border p-3 transition ${
                badge.isUnlocked ? 'border-prime-gold/30 bg-prime-cream/60/60' : 'border-slate-100 bg-slate-50/80'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                    badge.isUnlocked ? 'bg-white text-prime-gold shadow-sm' : 'bg-white text-slate-400'
                  }`}
                >
                  {badge.isUnlocked ? <Icon size={18} /> : <LockKeyhole size={16} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{badge.name}</p>
                    <span className={`text-[11px] font-semibold ${badge.isUnlocked ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {badge.isUnlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{badge.description}</p>
                  <p className="mt-1 text-[11px] text-prime-gold">
                    {badge.isUnlocked ? `Didapat ${formatDate(badge.unlockedAt)}` : `Target: ${badge.requirementValue}`}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function RewardSection() {
  const [message, setMessage] = useState<string | null>(null);
  const { getAvailableRewards, redeemReward, user } = useGamificationStore();
  const rewards = getAvailableRewards(user.userId);
  const nextReward = useMemo(
    () => rewards.find((reward) => user.totalPoints < reward.pointsRequired) ?? rewards[rewards.length - 1],
    [rewards, user.totalPoints],
  );
  const progress = nextReward ? Math.min(100, Math.round((user.totalPoints / nextReward.pointsRequired) * 100)) : 100;

  const handleRedeem = (rewardId: string) => {
    const result = redeemReward(user.userId, rewardId);
    setMessage(result.message);
    window.setTimeout(() => setMessage(null), 3000);
  };

  return (
    <section className="rounded-[20px] border border-prime-gold/20 bg-white p-4 shadow-md shadow-prime-gold/10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Gift size={17} className="text-prime-gold" />
          <h3 className="text-base font-semibold text-slate-900">Reward & Voucher</h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
          <Coins size={13} /> {user.totalPoints}
        </span>
      </div>

      {nextReward && (
        <div className="mt-3 rounded-2xl bg-slate-50 p-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Progress ke reward berikutnya</span>
            <span className="font-semibold text-prime-gold">{progress}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-gradient-to-r from-prime-gold to-[#d7bd64] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs font-medium text-slate-700">{nextReward.title}</p>
        </div>
      )}

      {message && <p className="mt-3 rounded-2xl bg-prime-cream/60 px-3 py-2 text-xs font-semibold text-prime-gold">{message}</p>}

      <div className="mt-3 space-y-2.5">
        {rewards.map((reward) => {
          const enoughPoints = user.totalPoints >= reward.pointsRequired;

          return (
            <article key={reward.id} className="rounded-2xl border border-prime-gold/20 bg-prime-cream/60/40 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{reward.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{reward.description}</p>
                  <p className="mt-1 text-xs font-semibold text-prime-gold">Butuh {reward.pointsRequired} poin • Nilai {reward.value}</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-prime-gold shadow-sm">
                  <Gift size={16} />
                </span>
              </div>
              <button
                type="button"
                disabled={!enoughPoints}
                onClick={() => handleRedeem(reward.id)}
                className="mt-3 rounded-xl bg-prime-gold px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-prime-gold/20 transition hover:bg-[#9e8629] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
              >
                {enoughPoints ? 'Tukar Poin' : 'Poin belum cukup'}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
