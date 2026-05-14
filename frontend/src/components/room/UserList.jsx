import { getAvatarColor } from '../../utils/format.js';
import useRoomStore from '../../store/roomStore.js';

const UserList = ({ users }) => {
  const hostSocketId = useRoomStore((s) => s.hostSocketId);

  return (
    <div className="p-4 border-b border-white/[0.08]">
      <p className="text-xs font-display font-semibold text-white/40 uppercase tracking-widest mb-3">
        Viewers — {users.length}
      </p>
      <div className="flex flex-wrap gap-2">
        {users.map((u) => (
          <div key={u.socketId} className="flex items-center gap-1.5 bg-surface-700/50 rounded-full px-2.5 py-1">
            <div className={`avatar w-6 h-6 text-xs ${getAvatarColor(u.nickname)}`}>
              {u.nickname[0].toUpperCase()}
            </div>
            <span className="text-sm text-white/80">{u.nickname}</span>
            {u.socketId === hostSocketId && (
              <span className="text-xs text-brand-400">👑</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
