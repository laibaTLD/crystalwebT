'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import type { Page } from '@/app/lib/types';
import { ServingAreasSection } from '@/app/components/sections/ServingAreasSection';
import { resolveServiceSlug } from '@/app/lib/serviceAreaSlugs';

interface ServingAreasProps {
  /** CMS section config (title/description/slug only — areas come from live API) */
  service?: unknown;
  className?: string;
}

type ServingAreasSectionData = NonNullable<Page['servingAreasSection']>;

/** CMS config only — strip static area lists so pills always come from live API. */
export function stripStaticAreasFromConfig(service: unknown): unknown {
  if (!service || typeof service !== 'object') return service;
  const { areas, serviceAreas, items, locations, ...cms } = service as Record<string, unknown>;
  return cms;
}

function normalizeSectionConfig(
  service: unknown,
  serviceSlugFromUrl: string
): Page['servingAreasSection'] | null {
  const raw = stripStaticAreasFromConfig(service);
  const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;

  if (data?.enabled === false) return { enabled: false };

  const serviceSlug =
    (typeof data?.serviceSlug === 'string' && data.serviceSlug.trim()) ||
    serviceSlugFromUrl ||
    undefined;

  if (!data && !serviceSlug) return { enabled: true };

  if (!data) {
    return { enabled: true, serviceSlug };
  }

  return {
    enabled: true,
    title: data.title as ServingAreasSectionData['title'],
    description: (data.description ?? data.shortDescription) as ServingAreasSectionData['description'],
    serviceSlug,
  };
}

/** Service area coverage — live areas from builder API (same as home). */
export const ServingAreas: React.FC<ServingAreasProps> = ({ service, className }) => {
  const params = useParams();
  const serviceSlugFromUrl =
    typeof params?.serviceSlug === 'string' ? params.serviceSlug : '';

  const servingAreasSection = useMemo(
    () => normalizeSectionConfig(service, serviceSlugFromUrl),
    [service, serviceSlugFromUrl]
  );

  if (servingAreasSection?.enabled === false) return null;

  const config: Page['servingAreasSection'] =
    servingAreasSection ??
    (serviceSlugFromUrl
      ? { enabled: true, serviceSlug: resolveServiceSlug({ slug: serviceSlugFromUrl }) }
      : { enabled: true });

  return (
    <ServingAreasSection
      servingAreasSection={config}
      className={className}
    />
  );
};

export default ServingAreas;
