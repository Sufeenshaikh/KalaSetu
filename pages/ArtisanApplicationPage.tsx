import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import { useAuth } from '../context/AuthContext';
import { updateArtisan } from '../services/firestoreService';
import { analyzeArtisanApplicationVoice } from '../services/geminiService';

const MicrophoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 6v4m0 0H9m4 0h2m-4-8a4 4 0 014-4h.01" />
    </svg>
);

// Array of questions for the voice modal
const voiceQuestions = [
    { key: 'fullName', prompt: 'Speak your full name.' },
    { key: 'craftType', prompt: 'What is your type of craft?' },
    { key: 'aboutCraft', prompt: 'Now, tell us a little about yourself and your craft.' },
    { key: 'region', prompt: 'What is your region?' },
];

const ArtisanApplicationPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [fullName, setFullName] = useState('');
    const [craftType, setCraftType] = useState('');
    const [aboutCraft, setAboutCraft] = useState('');
    const [region, setRegion] = useState('');
    
    // Region suggestions state
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    
    // Voice Modal State
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [voiceStep, setVoiceStep] = useState(0); // 0: idle, 1-4: questions, 5: finished
    const [isRecording, setIsRecording] = useState(false);
    const [hasRecorded, setHasRecorded] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [voiceData, setVoiceData] = useState<Record<string, string>>({});
    const recognitionRef = useRef<any>(null);
    const isSpeechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

    const allRegions = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Kashmir'
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleOpenVoiceModal = () => {
        if (!isSpeechRecognitionSupported) {
            alert('Voice input is not supported in your browser. Please use Chrome or Edge.');
            return;
        }
        setVoiceStep(1); // Start with the first question
        setIsRecording(false);
        setHasRecorded(false);
        setTranscript('');
        setVoiceData({});
        setShowVoiceModal(true);
    };

    const handleCloseVoiceModal = () => {
        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
        }
        setShowVoiceModal(false);
        setVoiceStep(0);
        setTranscript('');
        setIsRecording(false);
        setHasRecorded(false);
    };

    const handleStartRecording = () => {
        if (!isSpeechRecognitionSupported) {
            alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
            return;
        }

        // Stop any existing recognition
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }

        setTranscript('');
        setIsRecording(true);
        setHasRecorded(false);
        
        try {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                const speechResult = event.results[0][0].transcript;
                setTranscript(speechResult);
                
                // Store the transcript for the current question
                const currentQuestion = voiceQuestions[voiceStep - 1];
                if (currentQuestion) {
                    setVoiceData(prev => ({
                        ...prev,
                        [currentQuestion.key]: speechResult
                    }));
                }
                
                setIsRecording(false);
                setHasRecorded(true);
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsRecording(false);
                setHasRecorded(false);
                if (event.error === 'no-speech') {
                    setTranscript('No speech detected. Please try again.');
                } else {
                    setTranscript('Error: Could not process voice input. Please try again.');
                }
            };

            recognition.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (error) {
            console.error('Error starting recognition:', error);
            setIsRecording(false);
            setTranscript('Error starting voice recognition. Please try again.');
        }
    };
    
    const handleNextQuestion = async () => {
        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
        }

        if (voiceStep < voiceQuestions.length) {
            setVoiceStep(voiceStep + 1);
            setHasRecorded(false);
            setTranscript('');
        } else {
            // Finish step - process all voice data
            try {
                // Combine all voice transcripts into one context
                const fullTranscript = Object.entries(voiceData)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n');

                // Use AI to extract structured data from the transcript
                const processedData = await analyzeArtisanApplicationVoice(fullTranscript);
                
                // Populate form with processed data
                setFullName(processedData.fullName || voiceData.fullName || '');
                setCraftType(processedData.craftType || voiceData.craftType || '');
                setRegion(processedData.region || voiceData.region || '');
                setAboutCraft(processedData.story || voiceData.aboutCraft || processedData.bio || '');
                
                handleCloseVoiceModal();
            } catch (error) {
                console.error('Error processing voice data:', error);
                // Fallback to using raw voice data if AI processing fails
                setFullName(voiceData.fullName || '');
                setCraftType(voiceData.craftType || '');
                setRegion(voiceData.region || '');
                setAboutCraft(voiceData.aboutCraft || '');
                handleCloseVoiceModal();
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert("You must be logged in to submit an application.");
            return;
        }
        setIsLoading(true);
        try {
            await updateArtisan(user.uid, { 
                name: fullName, 
                region, 
                bio: `Specialist in ${craftType} from ${region}.`, 
                story: aboutCraft
            });
            console.log("Artisan application details saved for:", user.uid);
            navigate('/profile');
        } catch (error) {
            console.error("Failed to submit application:", error);
            alert("There was an error submitting your application. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setRegion(value);
        if (value) {
            const filteredSuggestions = allRegions.filter(r =>
                r.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions(allRegions);
        }
        setShowSuggestions(true);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setRegion(suggestion);
        setShowSuggestions(false);
    };

    return (
        <>
            <div className="container mx-auto px-6 py-12 flex items-center justify-center">
                <div className="max-w-2xl w-full">
                    <BackButton />
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-heading font-bold text-secondary">Join Our Artisan Community</h1>
                        <p className="text-text-secondary mt-2">Tell us about yourself. Fill the form manually or use your voice.</p>
                        <Button onClick={handleOpenVoiceModal} variant="secondary" className="mt-4 inline-flex items-center gap-2">
                            <MicrophoneIcon />
                            Fill with Voice
                        </Button>
                    </div>
                    <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-lg shadow-lg space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-text-primary">Full Name</label>
                            <input type="text" id="name" required className="mt-1 block w-full border border-gray-600 bg-secondary text-white placeholder-gray-400 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="craft_type" className="block text-sm font-medium text-text-primary">Type of Craft</label>
                            <input type="text" id="craft_type" placeholder="e.g., Pottery, Block Printing, etc." required className="mt-1 block w-full border border-gray-600 bg-secondary text-white placeholder-gray-400 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" value={craftType} onChange={(e) => setCraftType(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="about_craft" className="block text-sm font-medium text-text-primary">About Yourself and Your Craft</label>
                            <textarea 
                                id="about_craft" 
                                placeholder="Share a little about your journey, your passion, and what makes your craft special." 
                                required 
                                rows={5} 
                                className="mt-1 block w-full border border-gray-600 bg-secondary text-white placeholder-gray-400 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" 
                                value={aboutCraft} 
                                onChange={(e) => setAboutCraft(e.target.value)} 
                            />
                        </div>
                        <div>
                            <label htmlFor="region" className="block text-sm font-medium text-text-primary">Your Region</label>
                            <div className="relative" ref={suggestionsRef}>
                                <input type="text" id="region" placeholder="e.g., Rajasthan, West Bengal, etc." required className="mt-1 block w-full border border-gray-600 bg-secondary text-white placeholder-gray-400 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" value={region} onChange={handleRegionChange} onFocus={() => { setSuggestions(allRegions); setShowSuggestions(true); }} autoComplete="off" />
                                {showSuggestions && (
                                    <ul className="absolute z-10 w-full bg-secondary border border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                                        {suggestions.length > 0 ? (
                                            suggestions.map((suggestion, index) => (
                                                <li key={index} className="px-3 py-2 cursor-pointer text-white hover:bg-accent/20" onClick={() => handleSuggestionClick(suggestion)}>
                                                    {suggestion}
                                                </li>
                                            ))
                                        ) : ( <li className="px-3 py-2 text-gray-300">No regions found.</li> )}
                                    </ul>
                                )}
                            </div>
                        </div>
                        
                        <div className="text-center pt-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Submitting...' : 'Submit Application'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Voice Input Modal */}
            {showVoiceModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="voice-modal-title">
                    <div className="bg-surface rounded-lg shadow-xl w-full max-w-lg p-6 relative flex flex-col min-h-[350px]">
                        <div className="flex-grow">
                            <h3 id="voice-modal-title" className="text-2xl font-heading font-bold text-secondary mb-4">
                                Question {voiceStep} of {voiceQuestions.length}
                            </h3>
                            
                            {voiceStep <= voiceQuestions.length && (
                                <>
                                    <p className="text-text-secondary mb-6 text-lg">{voiceQuestions[voiceStep - 1].prompt}</p>
                                    <div className="text-center my-6">
                                        <button onClick={handleStartRecording} disabled={isRecording || hasRecorded} className={`relative rounded-full p-6 transition-all duration-300 ${isRecording ? 'bg-red-500 text-white' : 'bg-primary text-white'} ${hasRecorded ? 'bg-emerald-green cursor-not-allowed' : 'hover:bg-opacity-90'}`}>
                                            <MicrophoneIcon />
                                            {isRecording && <div className="absolute inset-0 rounded-full bg-red-400 animate-ping -z-10"></div>}
                                        </button>
                                        <p className="text-text-secondary mt-4 h-6">
                                            {isRecording ? 'Recording... Speak now' : (hasRecorded ? 'Recording complete!' : 'Tap to record')}
                                        </p>
                                        {transcript && (
                                            <div className="mt-4 p-4 bg-secondary rounded-lg">
                                                <p className="text-text-primary text-sm font-medium mb-1">What I heard:</p>
                                                <p className="text-text-secondary italic">{transcript}</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <div className="mt-6 flex justify-end space-x-4 border-t pt-4">
                             <Button variant="outline" onClick={handleCloseVoiceModal}>Cancel</Button>
                             <Button onClick={handleNextQuestion} disabled={!hasRecorded}>
                                 {voiceStep < voiceQuestions.length ? 'Next Question' : 'Finish & Apply'}
                             </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ArtisanApplicationPage;