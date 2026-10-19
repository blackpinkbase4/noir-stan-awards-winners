// Shared Ceremony & Premiere State Manager with multi-tab sync
export interface CeremonyState {
  mode: 'countdown' | 'live' | 'ended';
  countdownTarget: string; // ISO string for 5:30 PM IST (e.g. 2026-10-19T17:30:00+05:30)
  currentCategoryIndex: number;
  unlockFullResults: boolean; // Admin toggle: if false, show only "Premiere Ended"; if true, show full winners & cards
}

const STORAGE_KEY = 'noir_ceremony_state';
export const DEFAULT_530_PM_IST = '2026-10-19T17:30:00+05:30';

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
    mode: 'countdown',
    countdownTarget: DEFAULT_530_PM_IST,
    currentCategoryIndex: 0,
    unlockFullResults: false,
  };
}

export function saveCeremonyState(state: CeremonyState, shouldBroadcast = true) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('ceremony_state_changed', { detail: state }));
    if (shouldBroadcast && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('broadcast_ceremony_state_req', { detail: state }));
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
