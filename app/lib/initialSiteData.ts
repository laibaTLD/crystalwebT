import api from '@/app/lib/fetch-api';
import type { Page, Site } from '@/app/lib/types';

export type InitialSiteData = {
  site: Site;
  pages: Page[];
};

export async function getInitialSiteData(): Promise<InitialSiteData | null> {
  const siteSlug = process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG;
  if (!siteSlug) return null;

  try {
    const siteResponse = await api.get(`/public/sites/${siteSlug}`, { silent: true });
    if (!siteResponse || siteResponse.error) return null;

    const site: Site = siteResponse.data?.data ?? siteResponse.data;
    if (!site?.slug) return null;

    const pagesResponse = await api.get(`/public/sites/${site.slug}/pages`, { silent: true });
    const pages: Page[] =
      pagesResponse?.success && pagesResponse.data
        ? (pagesResponse.data?.data ?? pagesResponse.data)
        : [];

    return { site, pages };
  } catch {
    return null;
  }
}
