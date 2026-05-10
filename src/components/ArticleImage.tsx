import React, { useState, useEffect } from 'react';

interface ArticleImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export const ArticleImage: React.FC<ArticleImageProps> = ({ src, alt, className = "", containerClassName = "" }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (error || !src) return null;

  return (
    <div className={containerClassName}>
      <img
        src={src}
        alt={alt}
        className={className}
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
      />
    </div>
  );
};
