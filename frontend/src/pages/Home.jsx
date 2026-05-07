import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { MessageCircle } from 'lucide-react';

function Home() {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="fixed inset-0 flex bg-white overflow-hidden">
      {/* Sidebar handles showing all users and the search bar */}
      <div className={`h-full w-full md:w-[350px] flex-shrink-0 border-r border-gray-200/50 ${selectedUser ? 'hidden md:block' : 'block'}`}>
        <Sidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
      </div>
      
      {/* Chat Window takes the rest of the space */}
      <div className={`flex-1 h-full min-w-0 ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
        {selectedUser ? (
          <ChatWindow selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white">
            <div className="w-20 h-20 bg-iosLightGray rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-iosGray" />
            </div>
            <h2 className="text-xl font-semibold text-iosGray">Select a chat to start messaging</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
