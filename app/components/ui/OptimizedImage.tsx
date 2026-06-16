import NextImage, { type ImageProps } from 'next/image';
import { forwardRef } from 'react';
import { cn } from '@/app/lib/utils';

export type OptimizedImageProps = Omit<ImageProps, 'src'> & {
  src: string;
};

function useNativeImgElement(src: string, unoptimized?: boolean): boolean {
  if (!src || unoptimized) return true;
  if (src.startsWith('data:') || src.startsWith('blob:')) return true;
  if (/\.svg(\?|#|$)/i.test(src)) return true;
  return false;
}

/**
 * Wrapper around next/image so CMS URLs get WebP (see next.config `images.formats`).
 * SVG, data URLs, and `unoptimized` fall back to a plain &lt;img&gt;.
 */
export const OptimizedImage = forwardRef<HTMLImageElement | null, OptimizedImageProps>(
  function OptimizedImage(
    {
      src,
      alt = '',
      className,
      fill,
      width,
      height,
      sizes,
      style,
      unoptimized,
      ...rest
    },
    ref
  ) {
    if (!src) return null;

    if (useNativeImgElement(src, unoptimized)) {
      const {
        priority: _priority,
        placeholder: _placeholder,
        blurDataURL: _blurDataURL,
        quality: _quality,
        loader: _loader,
        onLoadingComplete: _onLoadingComplete,
        loading: _loading,
        ...imgRest
      } = rest;
      void _priority;
      void _placeholder;
      void _blurDataURL;
      void _quality;
      void _loader;
      void _onLoadingComplete;
      void _loading;

      return (
        <img
          ref={ref}
          src={src}
          alt={alt}
          className={className}
          style={style}
          {...imgRest}
        />
      );
    }

    /* next/image ignores HTML `loading`; use `priority` for LCP images */
    const { loading: _omitLoading, ...imageRest } = rest;
    void _omitLoading;

    if (fill) {
      return (
        <NextImage
          ref={ref}
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? '100vw'}
          className={cn('object-cover', className)}
          style={style}
          {...imageRest}
        />
      );
    }

    const w = width ?? 1200;
    const h = height ?? 800;

    return (
      <NextImage
        ref={ref}
        src={src}
        alt={alt}
        width={w}
        height={h}
        sizes={sizes}
        className={cn('h-auto max-w-full', className)}
        style={style}
        {...imageRest}
      />
    );
  }
);
