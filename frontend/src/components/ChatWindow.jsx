import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, Video, Phone, MoreVertical } from 'lucide-react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import MessageInput from './MessageInput';

function ChatWindow({ selectedUser, setSelectedUser }) {
  const [messages, setMessages] = useState([]);
  const { socket, onlineUsers } = useSocket();
  const { authUser } = useAuth();
  const messagesEndRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Can be initialized from API later
  const [isBlocked, setIsBlocked] = useState(false); // Can be initialized from API later

  // Fetch messages when selected user changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${selectedUser.id}`);
        setMessages(res.data);
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };
    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser]);

  // Listen for new incoming messages via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      // Only append if the message belongs to the current chat
      if (newMessage.sender_id === selectedUser.id || newMessage.receiver_id === selectedUser.id) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser]);

  // Auto-scroll to bottom smoothly when a new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (formData) => {
    try {
      const res = await api.post(`/messages/${selectedUser.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Add the message to our local screen immediately
      setMessages((prev) => [...prev, res.data]);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm("Are you sure you want to clear all messages? This will delete them for both users.")) return;
    try {
      await api.delete(`/messages/${selectedUser.id}`);
      setMessages([]);
      setShowDropdown(false);
    } catch (error) {
      console.error("Failed to clear chat", error);
    }
  };

  const handleToggleRelationship = async (action) => {
    // action: 'block', 'unblock', 'mute', 'unmute'
    if (action === 'block' && !window.confirm("Are you sure you want to block this user?")) return;
    try {
      await api.post(`/users/${selectedUser.id}/relationship`, { action });
      if (action === 'block') setIsBlocked(true);
      if (action === 'unblock') setIsBlocked(false);
      if (action === 'mute') setIsMuted(true);
      if (action === 'unmute') setIsMuted(false);
      setShowDropdown(false);
    } catch (error) {
      console.error(`Failed to ${action} user`, error);
    }
  };

  const isOnline = onlineUsers.includes(selectedUser.id);

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative w-full">
      {/* iOS Navigation Header */}
      <div className="h-[60px] flex items-center justify-between px-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center">
          <button onClick={() => setSelectedUser(null)} className="flex items-center text-iosBlue mr-4 md:hidden">
            <ChevronLeft size={28} className="-ml-2" />
            <span className="text-[17px] -ml-1">Chats</span>
          </button>
          
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 overflow-hidden flex-shrink-0">
               {selectedUser.profile_pic ? (
                 <img src={selectedUser.profile_pic} alt="avatar" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-semibold">{selectedUser.name.charAt(0).toUpperCase()}</div>
               )}
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-semibold text-black text-[15px] leading-tight">{selectedUser.name}</span>
              <span className={`text-[11px] leading-tight ${isOnline ? 'text-green-500' : 'text-iosGray'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-5 text-iosBlue relative">
          <Video size={24} />
          <Phone size={24} />
          <button onClick={() => setShowDropdown(!showDropdown)} className="active:opacity-50">
            <MoreVertical size={24} />
          </button>
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              {/* Invisible overlay to close dropdown when clicking outside */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowDropdown(false)}
              ></div>
              <div className="absolute top-10 right-0 w-48 bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-lg rounded-[14px] overflow-hidden z-50">
                <button 
                  onClick={() => handleToggleRelationship(isMuted ? 'unmute' : 'mute')}
                  className="w-full text-left px-4 py-3 text-[17px] text-black border-b border-gray-200/50 hover:bg-gray-100/50 active:bg-gray-200"
                >
                  {isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
                </button>
                <button 
                  onClick={handleClearChat}
                  className="w-full text-left px-4 py-3 text-[17px] text-black border-b border-gray-200/50 hover:bg-gray-100/50 active:bg-gray-200"
                >
                  Clear Chat
                </button>
                <button 
                  onClick={() => handleToggleRelationship(isBlocked ? 'unblock' : 'block')}
                  className="w-full text-left px-4 py-3 text-[17px] text-red-500 hover:bg-gray-100/50 active:bg-gray-200 font-medium"
                >
                  {isBlocked ? 'Unblock User' : 'Block User'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, index) => {
          const isMe = msg.sender_id === authUser.id;
          return (
            <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <div className="w-7 h-7 rounded-full bg-gray-200 mr-2 flex-shrink-0 self-end overflow-hidden mb-1">
                   {selectedUser.profile_pic ? (
                     <img src={selectedUser.profile_pic} alt="avatar" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-semibold">{selectedUser.name.charAt(0).toUpperCase()}</div>
                   )}
                </div>
              )}
              
              <div className={`max-w-[75%] px-4 py-2 text-[17px] leading-[22px] rounded-[18px] ${
                isMe 
                ? 'bg-iosBlue text-white rounded-br-sm' 
                : 'bg-[#E9E9EB] text-black rounded-bl-sm'
              }`}>
                {msg.image_url && (
                  <img src={msg.image_url} alt="attachment" className="rounded-[10px] mb-2 max-w-full" />
                )}
                {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}

export default ChatWindow;
