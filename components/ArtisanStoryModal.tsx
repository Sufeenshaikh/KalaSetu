import React, { useEffect } from 'react';
import type { Artisan } from '../types';

interface ArtisanStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  artisan: Artisan | null;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ArtisanStoryModal: React.FC<ArtisanStoryModalProps> = ({ isOpen, onClose, artisan }) => {

  useEffect(() => {
    // Prevent scrolling on the body when the modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset body scroll
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !artisan) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="artisan-story-title"
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
      <div
        className="bg-background rounded-lg shadow-2xl w-full max-w-5xl h-auto max-h-[90vh] flex flex-col md:flex-row overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <img src={artisan.image} alt={artisan.name} className="w-full md:w-1/3 h-64 md:h-auto object-cover" />
        <div className="flex-1 flex flex-col">
            <header className="p-6 flex justify-between items-start">
              <div>
                <h2 id="artisan-story-title" className="text-3xl font-heading font-bold text-secondary">{artisan.name}</h2>
                <p className="text-md text-text-secondary">{artisan.region}</p>
              </div>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-primary transition-colors"
                aria-label="Close story modal"
              >
                <CloseIcon />
              </button>
            </header>
            <main className="px-6 pb-6 overflow-y-auto">
                <blockquote className="text-lg text-text-primary italic border-l-4 border-primary pl-4 mb-6">
                    "{artisan.bio}"
                </blockquote>
                <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                    {artisan.story}
                </p>
            </main>
        </div>
      </div>
    </div>
  );
};

export default ArtisanStoryModal;