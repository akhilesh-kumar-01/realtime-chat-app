import React from 'react';
import { X, Download, Share2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

function ImageModal({ imageUrl, onClose, onForward }) {
  if (!imageUrl) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chat_image_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Downloading started...');
    } catch (error) {
      console.error('Download failed', error);
      toast.error('Failed to download image');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm transition-all animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white z-10">
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95"
        >
          <X size={28} />
        </button>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors active:scale-95"
          >
            <Download size={20} />
            <span className="hidden sm:inline">Download</span>
          </button>
          
          <button 
            onClick={() => onForward(imageUrl)}
            className="flex items-center gap-2 px-4 py-2 bg-iosBlue text-white rounded-full transition-colors active:scale-95"
          >
            <ArrowRight size={20} />
            <span>Forward</span>
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden" onClick={onClose}>
        <img 
          src={imageUrl} 
          alt="Full screen" 
          className="max-w-full max-h-full object-contain shadow-2xl rounded-lg animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      
      {/* Footer / Caption area if needed */}
      <div className="p-6 text-center text-white/50 text-sm">
        Click anywhere to close
      </div>
    </div>
  );
}

export default ImageModal;
