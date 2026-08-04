'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { getHeaderNavItems, getSiteLogoSrc, type HeaderNavItem } from '@/app/lib/siteContent';
import { cn } from '@/app/lib/utils';
import { OptimizedImage } from '@/app/components/ui/OptimizedImage';
import { resolvePrimaryCta } from '@/app/components/ui/made';
import {
  getAreaDisplayName,
  getServiceAreaPageHref,
  resolveServiceSlug,
} from '@/app/lib/serviceAreaSlugs';
import type { Service } from '@/app/lib/types';

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
}

function isServicesNavItem(item: HeaderNavItem, pages?: { _id: string; pageType?: string }[]): boolean {
  if (item.href === '/services' || item.href.replace(/\/+$/, '') === '/services') return true;
  const page = pages?.find((p) => p._id === item.id);
  return page?.pageType === 'service-list';
}

type ServiceNavEntry = {
  id: string;
  name: string;
  href: string;
  areas: { key: string; name: string; href: string }[];
};

const headerStyles = `
  .royal-header {
    overflow: visible;
    background: linear-gradient(
      135deg,
      rgba(var(--theme-primary-rgb), 0.03) 0%,
      rgba(var(--theme-secondary-rgb), 0.03) 100%
    );
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(var(--theme-primary-rgb), 0.08);
  }

  .royal-header-scrolled {
    background: color-mix(in srgb, var(--wb-page-bg) 92%, transparent);
    box-shadow: 0 8px 32px rgba(var(--theme-primary-rgb), 0.08);
    border-bottom-color: rgba(var(--theme-primary-rgb), 0.12);
  }

  .royal-nav-link {
    position: relative;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--wb-text-secondary);
    text-decoration: none;
    padding: 0.35rem 0;
    white-space: nowrap;
    transition: color 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .royal-nav-link::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    height: 1px;
    width: 0;
    background: linear-gradient(90deg, var(--theme-primary-color), transparent);
    transition: width 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .royal-nav-link:hover {
    color: var(--wb-text-main);
  }

  .royal-nav-link:hover::after {
    width: 100%;
  }

  .header-cta-button {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.85rem 1.75rem;
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-decoration: none;
    color: #fff !important;
    background: var(--theme-cta-color) !important;
    border: none !important;
    border-radius: 50px;
    box-shadow: none;
  }

  .header-cta-button:hover,
  .header-cta-button:focus {
    color: #fff !important;
    background: var(--theme-cta-color) !important;
    border: none !important;
    transform: none;
    box-shadow: none;
  }

  .header-cta-button .button-text,
  .header-cta-button svg {
    color: #fff !important;
  }

  .royal-header-nav {
    overflow: visible;
  }

  .services-dropdown-panel,
  .services-submenu-panel {
    background: color-mix(in srgb, var(--wb-page-bg) 96%, transparent);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.12);
    box-shadow: 0 16px 40px rgba(var(--theme-primary-rgb), 0.1);
  }

  .services-dropdown-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.65rem 1rem;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--wb-text-secondary);
    text-decoration: none;
    white-space: nowrap;
    transition: color 0.25s ease, background 0.25s ease;
  }

  .services-dropdown-link:hover,
  .services-dropdown-link:focus-visible,
  .services-dropdown-item:hover > .services-dropdown-link,
  .services-dropdown-item:focus-within > .services-dropdown-link {
    color: var(--wb-text-main);
    background: rgba(var(--theme-primary-rgb), 0.06);
  }

`;

