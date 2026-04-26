import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

function Profile() {
  const { authUser, setAuthUser, logout } = useAuth();
  const [name, setName] = useState(authUser?.name || '');
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(authUser?.profile_pic || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('name', name);
      if (profilePic) {
        formData.append('profilePic', profilePic);
      }

      // We hit the backend route we created in step 1.10
      const res = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setAuthUser(res.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-iosLightGray flex flex-col">
      {/* iOS Navigation Bar */}
      <div className="h-[60px] flex items-center justify-between px-4 bg-white border-b border-gray-200/50 sticky top-0 z-10">
        <Link to="/" className="flex items-center text-iosBlue w-20 active:opacity-70 transition-opacity">
          <ChevronLeft size={28} className="-ml-2" />
          <span className="text-[17px] -ml-1">Chats</span>
        </Link>
        <h1 className="font-semibold text-black text-[17px]">Profile</h1>
        <button onClick={handleSave} disabled={isLoading} className="text-iosBlue text-[17px] w-20 text-right font-semibold active:opacity-70 transition-opacity">
          {isLoading ? 'Saving...' : 'Edit'}
        </button>
      </div>

      <div className="px-4 py-8 flex flex-col items-center flex-1">
        {/* Profile Picture Section */}
        <div className="relative w-28 h-28 mb-4">
          <div className="w-full h-full rounded-full bg-gray-300 overflow-hidden shadow-sm border border-gray-200">
            {preview ? (
              <img src={preview} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl font-semibold text-white">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 w-9 h-9 bg-iosBlue rounded-full border-[3px] border-iosLightGray flex items-center justify-center cursor-pointer active:opacity-80 transition-opacity shadow-sm">
            <Camera size={18} className="text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>
        <h2 className="text-[28px] font-bold text-black tracking-tight mt-2">{authUser?.name}</h2>
        <p className="text-iosGray text-[16px]">{authUser?.email}</p>

        {/* Grouped iOS Settings Menu */}
        <div className="w-full max-w-md mt-10">
          <div className="bg-white rounded-[12px] overflow-hidden shadow-sm border border-gray-200/50">
            <div className="flex items-center px-4 py-[14px] border-b border-gray-200/50">
              <span className="w-1/3 text-[17px] text-black">Full Name</span>
              <input
                type="text"
                className="w-2/3 bg-transparent outline-none text-[17px] text-iosGray text-right"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex items-center px-4 py-[14px]">
              <span className="w-1/3 text-[17px] text-black">Email</span>
              <span className="w-2/3 text-[17px] text-iosGray text-right overflow-hidden text-ellipsis">{authUser?.email}</span>
            </div>
          </div>

          <div className="bg-white rounded-[12px] overflow-hidden shadow-sm border border-gray-200/50 mt-8">
            <button onClick={logout} className="w-full px-4 py-[14px] text-center text-[17px] text-red-500 font-semibold active:bg-gray-50 transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
