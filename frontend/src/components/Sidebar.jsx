import React, { useEffect, useState, useRef } from 'react';
import { Search, Trash2, Ban } from 'lucide-react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Sidebar({ selectedUser, setSelectedUser }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [contextMenu, setContextMenu] = useState(null); // { x, y, user }
  const [confirmDelete, setConfirmDelete] = useState(null); // userId
  const { onlineUsers } = useSocket();
  const { authUser } = useAuth();
  const longPressTimer = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get(`/users?search=${search}`);
        setUsers(res.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    const handleClose = () => {
      setContextMenu(null);
      setConfirmDelete(null);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('click', handleClose);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleContextMenu = (e, user) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, user });
  };

  const handleTouchStart = (user) => {
    longPressTimer.current = setTimeout(() => {
      // We don't have pageX/Y easily here, let's use a fixed center or last touch
      setContextMenu({ x: window.innerWidth / 2 - 80, y: window.innerHeight / 2, user });
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleDeleteConversation = async (userId) => {
    try {
      await api.delete(`/messages/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      if (selectedUser?.id === userId) setSelectedUser(null);
      toast.success("Conversation deleted");
      setContextMenu(null);
    } catch (error) {
      toast.error("Failed to delete conversation");
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await api.post(`/users/${userId}/relationship`, { action: 'block' });
      setUsers(users.filter(u => u.id !== userId));
      if (selectedUser?.id === userId) setSelectedUser(null);
      toast.success("User blocked successfully");
      setContextMenu(null);
    } catch (error) {
      toast.error("Failed to block user");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* iOS Large Header */}
      <div className="px-4 pt-12 pb-2 flex justify-between items-center bg-white sticky top-0 z-20">
        <h1 className="text-[34px] font-bold text-black tracking-tight">Chats</h1>
        <Link to="/profile" className="w-9 h-9 bg-iosLightGray rounded-full flex items-center justify-center overflow-hidden active:opacity-70 transition-opacity">
           {authUser?.profile_pic ? (
             <img src={authUser.profile_pic} alt="profile" className="w-full h-full object-cover" />
           ) : (
             <span className="font-semibold text-iosGray text-sm">{authUser?.name?.charAt(0).toUpperCase()}</span>
           )}
        </Link>
      </div>

      {/* iOS Search Bar */}
      <div className="px-4 py-2">
        <div className="bg-iosLightGray rounded-[10px] flex items-center px-2 py-1.5">
          <Search size={20} className="text-iosGray ml-1" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none w-full ml-2 text-[17px] text-black placeholder:text-iosGray"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto mt-2 no-scrollbar">
        {users.map((user) => {
          const isOnline = onlineUsers.includes(user.id);
          const isSelected = selectedUser?.id === user.id;

          return (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              onContextMenu={(e) => handleContextMenu(e, user)}
              onTouchStart={() => handleTouchStart(user)}
              onTouchEnd={handleTouchEnd}
              className={`flex items-center px-4 py-[10px] cursor-pointer transition-colors relative ${
                isSelected ? 'bg-iosBlue text-white' : 'hover:bg-iosLightGray text-black'
              }`}
            >
              <div className="relative w-14 h-14 rounded-full bg-gray-200 flex-shrink-0">
                {user.profile_pic ? (
                  <img src={user.profile_pic} alt="avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center rounded-full font-semibold text-xl ${isSelected ? 'text-iosBlue bg-white' : 'text-gray-500 bg-gray-200'}`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {isOnline && (
                  <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-[2.5px] rounded-full ${isSelected ? 'border-iosBlue' : 'border-white'}`}></div>
                )}
              </div>
              <div className={`ml-3 flex-1 overflow-hidden border-b pb-4 pt-2 border-gray-200/50 ${isSelected ? 'border-transparent' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className={`font-semibold text-[17px] truncate ${isSelected ? 'text-white' : 'text-black'}`}>
                    {user.name}
                  </div>
                </div>
                <div className={`text-[15px] truncate mt-0.5 ${isSelected ? 'text-white/80' : 'text-iosGray'}`}>
                  {isOnline ? 'Online now' : 'Tap to chat'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Context Menu Popup */}
      {contextMenu && (
        <div 
          className="fixed z-[100] bg-white/90 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl min-w-[220px] overflow-hidden p-1.5 animate-in fade-in zoom-in-95 duration-150"
          style={{ top: Math.min(contextMenu.y, window.innerHeight - 150), left: Math.min(contextMenu.x, window.innerWidth - 230) }}
          onClick={(e) => e.stopPropagation()}
        >
          {confirmDelete === contextMenu.user.id ? (
            <div className="p-3 text-center">
              <p className="text-[15px] font-medium text-black mb-3">Are you sure?</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2 bg-gray-100 rounded-lg text-black text-[15px] font-medium active:bg-gray-200"
                >
                  No
                </button>
                <button 
                  onClick={() => handleDeleteConversation(contextMenu.user.id)}
                  className="flex-1 py-2 bg-red-500 rounded-lg text-white text-[15px] font-medium active:bg-red-600"
                >
                  Yes
                </button>
              </div>
            </div>
          ) : (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(contextMenu.user.id); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors active:scale-95"
              >
                <Trash2 size={18} />
                <span className="text-[17px] font-medium">Delete Conversation</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleBlockUser(contextMenu.user.id); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors active:scale-95 border-t border-gray-100"
              >
                <Ban size={18} />
                <span className="text-[17px] font-medium">Block User</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
