import React from 'react';

export type BadgeVariant = 'xp' | 'continue' | 'done' | 'new' | 'level' | 'locked';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, className = '' }) => {
  const styles: Record<BadgeVariant, string> = {
    xp: 'bg-yellow-xp text-navy font-semibold',
    continue: 'bg-orange-bg text-orange-dark font-semibold',
    done: 'bg-green-bg text-green-dark font-semibold',
    new: 'bg-cyan-bg text-cyan-dark font-semibold',
    level: 'bg-navy text-white font-semibold',
    locked: 'bg-border text-text-muted font-semibold',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-button text-sm ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};
