import React from 'react';
import { X, Mail, AtSign, Calendar, MessageSquare, Shield } from 'lucide-react';

function UserProfileModal({ user, onClose, isOnline }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Banner / Close */}
        <div className="relative h-32 bg-gradient-to-br from-iosBlue to-blue-600">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 rounded-full text-white backdrop-blur-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-8 -mt-16 flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100">
              {user.profile_pic ? (
                <img src={user.profile_pic} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400 font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {isOnline && (
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
            )}
          </div>

          <h2 className="mt-4 text-2xl font-bold text-black">{user.name}</h2>
          <p className="text-iosBlue font-medium">@{user.username || 'user'}</p>
          
          <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isOnline ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
            {isOnline ? 'Active Now' : 'Offline'}
          </div>

          {/* Details List */}
          <div className="w-full mt-8 space-y-4 text-left">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-iosBlue">
                <AtSign size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Username</p>
                <p className="text-sm font-semibold text-gray-700">@{user.username || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Email Address</p>
                <p className="text-sm font-semibold text-gray-700">{user.email || 'Not available'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Member Since</p>
                <p className="text-sm font-semibold text-gray-700">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Jan 2024'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={onClose}
            className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-colors active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfileModal;