function ChevronIcon({ open, className }: { open?: boolean; className?: string }) {
  return (
    <svg
      className={cn('h-3 w-3 shrink-0 transition-transform duration-200', open && 'rotate-180', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function NestedChevron({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-3 w-3 shrink-0', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export const Header: React.FC = () => {
  const { site, pages, services, serviceAreaPages, loading } = useWebBuilder();
  const themeColors = useThemeColors();
  const themeFonts = useThemeFonts();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [hoveredServiceId, setHoveredServiceId] = useState<string | null>(null);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileExpandedServiceId, setMobileExpandedServiceId] = useState<string | null>(null);

  const servicesDropdownRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logoImage = useMemo(() => getSiteLogoSrc(site), [site]);
  const phoneNumber = site?.business?.phone?.trim();

  const themeData = useMemo(() => {
    const t = site?.theme;
    return {
      primaryColor: t?.primaryButtonColorLight || t?.darkPrimaryColor || '#4f46e5',
      secondaryColor: t?.darkSecondaryColor || t?.lightSecondaryColor || '#7c3aed',
      ctaColor:
        t?.hoverActiveColorLight ||
        t?.hoverActiveColorDark ||
        t?.darkSecondaryColor ||
        t?.lightSecondaryColor ||
        '#7c3aed',
    };
  }, [site?.theme]);

  const homePage = pages.find((p) => p.pageType === 'home');
  const primaryCta = useMemo(
    () => resolvePrimaryCta(homePage ?? null, site, pages),
    [homePage, site, pages]
  );

  const navItems = useMemo(() => getHeaderNavItems(pages), [pages]);

  const serviceNavEntries = useMemo((): ServiceNavEntry[] => {
    const published = (services as Service[]).filter((s) => s.status === 'published');
    const siteAreas = Array.isArray(site?.serviceAreas) ? site!.serviceAreas : [];

    return published.map((service) => {
      const slug = resolveServiceSlug(service);
      const rawAreas =
        Array.isArray(service.serviceAreas) && service.serviceAreas.length > 0
          ? service.serviceAreas
          : siteAreas;

      const seen = new Set<string>();
      const areas: ServiceNavEntry['areas'] = [];

      for (const area of rawAreas) {
        const name = getAreaDisplayName(area);
        if (!name) continue;
        const key = name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        areas.push({
          key,
          name,
          href: getServiceAreaPageHref(slug, area, serviceAreaPages),
        });
      }

      return {
        id: service._id || slug,
        name: service.name,
        href: `/service/${slug}`,
        areas,
      };
    });
  }, [services, site?.serviceAreas, serviceAreaPages]);

  const ctaHref = phoneNumber ? `tel:${phoneNumber.replace(/\s/g, '')}` : primaryCta?.href ?? '#';
  const ctaLabel = phoneNumber ? 'Call Us' : primaryCta?.label ?? 'Call Us';
  const showCta = Boolean(phoneNumber || primaryCta);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openServicesMenu = () => {
    clearCloseTimer();
    setServicesOpen(true);
  };

  const scheduleCloseServicesMenu = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setServicesOpen(false);
      setHoveredServiceId(null);
    }, 220);
  };

  useEffect(() => {
    document.documentElement.classList.remove('hero-intro-active');
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 24);
      setIsVisible(currentScrollY <= lastScrollY || currentScrollY < 80);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (!isMenuOpen && !servicesOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setIsMenuOpen(false);
      setServicesOpen(false);
      setHoveredServiceId(null);
      setMobileServicesOpen(false);
      setMobileExpandedServiceId(null);
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [isMenuOpen, servicesOpen]);

  useEffect(() => {
    if (!servicesOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!servicesDropdownRef.current?.contains(e.target as Node)) {
        setServicesOpen(false);
        setHoveredServiceId(null);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [servicesOpen]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary-color', themeData.primaryColor);
    root.style.setProperty('--theme-secondary-color', themeData.secondaryColor);
    root.style.setProperty('--theme-cta-color', themeData.ctaColor);
    root.style.setProperty('--theme-primary-rgb', hexToRgb(themeData.primaryColor));
    root.style.setProperty('--theme-secondary-rgb', hexToRgb(themeData.secondaryColor));
  }, [themeData]);

  if (loading && !site) return null;

  const renderDesktopServicesDropdown = (item: HeaderNavItem) => (
      <div
        key={item.id}
        ref={servicesDropdownRef}
        className="relative shrink-0"
        onMouseEnter={openServicesMenu}
        onMouseLeave={scheduleCloseServicesMenu}
      >
        <button
          type="button"
          className="royal-nav-link inline-flex items-center gap-1.5 border-0 bg-transparent p-0"
          aria-expanded={servicesOpen}
          aria-haspopup="true"
          onClick={() => {
            clearCloseTimer();
            setServicesOpen((open) => !open);
            if (servicesOpen) setHoveredServiceId(null);
          }}
        >
          {item.name}
          <ChevronIcon open={servicesOpen} />
        </button>

        {servicesOpen && (
          <div className="absolute left-1/2 top-full z-[1100] -translate-x-1/2 pt-2">
            <div
              className="services-dropdown-panel min-w-[14rem] py-2"
              role="menu"
              aria-label="Services"
            >
              <Link
                href={item.href}
                className="services-dropdown-link border-b border-[rgba(var(--theme-primary-rgb),0.08)] font-semibold"
                role="menuitem"
                onClick={() => {
                  setServicesOpen(false);
                  setHoveredServiceId(null);
                }}
              >
                All Services
              </Link>

              {serviceNavEntries.map((service) => {
                const isHovered = hoveredServiceId === service.id;
                const hasAreas = service.areas.length > 0;

                return (
                  <div
                    key={service.id}
                    className="services-dropdown-item relative"
                    onMouseEnter={() => {
                      clearCloseTimer();
                      setHoveredServiceId(service.id);
                    }}
                    onFocus={() => setHoveredServiceId(service.id)}
                  >
                    <Link
                      href={service.href}
                      className="services-dropdown-link"
                      role="menuitem"
                      aria-haspopup={hasAreas || undefined}
                      aria-expanded={hasAreas ? isHovered : undefined}
                      onClick={() => {
                        setServicesOpen(false);
                        setHoveredServiceId(null);
                      }}
                    >
                      <span>{service.name}</span>
                      {hasAreas && <NestedChevron />}
                    </Link>

                    {hasAreas && isHovered && (
                      <div className="absolute left-full top-0 z-[1110] pl-1">
                        <div
                          className="services-submenu-panel min-w-[12rem] py-2"
                          role="menu"
                          aria-label={`${service.name} service areas`}
                        >
                          {service.areas.map((area) => (
                            <Link
                              key={area.key}
                              href={area.href}
                              className="services-dropdown-link"
                              role="menuitem"
                              onClick={() => {
                                setServicesOpen(false);
                                setHoveredServiceId(null);
                              }}
                            >
                              {area.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );

  const renderMobileServicesNav = (item: HeaderNavItem) => (
      <li key={item.id} className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={item.href}
            className="royal-nav-link block text-sm"
            onClick={() => setIsMenuOpen(false)}
          >
            {item.name}
          </Link>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded border-0 bg-transparent"
            style={{ color: themeColors.mainText }}
            aria-expanded={mobileServicesOpen}
            aria-label={mobileServicesOpen ? 'Collapse services' : 'Expand services'}
            onClick={() => {
              setMobileServicesOpen((open) => !open);
              if (mobileServicesOpen) setMobileExpandedServiceId(null);
            }}
          >
            <ChevronIcon open={mobileServicesOpen} />
          </button>
        </div>

        {mobileServicesOpen && (
          <ul className="ml-3 flex flex-col gap-2 border-l pl-3" style={{ borderColor: `color-mix(in srgb, ${themeColors.mainText} 12%, transparent)` }}>
            <li>
              <Link
                href={item.href}
                className="block py-1 text-xs font-medium tracking-wide"
                style={{ color: themeColors.mainText }}
                onClick={() => setIsMenuOpen(false)}
              >
                All Services
              </Link>
            </li>
            {serviceNavEntries.map((service) => {
              const expanded = mobileExpandedServiceId === service.id;
              const hasAreas = service.areas.length > 0;

              return (
                <li key={service.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={service.href}
                      className="royal-nav-link block text-sm normal-case tracking-normal"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {service.name}
                    </Link>
                    {hasAreas && (
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded border-0 bg-transparent"
                        style={{ color: themeColors.mainText }}
                        aria-expanded={expanded}
                        aria-label={expanded ? `Collapse ${service.name} areas` : `Expand ${service.name} areas`}
                        onClick={() =>
                          setMobileExpandedServiceId((id) => (id === service.id ? null : service.id))
                        }
                      >
                        <ChevronIcon open={expanded} />
                      </button>
                    )}
                  </div>

                  {hasAreas && expanded && (
                    <ul className="ml-2 flex flex-col gap-1.5 border-l pl-3" style={{ borderColor: `color-mix(in srgb, ${themeColors.mainText} 10%, transparent)` }}>
                      {service.areas.map((area) => (
                        <li key={area.key}>
                          <Link
                            href={area.href}
                            className="block py-1 text-xs tracking-wide"
                            style={{ color: themeColors.secondaryText }}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {area.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: headerStyles }} />

      <header
        className={cn(
          'royal-header fixed inset-x-0 top-0 z-[1000] transition-all duration-500',
          isScrolled && 'royal-header-scrolled',
          !isVisible && '-translate-y-full'
        )}
        style={{
          fontFamily: themeFonts.body,
          color: themeColors.mainText,
          backgroundColor: isScrolled
            ? `color-mix(in srgb, ${themeColors.pageBackground} 92%, transparent)`
            : `color-mix(in srgb, ${themeColors.pageBackground} 88%, transparent)`,
        }}
      >
        <div className="mx-auto flex h-[4.75rem] w-full max-w-[90rem] items-center gap-3 overflow-visible px-4 sm:gap-4 sm:px-6 lg:h-[5.25rem] lg:gap-6 lg:px-16">
          {logoImage && (
            <Link
              href="/"
              className="flex shrink-0 items-center no-underline"
              aria-label="Home"
            >
              <OptimizedImage
                src={logoImage}
                alt="Logo"
                width={240}
                height={72}
                priority
                unoptimized
                className="h-14 w-auto max-h-[4rem] object-contain sm:h-16 lg:h-[4.25rem]"
              />
            </Link>
          )}

          <nav
            className="royal-header-nav hidden min-w-0 flex-1 items-center justify-center gap-4 px-2 md:flex lg:gap-6 xl:gap-8"
            aria-label="Primary"
          >
            {navItems.map((item) =>
              isServicesNavItem(item, pages)
                ? renderDesktopServicesDropdown(item)
                : (
                  <Link key={item.id} href={item.href} className="royal-nav-link shrink-0">
                    {item.name}
                  </Link>
                )
            )}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border md:hidden"
              style={{
                borderColor: `color-mix(in srgb, ${themeColors.mainText} 18%, transparent)`,
                color: themeColors.mainText,
              }}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-menu"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            {showCta && (
              <Link href={ctaHref} className="header-cta-button inline-flex">
                <span className="button-text">{ctaLabel}</span>
                {phoneNumber ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                )}
              </Link>
            )}
          </div>
        </div>

        {isMenuOpen && (
          <nav
            id="mobile-nav-menu"
            className="border-t px-4 py-4 md:hidden"
            style={{
              borderColor: `color-mix(in srgb, ${themeColors.mainText} 12%, transparent)`,
              backgroundColor: themeColors.pageBackground,
            }}
            aria-label="Mobile primary"
          >
            <ul className="flex flex-col gap-3">
              {navItems.map((item) =>
                isServicesNavItem(item, pages) ? (
                  renderMobileServicesNav(item)
                ) : (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="royal-nav-link block text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </nav>
        )}

        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-60"
          style={{
            background: `linear-gradient(90deg, transparent, ${themeData.primaryColor}, transparent)`,
          }}
          aria-hidden
        />
      </header>
    </>
  );
};

export default Header;
