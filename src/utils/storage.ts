import { CycleRecord, formatISODate, addDays } from './cycleMath';
import { supabase } from './supabaseClient';

const LOCAL_CYCLES_KEY = 'bloom_guest_cycles';
const LOCAL_LESSONS_KEY = 'bloom_guest_lessons';
const LOCAL_CONSENT_KEY = 'bloom_parental_consent';

export interface LessonProgressRecord {
  videoId: string;
  score: number;
  completedAt: string;
}

// Generate sensible default cycles for first-time learners so they see how the tracker works immediately
export function getDefaultSampleCycles(): CycleRecord[] {
  const today = new Date();
  return [
    {
      start: formatISODate(addDays(today, -66)),
      end: formatISODate(addDays(today, -62)),
      flow: 1,
      cramps: 1,
      mood: 2,
      symptoms: [0],
    },
    {
      start: formatISODate(addDays(today, -38)),
      end: formatISODate(addDays(today, -33)),
      flow: 1,
      cramps: 2,
      mood: 3,
      symptoms: [1],
    },
    {
      start: formatISODate(addDays(today, -10)),
      end: formatISODate(addDays(today, -6)),
      flow: 0,
      cramps: 1,
      mood: 0,
      symptoms: [],
    },
  ];
}

export const storage = {
  // Check if parental consent was accepted
  hasParentalConsent(): boolean {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(LOCAL_CONSENT_KEY) === 'true';
  },

  setParentalConsent(accepted: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_CONSENT_KEY, accepted ? 'true' : 'false');
  },

  // Load cycles (cloud if signed in, otherwise localStorage)
  async getCycles(): Promise<CycleRecord[]> {
    if (typeof window === 'undefined') return getDefaultSampleCycles();

    if (supabase) {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user) {
          const { data, error } = await supabase
            .from('cycles')
            .select('*')
            .order('start_date', { ascending: true });
          if (!error && data && data.length > 0) {
            return data.map((d) => ({
              id: d.id,
              start: d.start_date,
              end: d.end_date,
              flow: d.flow,
              cramps: d.cramps,
              mood: d.mood,
              symptoms: d.symptoms || [],
            }));
          }
        }
      } catch (e) {
        console.warn('Supabase fetch failed, using local storage:', e);
      }
    }

    const raw = localStorage.getItem(LOCAL_CYCLES_KEY);
    if (!raw) {
      const defaults = getDefaultSampleCycles();
      localStorage.setItem(LOCAL_CYCLES_KEY, JSON.stringify(defaults));
      return defaults;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return getDefaultSampleCycles();
    }
  },

  // Save new cycle
  async saveCycle(record: CycleRecord): Promise<void> {
    if (supabase) {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user) {
          await supabase.from('cycles').insert({
            user_id: session.session.user.id,
            start_date: record.start,
            end_date: record.end,
            flow: record.flow,
            cramps: record.cramps,
            mood: record.mood,
            symptoms: record.symptoms || [],
          });
        }
      } catch (e) {
        console.warn('Supabase save failed:', e);
      }
    }

    // Always mirror to local storage
    const current = await this.getCycles();
    current.push(record);
    localStorage.setItem(LOCAL_CYCLES_KEY, JSON.stringify(current));
  },

  // Load lesson progress
  async getLessonProgress(): Promise<Record<string, number>> {
    if (typeof window === 'undefined') return {};

    if (supabase) {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user) {
          const { data } = await supabase.from('lesson_progress').select('video_id, score');
          if (data) {
            const map: Record<string, number> = {};
            data.forEach((item) => {
              map[item.video_id] = item.score;
            });
            return map;
          }
        }
      } catch (e) {
        // fallback to local
      }
    }

    const raw = localStorage.getItem(LOCAL_LESSONS_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  },

  // Save lesson completion
  async completeLesson(videoId: string, score: number): Promise<void> {
    if (supabase) {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user) {
          await supabase.from('lesson_progress').upsert({
            user_id: session.session.user.id,
            video_id: videoId,
            score,
            completed_at: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.warn('Supabase upsert failed:', e);
      }
    }

    const current = await this.getLessonProgress();
    current[videoId] = score;
    localStorage.setItem(LOCAL_LESSONS_KEY, JSON.stringify(current));
  },

  // Complete Right to Erasure (DPDP Act 2023)
  async deleteAllData(): Promise<void> {
    if (supabase) {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user) {
          await supabase.rpc('delete_user_data');
          await supabase.auth.signOut();
        }
      } catch (e) {
        console.warn('Supabase cloud delete failed:', e);
      }
    }

    localStorage.removeItem(LOCAL_CYCLES_KEY);
    localStorage.removeItem(LOCAL_LESSONS_KEY);
    localStorage.removeItem(LOCAL_CONSENT_KEY);
  },
};
