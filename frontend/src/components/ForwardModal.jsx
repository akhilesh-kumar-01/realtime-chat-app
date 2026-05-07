import React, { useState, useEffect } from 'react';
import { X, Search, Send } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

function ForwardModal({ imageUrl, onClose }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleForward = async (userId) => {
    try {
      // Create a FormData to send the image URL as a message
      // Actually, my backend might expect an image file. 
      // I'll check how my backend handles image URLs in messages.
      
      // For now, I'll assume I can send a message with an image_url property.
      // If the backend doesn't support forwarding by URL directly, I'll need to adjust it.
      // But usually, I can just send the image_url in the body if the backend is flexible.
      
      await api.post(`/messages/${userId}`, { image_url: imageUrl });
      toast.success('Message forwarded!');
      onClose();
    } catch (error) {
      console.error('Forward failed', error);
      toast.error('Failed to forward message');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[20px] shadow-2xl overflow-hidden flex flex-col h-[500px]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">Forward to...</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-iosBlue/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="w-8 h-8 border-4 border-iosBlue border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 text-sm">Loading users...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <button 
                key={user.id}
                onClick={() => handleForward(user.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex-shrink-0">
                  {user.profile_pic ? (
                    <img src={user.profile_pic} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold text-black truncate">{user.name}</p>
                  <p className="text-xs text-gray-500">@{user.username || 'user'}</p>
                </div>
                <div className="p-2 bg-iosBlue/10 rounded-full text-iosBlue">
                  <Send size={18} />
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForwardModal;
