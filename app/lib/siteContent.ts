import type { Page, Site } from '@/app/lib/types';
import { getImageSrc } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';

export function getBrandName(site?: Site | null): string {
  return site?.business?.name?.trim() || site?.name?.trim() || '';
}

function pickMediaUrl(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || undefined;
  }
  if (typeof value === 'object' && value !== null) {
    const url = (value as { url?: unknown }).url;
    if (typeof url === 'string' && url.trim()) return url.trim();
  }
  return undefined;
}

/** Resolved logo URL from footer logo or theme (CMS may store either shape). */
export function getSiteLogoSrc(site?: Site | null): string | undefined {
  const raw = pickMediaUrl(site?.footer?.logo) ?? pickMediaUrl(site?.theme?.logoUrl);
  if (!raw) return undefined;
  const src = getImageSrc(raw);
  return src || undefined;
}

export function getBusinessTagline(site?: Site | null): string {
  return site?.business?.tagline?.trim() || '';
}

export function getHeroEyebrowText(hero?: Page['hero'], site?: Site | null): string {
  const eyebrow = tiptapToText(hero?.eyebrow);
  if (eyebrow) return eyebrow;
  const subtitle = tiptapToText(hero?.subtitle);
  if (subtitle) return subtitle;
  return getBusinessTagline(site);
}

export function getHeroTitleText(hero?: Page['hero'], site?: Site | null): string {
  const title = tiptapToText(hero?.title);
  if (title) return title;
  return getBrandName(site);
}

export function getHeroDescriptionExcerpt(hero?: Page['hero'], maxLen = 120): string {
  const text = tiptapToText(hero?.description);
  if (!text) return '';
  return text.length > maxLen ? `${text.slice(0, maxLen).trim()}…` : text;
}

export function getHeroFooterLine(hero?: Page['hero'], site?: Site | null): string {
  const excerpt = getHeroDescriptionExcerpt(hero, 140);
  if (excerpt) return excerpt;
  return getBusinessTagline(site);
}

export function getBusinessAddressLine(site?: Site | null): string {
  const addr = site?.business?.address;
  if (!addr) return '';

  const cityState = [addr.city, addr.state].filter(Boolean).join(', ');
  const parts = [addr.street, cityState, addr.zipCode, addr.country].filter(Boolean) as string[];
  return parts.join(' · ');
}

/** Raw CMS content for footer blurb (Tiptap JSON, HTML string, or plain text). */
export function getFooterDescriptionContent(site?: Site | null): unknown {
  const footerDesc = site?.footer?.description;
  if (footerDesc != null && footerDesc !== '') {
    if (typeof footerDesc === 'string' && !footerDesc.trim()) {
      // fall through
    } else {
      return footerDesc;
    }
  }

  const tagline = getBusinessTagline(site);
  if (tagline) return tagline;

  const businessDesc = site?.business?.description;
  if (businessDesc != null && businessDesc !== '') return businessDesc;

  return null;
}

export function hasFooterDescriptionContent(content: unknown): boolean {
  if (content == null || content === '') return false;
  if (typeof content === 'object') return true;
  return Boolean(tiptapToText(content) || String(content).trim());
}

export function getMenuFooterLine(site?: Site | null): string {
  const raw = getFooterDescriptionContent(site);
  const text = tiptapToText(raw);
  if (text) {
    return text.length > 140 ? `${text.slice(0, 140).trim()}…` : text;
  }
  return typeof raw === 'string' ? raw.trim() : '';
}

export function getHomePageLabel(pages?: Page[]): string {
  return pages?.find((p) => p.pageType === 'home')?.name?.trim() || '';
}

const PAGE_TYPE_PATHS: Record<Page['pageType'], string> = {
  home: '/',
  about: '/about-us',
  contact: '/contact-us',
  'service-list': '/services',
  'blog-list': '/blog',
  'project-detail': '/project-detail',
};

