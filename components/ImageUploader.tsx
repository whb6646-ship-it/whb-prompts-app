
import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageSelected: (url: string | null) => void;
  currentImage: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, currentImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so the same file can be selected again if removed
    e.target.value = '';
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelected(null);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto group">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`relative aspect-square rounded-[2rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] ${
          currentImage 
            ? 'border-indigo-500/30 ring-4 ring-indigo-500/5' 
            : 'border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/[0.02] cursor-pointer'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        
        {currentImage ? (
          <div className="w-full h-full relative group/img">
            <img 
              src={currentImage} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" 
              alt="Uploaded character reference"
            />
            {/* Overlay for Replace/Remove */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 backdrop-blur-[2px]">
              <div className="p-3 rounded-full bg-white/10 border border-white/20">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              </div>
              <p className="text-[10px] text-white font-bold uppercase tracking-[0.2em]">Replace Image</p>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 flex flex-col items-center">
            <div className="mb-6 relative">
               <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150 group-hover:bg-indigo-500/30 transition-all"></div>
               <div className="relative p-5 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:border-indigo-500/20 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-indigo-400 transition-colors"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
               </div>
            </div>
            <p className="text-gray-300 font-medium mb-1 tracking-tight">Drop character DNA</p>
            <p className="text-gray-600 text-[10px] uppercase tracking-widest font-bold">Or click to browse</p>
          </div>
        )}
      </div>

      {/* Persistent Remove Button when image is present */}
      {currentImage && (
        <button
          onClick={handleRemove}
          className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-black border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all flex items-center justify-center z-10 shadow-2xl backdrop-blur-md"
          title="Remove Image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      )}
    </div>
  );
};

export default ImageUploader;
