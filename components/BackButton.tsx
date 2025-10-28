import React from 'react';
import { useNavigate } from 'react-router-dom';

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const BackButton: React.FC = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors duration-300 font-semibold"
            aria-label="Go back to the previous page"
        >
            <ArrowLeftIcon />
            <span>Back</span>
        </button>
    );
};

export default BackButton;
