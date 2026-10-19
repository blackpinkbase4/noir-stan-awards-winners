import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Radio,
  Clock,
  CheckCircle2,
  Trash2,
  Ban,
  Send,
  Eye,
  RefreshCw,
  Trophy,
  Lock,
  Unlock,
  AlertTriangle,
  X
} from 'lucide-react';
import {
  getCeremonyState,
  saveCeremonyState,
  setCeremonyMode,
  setUnlockFullResults,
  CeremonyState,
  DEFAULT_530_PM_IST
} from '../lib/premiereState';
import {
  getChatMessages,
  deleteChatMessage,
  clearAllChatMessages,
  addChatMessage,
  getBannedHandles,
  banHandle,
  unbanHandle,
  ChatMessage
} from '../lib/chatStore';
import { songPlayer } from '../lib/songPlayer';

export const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('noir_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Ceremony state
  const [ceremony, setCeremony] = useState<CeremonyState>(() => getCeremonyState());

  // Chat Moderation state
  const [messages, setMessages] = useState<ChatMessage[]>(() => getChatMessages());
  const [bannedHandles, setBannedHandles] = useState<string[]>(() => getBannedHandles());
  const [adminBroadcastText, setAdminBroadcastText] = useState('');

  // Sync state & ensure complete silence in Admin room
  useEffect(() => {
    songPlayer.pause();

    const handleCeremonyUpdate = () => setCeremony(getCeremonyState());
    const handleChatUpdate = () => {
      setMessages(getChatMessages());
      setBannedHandles(getBannedHandles());
    };

    window.addEventListener('ceremony_state_changed', handleCeremonyUpdate);
    window.addEventListener('noir_chat_updated', handleChatUpdate);
    window.addEventListener('storage', () => {
      handleCeremonyUpdate();
      handleChatUpdate();
    });

    return () => {
      window.removeEventListener('ceremony_state_changed', handleCeremonyUpdate);
      window.removeEventListener('noir_chat_updated', handleChatUpdate);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === 'swankv') {
      setIsAuthenticated(true);
      sessionStorage.setItem('noir_admin_auth', 'true');
      setPinError(false);
      window.dispatchEvent(new CustomEvent('broadcast_ceremony_state_req', { detail: getCeremonyState() }));
    } else {
      setPinError(true);
    }
  };

  // Keep all visitors worldwide synchronized to admin's current ceremony state
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      window.dispatchEvent(new CustomEvent('broadcast_ceremony_state_req', { detail: getCeremonyState() }));
    }, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleSetMode = (mode: 'countdown' | 'live' | 'ended') => {
    setCeremonyMode(mode);
    setCeremony(getCeremonyState());
  };

  const handleToggleUnlockResults = () => {
    const nextState = !ceremony.unlockFullResults;
    setUnlockFullResults(nextState);
    setCeremony(getCeremonyState());
  };

  const handleSendAdminBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminBroadcastText.trim()) return;
    addChatMessage('NoirAdmin', adminBroadcastText.trim(), true);
    setAdminBroadcastText('');
    setMessages(getChatMessages());
  };

  const handleDeleteMessage = (id: string) => {
    deleteChatMessage(id);
    setMessages(getChatMessages());
  };

  const handleBanUser = (handle: string) => {
    if (window.confirm(`Are you sure you want to ban @${handle} and remove all their messages?`)) {
      banHandle(handle);
      setMessages(getChatMessages());
      setBannedHandles(getBannedHandles());
    }
  };

  const handleUnbanUser = (handle: string) => {
    unbanHandle(handle);
    setBannedHandles(getBannedHandles());
  };

  const handleClearAllChat = () => {
    if (window.confirm('Delete ALL chat messages for all viewers? This cannot be undone.')) {
      clearAllChatMessages();
      setMessages([]);
    }
  };

  // PIN Authentication Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black text-white font-mono">
        <div className="w-full max-w-md p-8 rounded-3xl bg-zinc-950 border-2 border-amber-400/50 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-300">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-heading font-black uppercase text-white tracking-tight">
              Ceremony Admin Moderation
            </h2>
            <p className="text-xs text-chrome-400 font-mono">
              Enter admin passcode to access real-time premiere controls & chat moderation.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter admin passcode"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-black border border-amber-400/40 text-center text-white placeholder-chrome-500 font-mono text-sm focus:outline-none focus:border-amber-400"
              autoFocus
            />

            {pinError && (
              <p className="text-xs text-red-400 font-mono">Incorrect passcode. Try again.</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-heading font-black text-sm uppercase tracking-wider shadow-vma-gold transition-all active:scale-95"
            >
              Access Control Room
            </button>
          </form>

          <a
            href="/"
            className="text-xs text-amber-300 hover:underline block pt-2"
          >
            ← Return to Public Ceremony Stage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono p-4 sm:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Admin Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between border-b border-amber-400/30 pb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400 shadow-lg">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white tracking-tight">
                REAL-TIME ADMIN CONTROL ROOM
              </h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[10px] font-bold">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-chrome-400">
              Live Ceremony Mode Switching & Real-Time Chat Moderation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Open Public View (New Tab)</span>
          </a>
          <button
            onClick={() => {
              sessionStorage.removeItem('noir_admin_auth');
              setIsAuthenticated(false);
            }}
            className="px-4 py-2 rounded-full bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 font-mono text-xs uppercase"
          >
            Lock
          </button>
        </div>
      </header>

      {/* Grid of Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* =========================================================================
            SECTION 1: CEREMONY MODE & RESULTS ACCESS CONTROLS
            ========================================================================= */}
        <section className="p-6 rounded-3xl bg-zinc-950 border-2 border-amber-400/40 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-400" />
              <h2 className="font-heading font-black text-lg text-white uppercase">
                Ceremony Broadcast Mode
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-black border border-amber-400/50 text-amber-300 text-xs uppercase font-bold">
              Current: <strong>{ceremony.mode.toUpperCase()}</strong>
            </span>
          </div>

          {/* Quick Mode Buttons */}
          <div className="space-y-3">
            {/* Countdown Mode */}
            <button
              onClick={() => handleSetMode('countdown')}
              className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                ceremony.mode === 'countdown'
                  ? 'bg-amber-950/70 border-amber-400 shadow-vma-gold ring-1 ring-amber-400'
                  : 'bg-black/60 border-white/10 hover:border-amber-400/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="font-heading font-black text-base text-white uppercase">
                    1. Countdown to 5:30 PM IST
                  </h3>
                  <p className="text-xs text-chrome-400 font-mono">
                    Public sees grand countdown clock. Viewers can chat and react.
                  </p>
                </div>
              </div>
              {ceremony.mode === 'countdown' && (
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              )}
            </button>

            {/* Live Premiere Broadcast Mode */}
            <button
              onClick={() => handleSetMode('live')}
              className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                ceremony.mode === 'live'
                  ? 'bg-red-950/70 border-red-500 shadow-2xl ring-1 ring-red-400'
                  : 'bg-black/60 border-white/10 hover:border-red-400/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Radio className="w-6 h-6 text-red-500 animate-pulse" />
                <div>
                  <h3 className="font-heading font-black text-base text-white uppercase">
                    2. Start Live Premiere Now (Manual)
                  </h3>
                  <p className="text-xs text-chrome-400 font-mono">
                    Starts synchronized 10s reveals, sound sfx, and confetti across all viewers.
                  </p>
                </div>
              </div>
              {ceremony.mode === 'live' && (
                <CheckCircle2 className="w-5 h-5 text-red-400 shrink-0" />
              )}
            </button>

            {/* Event Ended Mode */}
            <button
              onClick={() => handleSetMode('ended')}
              className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                ceremony.mode === 'ended'
                  ? 'bg-zinc-800 border-white/40 ring-1 ring-white/40'
                  : 'bg-black/60 border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-chrome-300" />
                <div>
                  <h3 className="font-heading font-black text-base text-white uppercase">
                    3. Set to Premiere Ended
                  </h3>
                  <p className="text-xs text-chrome-400 font-mono">
                    Concludes the live broadcast. Displays result state according to toggle below.
                  </p>
                </div>
              </div>
              {ceremony.mode === 'ended' && (
                <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
              )}
            </button>
          </div>

          {/* =========================================================================
              TOGGLE: UNLOCK FULL WINNERS & VOTING CARDS (USER'S EXPLICIT REQUEST)
              ========================================================================= */}
          <div className="p-4 rounded-2xl bg-black/80 border-2 border-amber-400/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {ceremony.unlockFullResults ? (
                  <Unlock className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Lock className="w-5 h-5 text-amber-400" />
                )}
                <div>
                  <h3 className="font-heading font-black text-sm text-white uppercase">
                    Post-Premiere Full Results Access
                  </h3>
                  <p className="text-[11px] text-chrome-400">
                    Control whether viewers see all 12 winners & voting cards after premiere
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleUnlockResults}
                className={`px-4 py-2 rounded-full font-heading font-black text-xs uppercase transition-all shadow-md active:scale-95 ${
                  ceremony.unlockFullResults
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                    : 'bg-amber-500/30 hover:bg-amber-500/40 border border-amber-400 text-amber-300'
                }`}
              >
                {ceremony.unlockFullResults ? '✅ UNLOCKED (SHOW WINNERS)' : '🔒 LOCKED (ONLY SAY ENDED)'}
              </button>
            </div>

            <div className="text-xs font-mono p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-chrome-300">
              {ceremony.unlockFullResults ? (
                <p className="text-emerald-300">
                  ★ <strong>FULL ACCESS IS ON:</strong> Viewers can explore all 12 categories, podiums, voting breakdown percentages, and download their official 1080x1350 winner cards.
                </p>
              ) : (
                <p className="text-amber-200">
                  🔒 <strong>LOCKED:</strong> Viewers will only see "The Ceremony Premiere Has Concluded" without seeing full category cards until you turn this switch ON.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: REAL-TIME LIVE CHAT MODERATION
            ========================================================================= */}
        <section className="p-6 rounded-3xl bg-zinc-950 border-2 border-amber-400/40 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h2 className="font-heading font-black text-lg text-white uppercase">
                  Real-Time Live Chat Moderation
                </h2>
              </div>
              <button
                onClick={handleClearAllChat}
                className="px-3 py-1 rounded-full bg-red-950/70 hover:bg-red-900 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-1 transition-colors"
                title="Wipe entire chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Chat</span>
              </button>
            </div>

            {/* Broadcast Admin Message Form */}
            <form onSubmit={handleSendAdminBroadcast} className="space-y-2">
              <label className="text-xs font-mono text-amber-300 block font-bold">
                📢 Broadcast Pinned Admin Announcement:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Next category starts in 2 minutes! Keep it civil..."
                  value={adminBroadcastText}
                  onChange={(e) => setAdminBroadcastText(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-black border border-amber-400/40 text-white placeholder-chrome-500 text-xs font-mono focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={!adminBroadcastText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-heading font-black text-xs uppercase flex items-center gap-1.5 transition-all disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast</span>
                </button>
              </div>
            </form>

            {/* Banned Users Bar */}
            {bannedHandles.length > 0 && (
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs font-mono space-y-1">
                <span className="text-red-400 font-bold block">
                  🚫 Banned Handles ({bannedHandles.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {bannedHandles.map((handle) => (
                    <span
                      key={handle}
                      className="px-2 py-0.5 rounded-full bg-black/80 border border-red-400/60 text-red-300 flex items-center gap-1 text-[11px]"
                    >
                      @{handle}
                      <button
                        onClick={() => handleUnbanUser(handle)}
                        className="text-white hover:text-red-200"
                        title="Unban handle"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Live Chat Messages Moderation List */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-chrome-400 block">
                Live Chat Stream ({messages.length} messages) - click Delete or Ban to moderate instantly:
              </span>

              <div className="max-h-[340px] overflow-y-auto space-y-2 p-2 rounded-2xl bg-black/70 border border-white/10">
                {messages.length === 0 ? (
                  <div className="py-12 text-center text-chrome-500 text-xs font-mono">
                    Chat is currently empty.
                  </div>
                ) : (
                  messages
                    .slice()
                    .reverse()
                    .map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-between gap-3 text-xs font-mono hover:border-amber-400/40 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {m.isAdmin && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black font-black text-[9px]">
                                ADMIN
                              </span>
                            )}
                            <strong className="text-amber-300 font-heading text-xs">
                              @{m.sender}
                            </strong>
                            <span className="text-[10px] text-chrome-500">{m.timestamp}</span>
                          </div>
                          <p className="text-white text-xs mt-0.5 break-words">{m.text}</p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleDeleteMessage(m.id)}
                            className="p-1.5 rounded-lg bg-black/60 hover:bg-red-600/30 text-chrome-400 hover:text-red-300 border border-white/10 transition-colors"
                            title="Delete this message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {!m.isAdmin && (
                            <button
                              onClick={() => handleBanUser(m.sender)}
                              className="p-1.5 rounded-lg bg-black/60 hover:bg-red-600/30 text-chrome-400 hover:text-red-400 border border-white/10 transition-colors"
                              title={`Ban @${m.sender}`}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
