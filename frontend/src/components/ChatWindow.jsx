import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, Video, Phone, MoreVertical } from 'lucide-react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import MessageInput from './MessageInput';
import toast from 'react-hot-toast';
import ImageModal from './ImageModal';
import ForwardModal from './ForwardModal';
import UserProfileModal from './UserProfileModal';

function ChatWindow({ selectedUser, setSelectedUser }) {
  const [messages, setMessages] = useState([]);
  const { socket, onlineUsers } = useSocket();
  const { authUser } = useAuth();
  const messagesEndRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  
  // Image related states
  const [activeImageUrl, setActiveImageUrl] = useState(null);
  const [forwardingImageUrl, setForwardingImageUrl] = useState(null);
  
  // Profile related state
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Helper to format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper to get date label
  const getDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

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
      setMessages((prev) => [...prev, res.data]);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm("Are you sure you want to clear all messages?")) return;
    try {
      await api.delete(`/messages/${selectedUser.id}`);
      setMessages([]);
      setShowDropdown(false);
    } catch (error) {
      console.error("Failed to clear chat", error);
    }
  };

  const handleToggleRelationship = async (action) => {
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
    <div className="flex-1 flex flex-col h-full bg-white relative min-w-0 overflow-hidden">
      {/* Modals */}
      {showProfileModal && (
        <UserProfileModal 
          user={selectedUser} 
          isOnline={isOnline}
          onClose={() => setShowProfileModal(false)} 
        />
      )}

      {activeImageUrl && (
        <ImageModal 
          imageUrl={activeImageUrl} 
          onClose={() => setActiveImageUrl(null)} 
          onForward={(url) => {
            setActiveImageUrl(null);
            setForwardingImageUrl(url);
          }}
        />
      )}
      
      {forwardingImageUrl && (
        <ForwardModal 
          imageUrl={forwardingImageUrl} 
          onClose={() => setForwardingImageUrl(null)} 
        />
      )}

      {/* iOS Navigation Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200/50 z-30">
        <div className="h-safe-top"></div>
        <div className="h-[60px] flex items-center justify-between px-4">
          <div className="flex items-center overflow-hidden">
            <button 
              onClick={() => setSelectedUser(null)} 
              className="flex items-center text-iosBlue mr-2 active:opacity-50 md:hidden"
            >
              <ChevronLeft size={32} className="-ml-2" />
              <span className="text-[17px] -ml-1 font-medium">Chats</span>
            </button>
            
            <div 
              className="flex items-center ml-1 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
              onClick={() => setShowProfileModal(true)}
            >
              <div className="w-9 h-9 rounded-full bg-gray-200 mr-2 overflow-hidden flex-shrink-0 border border-gray-100">
                 {selectedUser.profile_pic ? (
                   <img src={selectedUser.profile_pic} alt="avatar" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 font-semibold">{selectedUser.name.charAt(0).toUpperCase()}</div>
                 )}
              </div>
              <div className="flex flex-col justify-center overflow-hidden">
                <span className="font-bold text-black text-[16px] leading-tight truncate max-w-[100px] sm:max-w-[200px]">{selectedUser.name}</span>
                <span className={`text-[12px] leading-tight font-medium ${isOnline ? 'text-green-500' : 'text-iosGray'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-iosBlue relative flex-shrink-0">
            <button onClick={() => toast("Video calling coming soon! \u{1F3A5}")} className="active:opacity-50">
              <Video size={24} />
            </button>
            <button onClick={() => toast("Voice calling coming soon! \u{1F4DE}")} className="active:opacity-50">
              <Phone size={24} />
            </button>
            <button onClick={() => setShowDropdown(!showDropdown)} className="active:opacity-50">
              <MoreVertical size={24} />
            </button>
            
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                <div className="absolute top-10 right-0 w-48 bg-white border border-gray-200/50 shadow-lg rounded-[14px] overflow-hidden z-50">
                  <button onClick={() => setShowProfileModal(true)} className="w-full text-left px-4 py-3 text-[17px] text-black border-b border-gray-200 hover:bg-gray-50 active:bg-gray-100">
                    View Info
                  </button>
                  <button onClick={() => handleToggleRelationship(isMuted ? 'unmute' : 'mute')} className="w-full text-left px-4 py-3 text-[17px] text-black border-b border-gray-200 hover:bg-gray-50 active:bg-gray-100">
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                  <button onClick={handleClearChat} className="w-full text-left px-4 py-3 text-[17px] text-black border-b border-gray-200 hover:bg-gray-50 active:bg-gray-100">
                    Clear Chat
                  </button>
                  <button onClick={() => handleToggleRelationship(isBlocked ? 'unblock' : 'block')} className="w-full text-left px-4 py-3 text-[17px] text-red-500 hover:bg-gray-50 active:bg-gray-100">
                    {isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-10 py-4 space-y-4 no-scrollbar bg-white">
        {messages.map((msg, index) => {
          const isMe = msg.sender_id === authUser.id;
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const msgDate = msg.created_at || msg.createdAt;
          const prevMsgDate = prevMsg ? (prevMsg.created_at || prevMsg.createdAt) : null;
          const showDateSeparator = !prevMsg || (msgDate && prevMsgDate && new Date(msgDate).toDateString() !== new Date(prevMsgDate).toDateString());

          return (
            <React.Fragment key={msg.id || index}>
              {showDateSeparator && (
                <div className="flex justify-center my-4">
                  <span className="bg-[#E5E5EA] text-iosGray text-[12px] px-3 py-1 rounded-full font-medium">
                    {getDateLabel(msgDate)}
                  </span>
                </div>
              )}
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
                  {!isMe && (
                    <div 
                      className="w-7 h-7 rounded-full bg-gray-200 mr-2 flex-shrink-0 self-end overflow-hidden mb-1 cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => setShowProfileModal(true)}
                    >
                       {selectedUser.profile_pic ? (
                         <img src={selectedUser.profile_pic} alt="avatar" className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-semibold">{selectedUser.name.charAt(0).toUpperCase()}</div>
                       )}
                    </div>
                  )}
                  
                  <div className={`max-w-[75%] rounded-[18px] flex flex-col break-words overflow-hidden ${
                    isMe 
                    ? 'bg-iosBlue text-white rounded-br-sm shadow-md' 
                    : 'bg-[#E9E9EB] text-black rounded-bl-sm shadow-sm'
                  } ${msg.image_url ? 'p-[3px]' : 'px-4 py-2.5'}`}>
                    {msg.image_url && (
                      <div 
                        className="relative group cursor-pointer overflow-hidden rounded-[14px]"
                        onClick={() => setActiveImageUrl(msg.image_url)}
                      >
                        <img 
                          src={msg.image_url} 
                          alt="image" 
                          className="max-w-full max-h-[250px] object-cover transition-transform duration-300 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                      </div>
                    )}
                    {msg.message && (
                      <p className={`text-[17px] leading-[22px] ${msg.image_url ? 'p-2' : ''}`}>{msg.message}</p>
                    )}
                  </div>
                </div>
                <span className={`text-[11px] text-iosGray mt-1 mx-2 ${isMe ? 'mr-2' : 'ml-9'}`}>
                  {formatTime(msg.created_at || msg.createdAt)}
                </span>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200/50">
        <MessageInput onSendMessage={handleSendMessage} />
        <div className="h-safe-bottom"></div>
      </div>
    </div>
  );
}

export default ChatWindow;
