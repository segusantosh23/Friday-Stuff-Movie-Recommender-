
import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'lg' }) => {
  const sizeMap = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-16 w-16',
  };
  const paddingMap = {
    sm: '',
    md: 'py-6',
    lg: 'py-12'
  };

  const containerClasses = size === 'sm' ? '' : `flex justify-center items-center ${paddingMap[size]}`;
  const spinnerClasses = `animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${sizeMap[size]}`;
  
  if (size === 'sm') {
    // For small spinner, don't wrap with padding container
    return <div className={spinnerClasses}></div>;
  }

  return (
    <div className={containerClasses}>
      <div className={spinnerClasses}></div>
    </div>
  );
};

export default Spinner;
