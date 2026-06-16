'use client';

import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { Page } from '@/app/lib/types';
import { Footer } from '@/app/components/layout/Footer';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { AboutSection } from '@/app/components/sections/AboutSection';
import { ServicesSection } from '@/app/components/sections/ServicesSection';
import { TestimonialsSection } from '@/app/components/sections/TestimonialsSection';
import { FAQSection } from '@/app/components/sections/FAQSection';
import { WhyChooseUsSection } from '@/app/components/sections/WhyChooseUsSection';
import { CompanyDetailSection } from '@/app/components/sections/CompanyDetailSection';
import { ProjectsSection } from '@/app/components/sections/ProjectsSection';
import { BlogSection } from '@/app/components/sections/BlogSection';
import { ContactSection } from './components/sections/ContactSection';
import { CTASection } from '@/app/components/sections/CTASection';
import { GallerySection } from '@/app/components/sections/GallerySection';
import { ServingAreasSection } from '@/app/components/sections/ServingAreasSection';
import { getThemeColors } from '@/app/lib/themeBuilder';
export default function HomeClient() {
  const { site, pages, loading, error } = useWebBuilder();

  // Get theme colors from site using the new dynamic CSS variable system

  const themeColors = getThemeColors(site);

  // Get theme fonts from site
  const themeFonts = {
    heading: site?.theme?.headingFont,
    body: site?.theme?.bodyFont,
  };

  if (loading && !site) return null;

  if (error && !site) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: themeColors.pageBackground }}
      >
        <div 
          className="p-6 rounded-lg max-w-lg text-center"
          style={{ 
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.inactive,
            borderWidth: '1px'
          }}
        >
          <h2
            className="mb-2 text-xl font-bold"
            style={{
              color: themeColors.mainText,
              fontFamily: themeFonts.heading,
            }}
          >
            Error
          </h2>
          <p
            style={{
              color: themeColors.secondaryText,
              fontFamily: themeFonts.body,
            }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  const homePage = pages.find((p: Page) => p.pageType === 'home');

  if (!homePage) return null;

  return (
    <div
      className="min-h-screen selection:bg-black/10 selection:text-inherit"
      style={{
        backgroundColor: themeColors.pageBackground,
        color: themeColors.mainText,
        fontFamily: themeFonts.body,
      }}
    >

      <main>
        <HeroSection hero={homePage.hero} page={homePage} />
        <AboutSection aboutSection={homePage.aboutSection} page={homePage} />
        <ServicesSection
          servicesSection={homePage.servicesSection}
          companyDetailSection={homePage.companyDetailSection}
          ctaSection={homePage.ctaSection}
          page={homePage}
        />
        <CTASection ctaSection={homePage.ctaSection} />
        <CompanyDetailSection companyDetailSection={homePage.companyDetailSection} />
        <BlogSection blogSection={homePage.blogSection} />
        <ProjectsSection
          projectSection={homePage.projectSection}
          projectsSection={homePage.projectsSection}
          projectsLimit={3}
        />
        <GallerySection gallerySection={homePage.gallerySection} />
        <WhyChooseUsSection whyChooseUsSection={homePage.whyChooseUsSection} />
        <FAQSection faqSection={homePage.faqSection} />
        <TestimonialsSection testimonialsSection={homePage.testimonialsSection} />
        <ServingAreasSection servingAreasSection={homePage.servingAreasSection} />
        <ContactSection contactSection={homePage.contactSection} />
      </main>
      <Footer />
    </div>
  );
}
