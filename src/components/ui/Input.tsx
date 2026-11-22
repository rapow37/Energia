import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ icon, className = '', ...props }) => {
  return (
    <label className={`flex items-center gap-3 h-12 px-4 border border-border-dark rounded-button bg-white text-text-muted text-base focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all ${className}`}>
      {icon && <span className="text-text-muted flex items-center">{icon}</span>}
      <input 
        className="w-full bg-transparent border-none outline-none text-text-main placeholder:text-text-light font-sans"
        {...props}
      />
    </label>
  );
};
