import React from 'react';
import { VoxelButton } from './VoxelButton';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function VoxelModal({ isOpen, onClose, title, children }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative bg-[#1a1a2e] border-4 border-[#4cc9f0] shadow-[8px_8px_0_0_#4361ee] max-w-2xl w-full flex flex-col"
        style={{
          imageRendering: 'pixelated'
        }}
      >
        {/* Title Bar */}
        <div className="bg-[#4cc9f0] px-4 py-2 flex items-center justify-between">
          <h2 className="text-white font-bold uppercase tracking-widest text-lg drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-red-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {children}
        </div>

        {/* Footer */}
        <div className="border-t-4 border-[#4361ee] p-4 flex justify-end">
          <VoxelButton variant="secondary" onClick={onClose}>
            Close
          </VoxelButton>
        </div>
      </div>
    </div>
  );
}
