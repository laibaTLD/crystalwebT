'use client';

import { cn } from '@/app/lib/utils';
import { WhyChooseUs } from '@/app/components/sections/serving-area-detail-sections/WhyChooseUs';
import { ServiceDetails } from '@/app/components/sections/serving-area-detail-sections/ServiceDetails';

interface ServiceDetailsWhyChooseUsPairProps {
  whyChooseUs?: unknown;
  serviceDetails?: unknown;
  className?: string;
}

export const ServiceDetailsWhyChooseUsPair: React.FC<ServiceDetailsWhyChooseUsPairProps> = ({
  whyChooseUs,
  serviceDetails,
  className,
}) => {
  const showWhyChooseUs = Boolean(whyChooseUs);
  const showServiceDetails = Boolean(serviceDetails);

  if (!showWhyChooseUs && !showServiceDetails) return null;

  const singleColumn = !showWhyChooseUs || !showServiceDetails;

  return (
    <div
      className={cn(
        'grid grid-cols-1 border-t border-[color-mix(in_srgb,var(--wb-text-main)_12%,transparent)] lg:min-h-[28rem] lg:grid-cols-2 lg:items-stretch',
        className
      )}
    >
      {showWhyChooseUs && (
        <WhyChooseUs
          whyChooseUs={whyChooseUs}
          className={cn(
            'min-h-[22rem] lg:min-h-full',
            !singleColumn && 'border-b border-[color-mix(in_srgb,var(--wb-text-main)_12%,transparent)] lg:border-b-0 lg:border-r'
          )}
        />
      )}
      {showServiceDetails && (
        <ServiceDetails
          details={serviceDetails}
          className="min-h-[22rem] lg:min-h-full"
        />
      )}
    </div>
  );
};

export default ServiceDetailsWhyChooseUsPair;
