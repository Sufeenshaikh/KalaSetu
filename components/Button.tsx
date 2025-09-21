import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  // FIX: Add disabled prop to allow the button to be disabled, resolving errors in login and signup pages.
  disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const baseClasses = 'px-6 py-3 font-bold rounded-md shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-opacity-90 focus:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-opacity-90 focus:ring-secondary',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}>
      {children}
    </button>
  );
};

export default Button;