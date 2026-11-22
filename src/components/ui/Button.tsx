import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'disabled';
  size?: 'md' | 'sm' | 'icon';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const isActualDisabled = disabled || variant === 'disabled';

  let baseClass = "inline-flex items-center justify-center font-semibold transition-colors duration-150 rounded-button cursor-pointer select-none";

  if (size === 'icon') {
    return (
      <button
        disabled={isActualDisabled}
        className={`w-12 h-12 bg-white text-navy shadow-card hover:bg-surface active:scale-95 flex items-center justify-center rounded-button ${className}`}
        {...props}
      >
        {children || icon}
      </button>
    );
  }

  let variantClass = "";
  if (isActualDisabled) {
    variantClass = "bg-[#E1E6F0] text-[#7A8499] cursor-not-allowed";
  } else if (variant === 'primary') {
    variantClass = "bg-primary text-white hover:bg-primary-hover active:scale-[0.99]";
  } else if (variant === 'secondary') {
    variantClass = "bg-white text-navy border-2 border-navy hover:bg-surface active:scale-[0.99]";
  } else if (variant === 'accent') {
    variantClass = "bg-orange-accent text-navy font-bold hover:brightness-105 active:scale-[0.99]";
  }

  const sizeClass = size === 'sm' ? "h-10 px-4 text-sm" : "h-12 px-6 text-base";

  return (
    <button
      disabled={isActualDisabled}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2 flex items-center">{icon}</span>}
      {children}
    </button>
  );
};
