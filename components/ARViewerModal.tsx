import React, { useEffect } from 'react';

// Note: Type definitions for the custom <model-viewer> element have been moved to a central types.ts file.

interface ARViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelUrl: string;
  productTitle: string;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ARViewerModal: React.FC<ARViewerModalProps> = ({ isOpen, onClose, modelUrl, productTitle }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ar-viewer-title"
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        model-viewer {
            --progress-bar-color: #D95F43;
            --progress-bar-height: 4px;
        }
      `}</style>
      <div
        className="bg-surface rounded-lg shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col relative animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 pointer-events-none">
            <h2 id="ar-viewer-title" className="text-lg font-bold text-white bg-black/40 px-3 py-1 rounded-full">
              {productTitle}
            </h2>
             <button
              onClick={onClose}
              className="text-white bg-black/40 rounded-full p-2 hover:bg-primary transition-colors pointer-events-auto"
              aria-label="Close 3D Viewer"
            >
              <CloseIcon />
            </button>
        </header>
        <model-viewer
          src={modelUrl}
          alt={`A 3D model of ${productTitle}`}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          shadow-intensity="1"
          style={{ width: '100%', height: '100%', borderRadius: '8px' }}
        >
        </model-viewer>
      </div>
    </div>
  );
};

export default ARViewerModal;
