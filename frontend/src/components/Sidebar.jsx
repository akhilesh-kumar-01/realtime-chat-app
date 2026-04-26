import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar({ selectedUser, setSelectedUser }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const { onlineUsers } = useSocket();
  const { authUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-white">
      {/* iOS Large Header */}
      <div className="px-4 pt-8 pb-2 flex justify-between items-center">
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
      <div className="flex-1 overflow-y-auto mt-2">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user.id);
          const isSelected = selectedUser?.id === user.id;

          return (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center px-4 py-[10px] cursor-pointer transition-colors ${
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
                <div className={`font-semibold text-[17px] truncate ${isSelected ? 'text-white' : 'text-black'}`}>
                  {user.name}
                </div>
                <div className={`text-[15px] truncate mt-0.5 ${isSelected ? 'text-white/80' : 'text-iosGray'}`}>
                  {isOnline ? 'Online now' : 'Tap to chat'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Sidebar;
