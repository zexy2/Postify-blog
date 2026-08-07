import { useEffect, useState } from 'react';

const DEFAULT_FALLBACK = '/images/posts/frontend-performansi.webp';

export default function ContentImage({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  ...props
}) {
  const [imageSrc, setImageSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setImageSrc(src || fallbackSrc);
  }, [fallbackSrc, src]);

  return (
    <img
      {...props}
      src={imageSrc}
      alt={alt || ''}
      onError={() => {
        if (imageSrc !== fallbackSrc) setImageSrc(fallbackSrc);
      }}
    />
  );
}
