'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { getHeaderNavItems, getSiteLogoSrc } from '@/app/lib/siteContent';
import { cn } from '@/app/lib/utils';
import { OptimizedImage } from '@/app/components/ui/OptimizedImage';
import { resolvePrimaryCta } from '@/app/components/ui/made';

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
}

const headerStyles = `
  .royal-header {
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
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .royal-header-nav::-webkit-scrollbar {
    display: none;
    height: 0;
    width: 0;
  }

`;

export const Header: React.FC = () => {
  const { site, pages } = useWebBuilder();
  const themeColors = useThemeColors();
  const themeFonts = useThemeFonts();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const ctaHref = phoneNumber ? `tel:${phoneNumber.replace(/\s/g, '')}` : primaryCta?.href ?? '#';
  const ctaLabel = phoneNumber ? 'Call Us' : primaryCta?.label ?? 'Call Us';
  const showCta = Boolean(phoneNumber || primaryCta);

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
    if (!isMenuOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [isMenuOpen]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary-color', themeData.primaryColor);
    root.style.setProperty('--theme-secondary-color', themeData.secondaryColor);
    root.style.setProperty('--theme-cta-color', themeData.ctaColor);
    root.style.setProperty('--theme-primary-rgb', hexToRgb(themeData.primaryColor));
    root.style.setProperty('--theme-secondary-rgb', hexToRgb(themeData.secondaryColor));
  }, [themeData]);

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
        <div className="mx-auto flex h-[4.75rem] w-full max-w-[90rem] items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:h-[5.25rem] lg:gap-6 lg:px-16">
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
            {navItems.map((item) => (
              <Link key={item.id} href={item.href} className="royal-nav-link shrink-0">
                {item.name}
              </Link>
            ))}
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
              {navItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="royal-nav-link block text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
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
