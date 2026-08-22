import React, { useState } from 'react';
import { clsx } from 'clsx';

interface AvatarProps {
  src?: string;
  alt: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

/**
 * Avatar component with image and fallback initials.
 * Shows initials derived from name when image fails to load.
 */
const Avatar: React.FC<AvatarProps> = ({ src, alt, name, size = 'md', className }) => {
  const [imgError, setImgError] = useState(false);

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  if (!src || imgError) {
    return (
      <div
        className={clsx(
          'inline-flex items-center justify-center rounded-full font-semibold',
          'bg-gradient-to-br from-indigo-400 to-violet-500 text-white',
          sizeStyles[size],
          className
        )}
        aria-label={alt}
        role="img"
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setImgError(true)}
      className={clsx(
        'rounded-full object-cover ring-2 ring-white dark:ring-slate-800',
        sizeStyles[size],
        className
      )}
    />
  );
};

export default Avatar;
