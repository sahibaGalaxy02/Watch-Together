import { useState, useRef, useEffect } from 'react';
import useRoomStore from '../../store/roomStore.js';
import { getAvatarColor } from '../../utils/format.js';
import UserList from '../room/UserList.jsx';

const ChatSidebar = ({ onSendMessage }) => {
  const [input, setInput] = useState('');
  const messages = useRoomStore((s) => s.messages);
  const users = useRoomStore((s) => s.users);
  const socketId = useRoomStore((s) => s.socketId);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    onSendMessage(text);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col bg-surface-900 border-l border-white/[0.08]">
      <UserList users={users} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-white/30 text-sm text-center mt-8">No messages yet. Say hi! 👋</p>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.userId === socketId;
          return (
            <div key={i} className={`flex gap-2.5 animate-fade-in ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className={`avatar flex-shrink-0 ${getAvatarColor(msg.nickname)}`}>
                {msg.nickname[0].toUpperCase()}
              </div>
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {!isMe && (
                  <span className="text-xs font-medium text-white/50">{msg.nickname}</span>
                )}
                <div className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed
                  ${isMe
                    ? 'bg-brand-500 text-white rounded-tr-sm'
                    : 'bg-surface-700 text-white/90 rounded-tl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/[0.08]">
        <div className="flex gap-2">
          <input
            className="input-field flex-1 py-2.5 text-sm"
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={300}
          />
          <button type="submit"
            className="w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-600 flex items-center justify-center transition-colors flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatSidebar;
