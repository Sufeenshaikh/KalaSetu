import React, { useState, useRef } from 'react';
import Button from './Button';

interface VoiceSearchProps {
  onSearch: (query: string) => void;
}

const MicrophoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 6v4m0 0H9m4 0h2m-4-8a4 4 0 014-4h.01" />
    </svg>
);

// Check for vendor-prefixed SpeechRecognition API
// FIX: Cast window to `any` to access non-standard properties on the window object.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

const VoiceSearch: React.FC<VoiceSearchProps> = ({ onSearch }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showModal, setShowModal] = useState(false);
  // FIX: Use `any` for the ref type because the `SpeechRecognition` variable shadows the global type
  // and its own type is inferred as `any` from the window object.
  const recognitionRef = useRef<any | null>(null);

  const startListening = () => {
    setTranscript('');
    setShowModal(true);

    if (!isSpeechRecognitionSupported) {
      console.error("Speech recognition not supported in this browser.");
      setTranscript("Sorry, voice search isn't supported on your browser.");
      return;
    }

    // Clean up any previous recognition instance
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Set language to Indian English
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        setTranscript("Didn't catch that. Please try again.");
      } else {
        setTranscript("Sorry, something went wrong with voice search.");
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };
  
  const handleSearch = () => {
      if (transcript && isSpeechRecognitionSupported) {
          onSearch(transcript);
      }
      setShowModal(false);
  }
  
  const handleCancel = () => {
      if (recognitionRef.current) {
          recognitionRef.current.stop();
      }
      setShowModal(false);
      setTranscript('');
      setIsListening(false);
  }

  return (
    <>
      <Button
        onClick={startListening}
        variant="secondary"
        className="flex items-center space-x-2"
        aria-label="Search with voice"
      >
        <MicrophoneIcon />
        <span>Voice Search</span>
      </Button>
      
      {showModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="voice-search-title">
              <div className="bg-surface rounded-lg shadow-xl w-full max-w-lg p-6 relative">
                  <h3 id="voice-search-title" className="text-2xl font-heading font-bold text-secondary mb-4">Voice Search</h3>
                  <div className="min-h-[100px] bg-background/50 p-4 rounded-md border border-accent/50 flex items-center justify-center">
                      {isListening ? (
                          <p className="text-text-secondary animate-pulse">Listening...</p>
                      ) : (
                          <p className="text-text-primary text-lg">{transcript || 'Please speak now...'}</p>
                      )}
                  </div>
                  <div className="mt-6 flex justify-end space-x-4">
                       <Button variant="outline" onClick={handleCancel}>
                           Cancel
                       </Button>
                       <Button onClick={handleSearch} disabled={!transcript || isListening}>
                           Apply Search
                       </Button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default VoiceSearch;