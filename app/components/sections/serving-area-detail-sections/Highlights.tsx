'use client';

import React from 'react';
import type { Page } from '@/app/lib/types';
import { WhyChooseUsSection } from '@/app/components/sections/WhyChooseUsSection';

interface HighlightsProps {
  highlights: unknown;
  className?: string;
}

type WhyChooseUsSectionData = NonNullable<Page['whyChooseUsSection']>;

function normalizeHighlightsSection(highlights: unknown): WhyChooseUsSectionData | null {
  if (!highlights || typeof highlights !== 'object') return null;

  const data = highlights as Record<string, unknown>;
  if (data.enabled === false) return null;

  const rawItems = (data.items ?? data.highlights) as Array<{
    title?: unknown;
    description?: unknown;
    price?: string;
    counter?: string;
  }> | undefined;

  const items =
    rawItems
      ?.filter((item) => item?.title || item?.description || item?.price || item?.counter)
      .map((item) => ({
        title: item.title,
        description: item.price || item.counter || item.description,
      })) ?? [];

  if (!data.title && !data.description && items.length === 0) return null;

  return {
    enabled: true,
    title: data.title as WhyChooseUsSectionData['title'],
    description: data.description as WhyChooseUsSectionData['description'],
    items,
  };
}

/** Service area stats/highlights — same card layout as home Why Choose Us. */
export const Highlights: React.FC<HighlightsProps> = ({ highlights, className }) => {
  const section = normalizeHighlightsSection(highlights);
  if (!section) return null;

  return <WhyChooseUsSection whyChooseUsSection={section} className={className} />;
};

export default Highlights;
