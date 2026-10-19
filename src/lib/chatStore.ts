import { createClient } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isAdmin?: boolean;
  isGold?: boolean;
}

const SUPABASE_URL = 'https://dgfwwhvgsejhtvnrttcb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_VFGLgpMPJtf64LCHo7MNaQ_MgPnqWz2';

export const supabaseChatClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

const CHAT_STORAGE_KEY = 'noir_live_chat_messages';
const BANNED_STORAGE_KEY = 'noir_banned_handles';

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 'm-1', sender: 'NoirOfficial', text: '🏆 Welcome to the NOIR STAN AWARDS 2026 Live Ceremony! Premiere starts at 5:30 PM IST.', timestamp: '5:00 PM', isAdmin: true, isGold: true },
  { id: 'm-2', sender: 'StanTimeline', text: 'SO HYPED FOR THIS REVEAL!! 🔥👑', timestamp: '5:01 PM', isGold: true },
  { id: 'm-3', sender: 'PopCultureHub', text: '12 categories, record-breaking votes. Who takes home 1st place? ✨', timestamp: '5:02 PM' },
];

export function getBannedHandles(): string[] {
  try {
    const raw = localStorage.getItem(BANNED_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function banHandle(handle: string) {
  const clean = handle.replace(/^@/, '').trim().toLowerCase();
  if (!clean) return;
  const list = getBannedHandles();
  if (!list.includes(clean)) {
    list.push(clean);
    localStorage.setItem(BANNED_STORAGE_KEY, JSON.stringify(list));
    const msgs = getChatMessages().filter((m) => m.sender.toLowerCase() !== clean);
    saveChatMessages(msgs);
    window.dispatchEvent(new CustomEvent('noir_chat_updated'));

    // Broadcast ban over Supabase Realtime
    chatChannel?.send({
      type: 'broadcast',
      event: 'ban-user',
      payload: { handle: clean },
    });
  }
}

export function unbanHandle(handle: string) {
  const clean = handle.replace(/^@/, '').trim().toLowerCase();
  const list = getBannedHandles().filter((h) => h !== clean);
  localStorage.setItem(BANNED_STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('noir_chat_updated'));
}

export function getChatMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) {
      const parsed: ChatMessage[] = JSON.parse(raw);
      const banned = getBannedHandles();
      return parsed.filter((m) => !banned.includes(m.sender.toLowerCase()));
    }
  } catch {}
  return INITIAL_MESSAGES;
}

export function saveChatMessages(messages: ChatMessage[]) {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    window.dispatchEvent(new CustomEvent('noir_chat_updated', { detail: messages }));
  } catch {}
}

export function addChatMessage(sender: string, text: string, isAdmin = false): ChatMessage | null {
  const cleanSender = sender.replace(/^@/, '').trim() || 'Stan';
  const banned = getBannedHandles();
  if (banned.includes(cleanSender.toLowerCase())) {
    return null;
  }

  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    sender: cleanSender,
    text: text.trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isAdmin,
    isGold: isAdmin,
  };

  const current = getChatMessages();
  const updated = [...current.slice(-60), newMsg];
  saveChatMessages(updated);

  // Broadcast over Supabase Realtime WebSockets to all viewers globally
  chatChannel?.send({
    type: 'broadcast',
    event: 'new-message',
    payload: newMsg,
  });

  return newMsg;
}

export function deleteChatMessage(id: string) {
  const current = getChatMessages();
  const updated = current.filter((m) => m.id !== id);
  saveChatMessages(updated);

  chatChannel?.send({
    type: 'broadcast',
    event: 'delete-message',
    payload: { id },
  });
}

export function clearAllChatMessages() {
  saveChatMessages([]);

  chatChannel?.send({
    type: 'broadcast',
    event: 'clear-chat',
    payload: {},
  });
}

export function broadcastEmojiReaction(emoji: string) {
  chatChannel?.send({
    type: 'broadcast',
    event: 'emoji-reaction',
    payload: { emoji },
  });
}

// Global Supabase Realtime Channel
export const chatChannel = typeof window !== 'undefined'
  ? supabaseChatClient.channel('noir-ceremony-live')
  : null;

if (chatChannel) {
  chatChannel
    .on('broadcast', { event: 'new-message' }, ({ payload }) => {
      if (!payload || !payload.id) return;
      const banned = getBannedHandles();
      if (banned.includes(payload.sender?.toLowerCase())) return;

      const current = getChatMessages();
      if (!current.some((m) => m.id === payload.id)) {
        saveChatMessages([...current.slice(-60), payload]);
      }
    })
    .on('broadcast', { event: 'delete-message' }, ({ payload }) => {
      if (!payload || !payload.id) return;
      const current = getChatMessages();
      saveChatMessages(current.filter((m) => m.id !== payload.id));
    })
    .on('broadcast', { event: 'clear-chat' }, () => {
      saveChatMessages([]);
    })
    .on('broadcast', { event: 'ban-user' }, ({ payload }) => {
      if (!payload?.handle) return;
      const clean = payload.handle.toLowerCase();
      const banned = getBannedHandles();
      if (!banned.includes(clean)) {
        banned.push(clean);
        localStorage.setItem(BANNED_STORAGE_KEY, JSON.stringify(banned));
        const msgs = getChatMessages().filter((m) => m.sender.toLowerCase() !== clean);
        saveChatMessages(msgs);
        window.dispatchEvent(new CustomEvent('noir_chat_updated'));
      }
    })
    .on('broadcast', { event: 'emoji-reaction' }, ({ payload }) => {
      if (payload?.emoji) {
        window.dispatchEvent(new CustomEvent('remote_emoji_reaction', { detail: payload.emoji }));
      }
    })
    .subscribe((status) => {
      console.log('Supabase Live Chat Connected:', status);
    });
}
