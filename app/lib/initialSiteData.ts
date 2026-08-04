import api from '@/app/lib/fetch-api';
import type { Page, Service, Site } from '@/app/lib/types';

export type InitialSiteData = {
  site: Site;
  pages: Page[];
  services: Service[];
  serviceAreaPages: unknown[];
};

export async function getInitialSiteData(): Promise<InitialSiteData | null> {
  const siteSlug = process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG;
  if (!siteSlug) return null;

  try {
    const siteResponse = await api.get(`/public/sites/${siteSlug}`, { silent: true });
    if (!siteResponse || siteResponse.error) return null;

    const site: Site = siteResponse.data?.data ?? siteResponse.data;
    if (!site?.slug) return null;

    const [pagesResponse, servicesResponse, serviceAreaPagesResponse] = await Promise.all([
      api.get(`/public/sites/${site.slug}/pages`, { silent: true }),
      api.get(`/public/sites/${site.slug}/services`, { silent: true }),
      api.get(`/public/sites/${site.slug}/service-area-pages`, { silent: true }),
    ]);

    const pages: Page[] =
      pagesResponse?.success && pagesResponse.data
        ? (pagesResponse.data?.data ?? pagesResponse.data)
        : [];

    const services: Service[] =
      servicesResponse?.success && servicesResponse.data
        ? (servicesResponse.data?.data ?? servicesResponse.data)
        : [];

    const serviceAreaPages: unknown[] =
      serviceAreaPagesResponse?.success && serviceAreaPagesResponse.data
        ? (serviceAreaPagesResponse.data?.data ?? serviceAreaPagesResponse.data)
        : [];

    return { site, pages, services, serviceAreaPages };
  } catch {
    return null;
  }
}