/** Slug → path when the app uses a dedicated route folder (not `[pageSlug]`). */
const SLUG_PATH_ALIASES: Record<string, string> = {
  testimonials: '/testimonials',
  gallery: '/gallery',
  'about-us': '/about-us',
  'contact-us': '/contact-us',
  services: '/services',
  blog: '/blog',
  'project-detail': '/project-detail',
};

/** Resolves a CMS page to the correct Next.js route. */
export function getPageHref(page: Page): string {
  if (page.pageType === 'home') return '/';

  const slug = (page.slug || '').replace(/^\/+|\/+$/g, '');
  const normalized = slug.toLowerCase();
  if (normalized && SLUG_PATH_ALIASES[normalized]) {
    return SLUG_PATH_ALIASES[normalized];
  }

  const typePath = PAGE_TYPE_PATHS[page.pageType];
  if (typePath && typePath !== '/') return typePath;

  return slug ? `/${slug}` : '/';
}

function normalizePageSlug(slug?: string): string {
  return (slug || '').replace(/^\/+|\/+$/g, '').toLowerCase();
}

export const TESTIMONIALS_ROUTE = '/testimonials';

export function isTestimonialsPage(page: Page): boolean {
  const slug = normalizePageSlug(page.slug);
  const name = (page.name || '').trim().toLowerCase();
  if (
    slug === 'testimonials' ||
    slug === 'testimonial' ||
    slug.includes('testimonial') ||
    name === 'testimonials' ||
    name === 'testimonial'
  ) {
    return true;
  }
  return getPageHref(page) === TESTIMONIALS_ROUTE;
}

export function isTestimonialsNavItem(item: HeaderNavItem, testimonialsHref = TESTIMONIALS_ROUTE): boolean {
  if (item.href === testimonialsHref) return true;
  const name = item.name.trim().toLowerCase();
  return name === 'testimonials' || name === 'testimonial';
}

export function findTestimonialsPage(pages?: Page[]): Page | undefined {
  return pages?.find((p) => isTestimonialsPage(p));
}

export function getTestimonialsNavItem(pages?: Page[]): HeaderNavItem {
  const cmsPage = findTestimonialsPage(pages);
  return {
    id: cmsPage?._id ?? 'nav-testimonials',
    name: cmsPage?.name?.trim() || 'Testimonials',
    href: TESTIMONIALS_ROUTE,
  };
}

export function getPublishedNavPages(pages?: Page[]): Page[] {
  return (
    pages
      ?.filter((p) => p.status === 'published' && p.pageType !== 'home')
      .sort(
        (a, b) =>
          ((a as Page & { order?: number }).order ?? 0) -
          ((b as Page & { order?: number }).order ?? 0)
      ) ?? []
  );
}

export type HeaderNavItem = {
  id: string;
  name: string;
  href: string;
};

/** Main header links (excludes testimonials — use getTestimonialsNavItem for the left slot). */
/** Routes shown in the header left cluster (testimonials uses getTestimonialsNavItem). */
export const LEFT_HEADER_NAV_HREFS = ['/services', '/project-detail'] as const;

export function isLeftHeaderNavItem(item: HeaderNavItem): boolean {
  if (item.href === TESTIMONIALS_ROUTE || isTestimonialsNavItem(item)) return true;
  return (LEFT_HEADER_NAV_HREFS as readonly string[]).includes(item.href);
}

export function splitHeaderNavItems(
  testimonialsNav: HeaderNavItem,
  items: HeaderNavItem[]
): { leftNavItems: HeaderNavItem[]; rightNavItems: HeaderNavItem[] } {
  const leftNavItems: HeaderNavItem[] = [testimonialsNav];
  const seenLeft = new Set<string>([testimonialsNav.href]);

  for (const href of LEFT_HEADER_NAV_HREFS) {
    const item = items.find((i) => i.href === href);
    if (item && !seenLeft.has(item.href)) {
      leftNavItems.push(item);
      seenLeft.add(item.href);
    }
  }

  const rightNavItems = items.filter(
    (item) => !seenLeft.has(item.href) && !isTestimonialsNavItem(item)
  );

  return { leftNavItems, rightNavItems };
}

