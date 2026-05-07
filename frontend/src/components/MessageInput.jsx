import React, { useState, useRef } from 'react';
import { Plus, Camera, Send, Image, FileText } from 'lucide-react';

function MessageInput({ onSendMessage }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileInputRef = useRef(null);
  const allFileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;

    // Use FormData to send both text and the image file to our backend
    const formData = new FormData();
    if (text.trim()) formData.append('message', text);
    if (image) formData.append('image', image);

    onSendMessage(formData);

    // Clear the input fields after sending
    setText('');
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (allFileInputRef.current) allFileInputRef.current.value = '';
  };

  return (
    <div className="px-4 py-3 bg-[#F6F6F6] border-t border-gray-200/50 pb-safe z-10 relative flex-shrink-0">
      {/* Image Preview Box */}
      {image && (
        <div className="mb-2 relative inline-block">
          <img src={URL.createObjectURL(image)} alt="preview" className="h-20 rounded-[10px] shadow-sm border border-gray-200" />
          <button 
            type="button" 
            onClick={() => setImage(null)}
            className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-sm"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Attachment Menu */}
      {showAttachMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowAttachMenu(false)}></div>
          <div className="absolute bottom-16 left-4 bg-white/90 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl p-2 z-50 flex flex-col gap-1 min-w-[160px] animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button 
              type="button"
              onClick={() => { fileInputRef.current?.click(); setShowAttachMenu(false); }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-xl transition-colors text-black active:scale-95"
            >
              <div className="w-9 h-9 rounded-full bg-iosBlue/10 flex items-center justify-center text-iosBlue">
                <Image size={20} />
              </div>
              <span className="text-[17px]">Send Image</span>
            </button>
            <button 
              type="button"
              onClick={() => { allFileInputRef.current?.click(); setShowAttachMenu(false); }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-xl transition-colors text-black active:scale-95"
            >
              <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                <FileText size={20} />
              </div>
              <span className="text-[17px]">Send File</span>
            </button>
          </div>
        </>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <button 
          type="button" 
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          className={`p-1 mb-1.5 active:opacity-70 transition-all ${showAttachMenu ? 'text-iosBlue rotate-45' : 'text-iosGray'}`}
        >
          <Plus size={26} />
        </button>
        
        <div className="flex-1 bg-white border border-[#E5E5EA] rounded-[20px] flex items-center px-4 py-1.5 min-h-[40px] shadow-sm">
          <input
            type="text"
            placeholder="iMessage"
            className="flex-1 bg-transparent outline-none text-[17px] text-black pt-0.5"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="text-iosGray ml-2 active:opacity-70 transition-opacity"
          >
            <Camera size={24} />
          </button>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={(e) => setImage(e.target.files[0])}
          />
          <input 
            type="file" 
            className="hidden" 
            ref={allFileInputRef}
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        {/* Send Button is only blue and visible if there's text or image */}
        {(text.trim() || image) ? (
          <button type="submit" className="bg-iosBlue text-white rounded-full w-8 h-8 flex items-center justify-center mb-1.5 flex-shrink-0 shadow-sm active:opacity-80 transition-opacity">
            <Send size={16} className="ml-0.5" />
          </button>
        ) : (
          <div className="w-8 h-8 mb-1.5 flex-shrink-0"></div>
        )}
      </form>
    </div>
  );
}

export default MessageInput;
