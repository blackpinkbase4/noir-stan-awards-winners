import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Flame, Sparkles, X, Heart, Trophy, Crown, ShieldAlert } from 'lucide-react';
import { getChatMessages, addChatMessage, broadcastEmojiReaction, ChatMessage } from '../lib/chatStore';

interface FloatingReaction {
  id: number;
  emoji: string;
  left: number;
  speed: number;
}

interface LiveChatReactionsProps {
  currentCategoryTitle?: string;
  isBroadcasting?: boolean;
}

export const LiveChatReactions: React.FC<LiveChatReactionsProps> = ({ currentCategoryTitle, isBroadcasting }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => getChatMessages());
  const [inputText, setInputText] = useState('');
  const [username, setUsername] = useState(() => localStorage.getItem('stan_chat_name') || '');
  const [isOpen, setIsOpen] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync messages in real-time across tabs and local events
  useEffect(() => {
    const handleUpdate = () => {
      setMessages(getChatMessages());
    };

    const handleRemoteReaction = (e: any) => {
      if (e.detail) {
        triggerReaction(e.detail, false);
      }
    };

    window.addEventListener('noir_chat_updated', handleUpdate);
    window.addEventListener('remote_emoji_reaction', handleRemoteReaction);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('noir_chat_updated', handleUpdate);
      window.removeEventListener('remote_emoji_reaction', handleRemoteReaction);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Spawn a floating reaction
  const triggerReaction = (emoji: string, broadcast = true) => {
    const newReaction: FloatingReaction = {
      id: Date.now() + Math.random(),
      emoji,
      left: 15 + Math.random() * 70,
      speed: 2 + Math.random() * 1.5,
    };

    setFloatingReactions((prev) => [...prev.slice(-25), newReaction]);

    if (broadcast) {
      broadcastEmojiReaction(emoji);
    }

    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 3500);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const senderName = username.trim() || `Stan_${Math.floor(1000 + Math.random() * 9000)}`;
    if (!username.trim()) {
      setUsername(senderName);
      localStorage.setItem('stan_chat_name', senderName);
    }

    const added = addChatMessage(senderName, inputText.trim(), false);
    if (added) {
      setMessages(getChatMessages());
    }
    setInputText('');

    // Trigger visual reaction
    if (inputText.includes('👑')) triggerReaction('👑');
    else if (inputText.includes('🏆')) triggerReaction('🏆');
    else if (inputText.includes('🔥')) triggerReaction('🔥');
    else triggerReaction('✨');
  };

  const quickPhrases = ['DESERVED!! 👑', 'OMG YESSSS 😭', 'CONGRATS!! 🏆', 'WE WON 🔥🔥'];

  return (
    <>
      {/* Floating Emojis Layer */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingReactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-16 text-3xl sm:text-4xl animate-float-up pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
            style={{
              left: `${r.left}%`,
              animationDuration: `${r.speed}s`,
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Floating Bottom Quick Reaction Bar */}
      <div className="fixed bottom-4 right-4 sm:right-6 z-40 flex items-center gap-2">
        {/* Quick Reaction Emojis */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-black/80 border border-amber-400/40 backdrop-blur-md shadow-2xl">
          <button
            onClick={() => triggerReaction('🏆')}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-amber-400/30 text-amber-300 text-lg flex items-center justify-center transition-transform active:scale-125"
            title="Send Trophy"
          >
            🏆
          </button>
          <button
            onClick={() => triggerReaction('👑')}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-amber-400/30 text-amber-300 text-lg flex items-center justify-center transition-transform active:scale-125"
            title="Send Crown"
          >
            👑
          </button>
          <button
            onClick={() => triggerReaction('🔥')}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-rose-500/30 text-rose-400 text-lg flex items-center justify-center transition-transform active:scale-125"
            title="Send Fire"
          >
            🔥
          </button>
          <button
            onClick={() => triggerReaction('😭')}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-sky-400/30 text-sky-400 text-lg flex items-center justify-center transition-transform active:scale-125"
            title="Crying / Happy"
          >
            😭
          </button>
          <button
            onClick={() => triggerReaction('❤️')}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-rose-500/30 text-rose-400 text-lg flex items-center justify-center transition-transform active:scale-125"
            title="Send Love"
          >
            ❤️
          </button>
        </div>

        {/* Live Chat Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative px-3.5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-heading font-black text-xs uppercase flex items-center gap-1.5 shadow-vma-gold transition-all active:scale-95"
        >
          <MessageSquare className="w-4 h-4 fill-current" />
          <span className="hidden sm:inline">Live Chat</span>
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping absolute -top-0.5 -right-0.5" />
        </button>
      </div>

      {/* Docked Live Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 max-h-[500px] flex flex-col rounded-3xl bg-black/90 border-2 border-amber-400/50 backdrop-blur-2xl shadow-2xl overflow-hidden animate-fade-in">
          {/* Chat Header */}
          <div className="p-3.5 border-b border-amber-400/25 bg-black/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h4 className="font-heading font-black text-sm text-white uppercase tracking-tight">
                Ceremony Live Chat
              </h4>
              <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-400/20 px-2 py-0.5 rounded-full">
                LIVE
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-chrome-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Category Banner */}
          {currentCategoryTitle && (
            <div className="px-3.5 py-1.5 bg-amber-400/10 border-b border-amber-400/20 text-[11px] font-mono text-amber-300 flex items-center justify-between">
              <span className="truncate">Now Announcing: <strong>{currentCategoryTitle}</strong></span>
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 min-h-[220px] max-h-[300px]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`text-xs font-mono p-2.5 rounded-xl transition-all ${
                  m.isAdmin
                    ? 'bg-gradient-to-r from-red-950/80 to-amber-950/80 border-2 border-amber-400 text-amber-100 shadow-lg'
                    : m.isGold
                    ? 'bg-amber-400/20 border border-amber-400/40 text-amber-200'
                    : 'bg-black/60 border border-white/10 text-chrome-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 truncate">
                    {m.isAdmin && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black font-heading font-black text-[9px] uppercase tracking-wider">
                        ADMIN
                      </span>
                    )}
                    <span className="font-bold text-amber-300 font-heading text-[13px] tracking-wide truncate">
                      @{m.sender}
                    </span>
                  </div>
                  <span className="text-[9px] text-chrome-400 font-mono">{m.timestamp}</span>
                </div>
                <p className="text-white text-[12px] break-words leading-relaxed">{m.text}</p>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Reaction Phrases */}
          <div className="px-3 py-1.5 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPhrases.map((phrase) => (
              <button
                key={phrase}
                type="button"
                onClick={() => setInputText(phrase)}
                className="px-2.5 py-1 rounded-full bg-black/70 hover:bg-amber-400/20 border border-amber-400/30 text-amber-200 text-[10px] font-mono shrink-0 active:scale-95 transition-all"
              >
                {phrase}
              </button>
            ))}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-amber-400/25 bg-black/90 flex gap-2">
            <input
              type="text"
              placeholder={username ? `Chat as @${username}...` : 'Type reaction or set handle...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={140}
              className="flex-1 px-3.5 py-2 rounded-xl bg-black/70 border border-amber-400/30 text-white placeholder-chrome-400 text-xs font-mono focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-heading font-black text-xs uppercase flex items-center justify-center transition-all disabled:opacity-40 active:scale-95"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
