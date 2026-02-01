import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** For above-the-fold images that should load immediately */
  priority?: boolean;
  /** Fallback image URL if main image fails */
  fallback?: string;
  /** Additional wrapper className */
  wrapperClassName?: string;
}

/**
 * Optimized image component with lazy loading and error handling
 * - Uses loading="lazy" for non-priority images
 * - Uses loading="eager" for priority (above-fold) images
 * - Handles errors gracefully with fallback
 * - Smooth fade-in transition on load
 */
export function OptimizedImage({ 
  src, 
  alt, 
  priority = false,
  fallback = '/placeholder.svg',
  className,
  wrapperClassName,
  onLoad,
  onError,
  ...props 
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setError(true);
    onError?.(e);
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setLoaded(true);
    onLoad?.(e);
  };

  return (
    <img
      src={error ? fallback : src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      onError={handleError}
      onLoad={handleLoad}
      className={cn(
        "transition-opacity duration-300",
        !loaded && "opacity-0",
        loaded && "opacity-100",
        className
      )}
      {...props}
    />
  );
}

/**
 * Picture component with WebP support and fallback
 */
interface OptimizedPictureProps extends OptimizedImageProps {
  webpSrc?: string;
}

export function OptimizedPicture({
  src,
  webpSrc,
  alt,
  priority = false,
  fallback = '/placeholder.svg',
  className,
  ...props
}: OptimizedPictureProps) {
  const [error, setError] = useState(false);

  if (!webpSrc) {
    return (
      <OptimizedImage
        src={src}
        alt={alt}
        priority={priority}
        fallback={fallback}
        className={className}
        {...props}
      />
    );
  }

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={error ? fallback : src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        onError={() => setError(true)}
        className={cn(
          "transition-opacity duration-300",
          className
        )}
        {...props}
      />
    </picture>
  );
}
