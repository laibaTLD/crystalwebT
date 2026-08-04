'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { Footer } from '@/app/components/layout/Footer';
import { HeroSection } from '@/app/components/sections/serving-area-detail-sections/Hero';
import { About } from '@/app/components/sections/serving-area-detail-sections/About';
import { ServiceOverview } from '@/app/components/sections/serving-area-detail-sections/ServiceOverview';
import { ServiceDetailsWhyChooseUsPair } from '@/app/components/sections/serving-area-detail-sections/ServiceDetailsWhyChooseUsPair';
import { Highlights } from '@/app/components/sections/serving-area-detail-sections/Highlights';
import { OurServices } from '@/app/components/sections/serving-area-detail-sections/OurServices';
import { ServingAreas } from '@/app/components/sections/serving-area-detail-sections/ServingAreas';
import { FAQs } from '@/app/components/sections/serving-area-detail-sections/FAQs';
import { CTA } from '@/app/components/sections/serving-area-detail-sections/CTA';
import api from '@/app/lib/fetch-api';

interface ServiceAreaClientProps {
  serviceSlug: string;
  citySlug: string;
}

export default function ServiceAreaClient({ serviceSlug: serviceSlugProp, citySlug: citySlugProp }: ServiceAreaClientProps) {
  const params = useParams();
  const serviceSlug = params.serviceSlug as string || serviceSlugProp;
  const citySlug = params.citySlug as string || citySlugProp;
  
  const { site } = useWebBuilder();
  const [serviceAreaPage, setServiceAreaPage] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceAreaPage = async () => {
      if (!site) return;

      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/public/sites/${site.slug}/service-areas/by-service/${serviceSlug}/${citySlug}`);
        
        if (response.success) {
          console.log('🔍 Service Area Page Data:', response.data);
          setServiceAreaPage(response.data);
        } else {
          setError('Service area page not found');
        }
      } catch (err) {
        setError('Failed to load service area page');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceAreaPage();
  }, [site, serviceSlug, citySlug]);

  if (loading && !serviceAreaPage) return null;

  if (error || !serviceAreaPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Area Not Found</h2>
          <p className="text-gray-600 mb-4">The service area page could not be found.</p>
          <a href="/" className="inline-block text-blue-600 hover:underline">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  console.log('🔍 Full serviceAreaPage keys:', Object.keys(serviceAreaPage));
  console.log('🔍 Keys list:', JSON.stringify(Object.keys(serviceAreaPage)));
  console.log('🔍 All serviceAreaPage data:', serviceAreaPage);

  // Find the correct property name for service data
  const servicesData = serviceAreaPage.serviceOverview || 
                        serviceAreaPage.serviceDetails ||
                        null;

  // Individual section data
  const serviceOverviewData = serviceAreaPage.serviceOverview;
  const serviceDetailsData = serviceAreaPage.serviceDetails;
  const whyChooseUsData = serviceAreaPage.whyChooseUs || serviceAreaPage.about;
  const servingAreasData = serviceAreaPage.servingAreas;

  // Section verification
  console.log('📊 Section Rendering Status:');
  console.log('✅ HeroSection:', serviceAreaPage.hero ? 'Will Render' : 'Will NOT render (no data)');
  console.log('✅ About:', serviceAreaPage.about ? 'Will Render' : 'Will NOT render (no data)');
  console.log('✅ ServiceOverview:', serviceOverviewData ? 'Will Render' : 'Will NOT render (no data)');
  console.log('✅ ServiceDetails:', serviceDetailsData ? 'Will Render' : 'Will NOT render (no data)');
  console.log('✅ WhyChooseUs:', whyChooseUsData ? 'Will Render' : 'Will NOT render (no data)');
  console.log('✅ Highlights:', serviceAreaPage.highlights ? 'Will Render' : 'Will NOT render (no data)');
  console.log('✅ OurServices:', serviceAreaPage.ourServices ? 'Will Render' : 'Will NOT render (no data)');
  console.log('✅ ServingAreas:', servingAreasData ? 'Will Render' : 'Will NOT render (no data)');
  console.log('✅ FAQs:', serviceAreaPage.faqs ? 'Will Render' : 'Will NOT render (no data)');
  console.log('✅ CTA:', serviceAreaPage.cta ? 'Will Render' : 'Will NOT render (no data)');

  return (
    <div className="min-h-screen">

      <main>
        {/* 1. Hero Section */}
        <HeroSection hero={serviceAreaPage.hero} />
        
        {/* 2. Highlights */}
        <Highlights highlights={serviceAreaPage.highlights} />
        
        {/* 3. About */}
        <About about={serviceAreaPage.about} />
        
        {/* 4. Our Services */}
        <OurServices services={serviceAreaPage.ourServices} />
        
        {/* 5. CTA (Call To Action) */}
        <CTA cta={serviceAreaPage.cta} />

        {/* 6–7. Service Overview + paired sections */}
        <ServiceOverview overview={serviceOverviewData} />

        <ServiceDetailsWhyChooseUsPair
          whyChooseUs={whyChooseUsData}
          serviceDetails={serviceDetailsData}
        />
        
        {/* 9. FAQs */}
        <FAQs faqs={serviceAreaPage.faqs} />
        
        {/* 10. Service Areas */}
        <ServingAreas service={servingAreasData} />
      </main>

      {/* 11. Footer */}
      <Footer />
    </div>
  );
}
