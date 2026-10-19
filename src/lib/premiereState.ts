import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dgfwwhvgsejhtvnrttcb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_VFGLgpMPJtf64LCHo7MNaQ_MgPnqWz2';

export const supabaseStateClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

// Shared Ceremony & Premiere State Manager with multi-tab sync
export interface CeremonyState {
  mode: 'countdown' | 'live' | 'ended';
  countdownTarget: string; // ISO string for 5:30 PM IST (e.g. 2026-10-19T17:30:00+05:30)
  currentCategoryIndex: number;
  unlockFullResults: boolean; // Admin toggle: if false, show only "Premiere Ended"; if true, show full winners & cards
}

const STORAGE_KEY = 'noir_ceremony_state';
export const DEFAULT_530_PM_IST = '2026-10-19T17:30:00+05:30';

export async function fetchRemoteCeremonyState(): Promise<CeremonyState | null> {
  try {
    const { data, error } = await supabaseStateClient
      .from('event_settings')
      .select('reveal_date_display, winners_published')
      .eq('id', 'noir_2026_settings')
      .single();

    if (!error && data) {
      let mode: 'countdown' | 'live' | 'ended' = 'ended';
      if (
        data.reveal_date_display === 'countdown' ||
        data.reveal_date_display === 'live' ||
        data.reveal_date_display === 'ended'
      ) {
        mode = data.reveal_date_display;
      }
      const remoteState: CeremonyState = {
        mode,
        countdownTarget: DEFAULT_530_PM_IST,
        currentCategoryIndex: 0,
        unlockFullResults: !!data.winners_published,
      };
      saveCeremonyState(remoteState, false);
      return remoteState;
    }
  } catch {}
  return null;
}

export async function pushRemoteCeremonyState(state: CeremonyState): Promise<void> {
  try {
    await supabaseStateClient
      .from('event_settings')
      .update({
        reveal_date_display: state.mode,
        winners_published: state.unlockFullResults,
      })
      .eq('id', 'noir_2026_settings');
  } catch {}
}

export function getCeremonyState(): CeremonyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.mode) {
        return {
          mode: parsed.mode,
          countdownTarget: parsed.countdownTarget || DEFAULT_530_PM_IST,
          currentCategoryIndex: parsed.currentCategoryIndex || 0,
          unlockFullResults: !!parsed.unlockFullResults,
        };
      }
    }
  } catch {}

  return {
    mode: 'ended',
    countdownTarget: DEFAULT_530_PM_IST,
    currentCategoryIndex: 0,
    unlockFullResults: true,
  };
}

export function saveCeremonyState(state: CeremonyState, shouldBroadcast = true) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('ceremony_state_changed', { detail: state }));
    if (shouldBroadcast && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('broadcast_ceremony_state_req', { detail: state }));
      pushRemoteCeremonyState(state);
    }
  } catch {}
}

export function setCeremonyMode(mode: 'countdown' | 'live' | 'ended') {
  const current = getCeremonyState();
  saveCeremonyState({ ...current, mode });
}

export function setUnlockFullResults(unlocked: boolean) {
  const current = getCeremonyState();
  saveCeremonyState({ ...current, unlockFullResults: unlocked });
}
