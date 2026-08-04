'use client';

import { useMemo } from 'react';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

interface ServiceOverviewProps {
  overview: unknown;
  className?: string;
}

type OverviewData = {
  title?: unknown;
  description?: unknown;
  imageUrl?: string;
  imageAlt?: string;
};

function normalizeImage(raw: unknown): { url: string; altText?: string } | undefined {
  if (!raw) return undefined;
  if (typeof raw === 'string' && raw.trim()) return { url: raw.trim() };
  if (typeof raw === 'object' && raw !== null && 'url' in raw) {
    const record = raw as { url?: string; altText?: string };
    if (record.url?.trim()) return { url: record.url.trim(), altText: record.altText };
  }
  return undefined;
}

function hasRichContent(content: unknown): boolean {
  if (content == null || content === '') return false;
  if (typeof content === 'object') return Boolean(tiptapToText(content));
  return Boolean(String(content).trim());
}

/** Overview title / description / image only — no feature-point cards. */
function normalizeOverviewSection(overview: unknown): OverviewData | null {
  if (!overview || typeof overview !== 'object') return null;

  const data = overview as Record<string, unknown>;
  if (data.enabled === false) return null;

  const title = data.title;
  const description = data.description ?? data.subtitle ?? data.secondaryDescription;
  const image = normalizeImage(data.image ?? data.backgroundImage ?? data.media);

  if (!title && !description && !image) return null;

  return {
    title,
    description,
    imageUrl: image?.url ? getImageSrc(image.url) : undefined,
    imageAlt: image?.altText?.trim() || undefined,
  };
}

export const ServiceOverview: React.FC<ServiceOverviewProps> = ({ overview, className }) => {
  const { colors, fonts } = useSectionTheme();
  const primaryColor = colors.primaryButton;

  const section = useMemo(() => normalizeOverviewSection(overview), [overview]);

  const resolvedHeading = useMemo(
    () => tiptapToText(section?.title) || 'Service Overview',
    [section?.title]
  );

  const descriptionText = useMemo(
    () => tiptapToText(section?.description),
    [section?.description]
  );

  const { ref: triggerRef, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.12,
  });
  const loaded = isVisible;

  if (!section) return null;

  const showDescription =
    hasRichContent(section.description) || Boolean(descriptionText);
  const hasImage = Boolean(section.imageUrl);

  const fade = (delay = '0s') => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? 'translateY(0)' : 'translateY(18px)',
    transition: `opacity 0.7s ${EASE}, transform 0.7s ${EASE}`,
    transitionDelay: delay,
  });

  return (
    <section
      id="service-overview"
      className={cn('relative overflow-visible border-t', className)}
      style={{
        backgroundColor: colors.pageBackground,
        borderColor: `color-mix(in srgb, ${colors.mainText} 12%, transparent)`,
        fontFamily: fonts.body,
      }}
    >
      <div
        ref={triggerRef}
        className="wb-section-container py-16 sm:py-20 lg:py-24 text-center"
      >
        <div
          className={cn(
            'grid grid-cols-1 items-stretch gap-10 lg:gap-12 xl:gap-16',
            hasImage && 'lg:grid-cols-2'
          )}
        >
          {/* Content */}
          <div
            className={cn(
              'min-w-0 flex flex-col',
              !hasImage && 'mx-auto max-w-3xl text-center'
            )}
          >
            <p
              className={cn(
                'mb-5 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.28em]',
                !hasImage && 'justify-center'
              )}
              style={{
                fontFamily: fonts.body,
                color: primaryColor,
                ...fade('0s'),
              }}
            >
              <span className="inline-block h-px w-8 shrink-0" style={{ backgroundColor: primaryColor }} />
              Service Overview
            </p>

            <h2
              className={cn(
                'text-[clamp(1.35rem,2.2vw,1.875rem)] font-normal leading-[1.15] tracking-tight',
                hasImage ? 'text-left' : 'text-center'
              )}
              style={{
                fontFamily: fonts.heading,
                color: colors.mainText,
                ...fade('0.2s'),
              }}
            >
              {resolvedHeading}
            </h2>

            {showDescription && hasRichContent(section.description) && (
              <div
                className={cn(
                  'mt-6 text-base font-light leading-relaxed sm:mt-8 sm:text-lg',
                  '[&_h1]:mt-4 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-bold [&_h4]:mt-3 [&_h4]:text-base [&_h4]:font-semibold [&_strong]:font-semibold [&_b]:font-semibold',
                  hasImage ? 'text-left' : 'mx-auto max-w-xl text-center'
                )}
                style={{
                  fontFamily: fonts.body,
                  color: colors.secondaryText,
                  ...fade('0.55s'),
                }}
              >
                <TiptapRenderer content={section.description} className="text-inherit" />
              </div>
            )}

            {showDescription && !hasRichContent(section.description) && descriptionText && (
              <p
                className={cn(
                  'mt-6 text-base font-light leading-relaxed sm:mt-8 sm:text-lg',
                  hasImage ? 'text-left' : 'mx-auto max-w-xl text-center'
                )}
                style={{
                  fontFamily: fonts.body,
                  color: colors.secondaryText,
                  ...fade('0.55s'),
                }}
              >
                {descriptionText}
              </p>
            )}
          </div>

          {/* Image — equal column, sticky, no border or letterbox frame */}
          {hasImage && (
            <aside className="relative min-w-0 lg:sticky lg:self-start" style={{ top: 'calc(var(--wb-header-height) + 1.25rem)' }}>
              <div
                className="w-full"
                style={{
                  ...fade('0.35s'),
                }}
              >
                <OptimizedImage
                  src={section.imageUrl!}
                  alt={section.imageAlt || resolvedHeading}
                  width={1200}
                  height={900}
                  className="w-full h-auto max-h-[min(70vh,100%)] object-contain object-center"
                  sizes={IMAGE_SIZES.sectionHalf}
                />
              </div>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServiceOverview;
