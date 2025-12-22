import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'bg-surface rounded-lg border border-border';
  const hoverStyles = hover ? 'cursor-pointer hover:bg-surface-light transition-colors' : '';
  
  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-lg ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-lg ${className}`} {...props}>
      {children}
    </div>
  );
};

