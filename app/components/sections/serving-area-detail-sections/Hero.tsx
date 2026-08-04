'use client';

import React from 'react';
import type { Page } from '@/app/lib/types';
import { HeroSection as CinematicHeroSection } from '@/app/components/sections/HeroSection';

interface HeroSectionProps {
  hero?: unknown;
  className?: string;
}

/** Service area hero — same layout as the site home hero. */
export const HeroSection: React.FC<HeroSectionProps> = ({ hero, className }) => {
  if (!hero || typeof hero !== 'object') return null;

  const heroData = hero as Page['hero'];
  if (heroData?.enabled === false) return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .service-area-hero .royal-title {
              font-size: clamp(1.65rem, 3.6vw, 2.65rem);
              line-height: 1;
            }

            /* Prevent clipping when title/subtitle/description are long */
            .service-area-hero .grid.lg\\:grid-cols-12.h-screen {
              height: auto;
              min-height: 100vh;
            }

            .service-area-hero .lg\\:col-span-5 {
              justify-content: flex-start;
              padding-top: 7rem;
              padding-bottom: 2.5rem;
            }

            .service-area-hero .max-w-xl {
              max-width: 42rem;
              gap: 1.25rem;
            }

            .service-area-hero p.text-gray-700 {
              font-size: clamp(0.95rem, 1.35vw, 1.05rem);
              line-height: 1.55;
            }
          `,
        }}
      />
      <CinematicHeroSection
        hero={heroData}
        className={`service-area-hero ${className ?? ''}`.trim()}
      />
    </>
  );
};

export default HeroSection;
