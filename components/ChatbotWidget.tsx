import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToChatStream } from '../services/geminiService';

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);


interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const ChatbotWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: 'Hello! I am the KalaSetu assistant. How can I help you today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = inputValue.trim();
        if (!trimmedInput) return;

        const userMessage: Message = { sender: 'user', text: trimmedInput };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        // Add a placeholder for the bot's streaming response
        setMessages(prev => [...prev, { sender: 'bot', text: '' }]);

        await sendMessageToChatStream(trimmedInput, (chunk) => {
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.sender === 'bot') {
                    const updatedMessage = { ...lastMessage, text: lastMessage.text + chunk };
                    return [...prev.slice(0, -1), updatedMessage];
                }
                // This case should ideally not be hit if logic is correct
                return [...prev, { sender: 'bot', text: chunk }];
            });
        });

        setIsLoading(false);
    };

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {/* Chat Window */}
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="w-80 h-96 sm:w-96 sm:h-[450px] bg-surface rounded-lg shadow-xl flex flex-col">
                    {/* Header */}
                    <div className="bg-secondary text-white p-4 rounded-t-lg flex justify-between items-center">
                        <h3 className="font-bold font-heading text-lg">KalaSetu Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="hover:opacity-75">
                            <CloseIcon />
                        </button>
                    </div>
                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto bg-background/50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`py-2 px-4 rounded-2xl max-w-[80%] ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white text-text-primary rounded-bl-none'}`}>
                                    {msg.text || <span className="animate-pulse">...</span>}
                                </div>
                            </div>
                        ))}
                        {isLoading && messages[messages.length-1]?.sender !== 'bot' && (
                             <div className="flex justify-start mb-3">
                                 <div className="py-2 px-4 rounded-2xl bg-white text-text-primary rounded-bl-none">
                                     <span className="animate-pulse">...</span>
                                 </div>
                             </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    {/* Input */}
                    <div className="p-4 border-t bg-surface rounded-b-lg">
                        <form onSubmit={handleSend} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask a question..."
                                className="w-full border border-gray-600 bg-secondary text-white placeholder-gray-400 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={isLoading}
                            />
                            <button type="submit" className="bg-primary text-white p-2 rounded-full hover:bg-opacity-80 disabled:opacity-50" disabled={isLoading || !inputValue.trim()}>
                                <SendIcon />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* FAB Button */}
            <button onClick={() => setIsOpen(!isOpen)} className={`bg-primary text-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform duration-200 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <ChatIcon />
            </button>
        </div>
    );
};

export default ChatbotWidget;