/** Header nav: published CMS pages only (no hardcoded Testimonials/Gallery fallbacks). */
export function getHeaderNavItems(pages?: Page[]): HeaderNavItem[] {
  return buildNavLinksFromPages(pages, { includeHardcodedExtras: false }).map((link) => ({
    id: link.id,
    name: link.label,
    href: link.href,
  }));
}

export type FooterNavLink = {
  id: string;
  label: string;
  href: string;
};

const FOOTER_PAGE_TYPE_ORDER: Page['pageType'][] = [
  'home',
  'about',
  'service-list',
  'blog-list',
  'project-detail',
  'contact',
];

/** Extra app routes when no dedicated CMS page exists in the list (footer only). */
const EXTRA_FOOTER_NAV: { slug: string; href: string; defaultName: string }[] = [
  { slug: 'testimonials', href: TESTIMONIALS_ROUTE, defaultName: 'Testimonials' },
  { slug: 'gallery', href: '/gallery', defaultName: 'Gallery' },
];

function buildNavLinksFromPages(
  pages?: Page[],
  options?: { includeHardcodedExtras?: boolean }
): FooterNavLink[] {
  const published = pages?.filter((p) => p.status === 'published' && p.name?.trim()) ?? [];
  const orderedPages: Page[] = [];
  const seenIds = new Set<string>();

  for (const type of FOOTER_PAGE_TYPE_ORDER) {
    const page = published.find((p) => p.pageType === type);
    if (page && !seenIds.has(page._id)) {
      orderedPages.push(page);
      seenIds.add(page._id);
    }
  }

  const sortedRest = [...published].sort(
    (a, b) =>
      ((a as Page & { order?: number }).order ?? 0) -
      ((b as Page & { order?: number }).order ?? 0)
  );

  for (const page of sortedRest) {
    if (!seenIds.has(page._id)) {
      orderedPages.push(page);
      seenIds.add(page._id);
    }
  }

  const seenHrefs = new Set<string>();
  const links: FooterNavLink[] = [];

  for (const page of orderedPages) {
    const href = getPageHref(page);
    if (seenHrefs.has(href)) continue;
    seenHrefs.add(href);
    links.push({ id: page._id, label: page.name.trim(), href });
  }

  if (options?.includeHardcodedExtras) {
    for (const extra of EXTRA_FOOTER_NAV) {
      if (seenHrefs.has(extra.href)) continue;
      const cmsPage = published.find((p) => normalizePageSlug(p.slug) === extra.slug);
      links.push({
        id: cmsPage?._id ?? `nav-${extra.slug}`,
        label: cmsPage?.name?.trim() || extra.defaultName,
        href: cmsPage ? getPageHref(cmsPage) : extra.href,
      });
      seenHrefs.add(extra.href);
    }
  }

  return links;
}

/** All published pages for footer Explore — same on every route (ignores per-page footer link overrides). */
export function getFooterNavLinks(pages?: Page[]): FooterNavLink[] {
  return buildNavLinksFromPages(pages, { includeHardcodedExtras: true });
}

export function getCopyrightText(site?: Site | null): string {
  const footerCopyright = tiptapToText(site?.footer?.copyright);
  if (footerCopyright) return footerCopyright;
  return `©${new Date().getFullYear()}`;
}

export function getPrimaryHeroImageFromPages(pages?: Page[]): string {
  const home = pages?.find((p) => p.pageType === 'home');
  return getPrimaryHeroImageFromHero(home?.hero);
}

export function getPrimaryHeroImageFromHero(hero?: Page['hero']): string {
  if (!hero) return '';
  const h = hero as Page['hero'] & { images?: unknown[] };
  const raw = h.mediaItems?.[0] || h.images?.[0] || hero.media;
  if (!raw) return '';
  if (typeof raw === 'string') return getImageSrc(raw);
  const o = raw as { url?: string; image?: { url?: string } };
  const url = o.url || o.image?.url;
  return url ? getImageSrc(url) : '';
}
