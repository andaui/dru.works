import Image from "next/image";
import { urlFor } from "@/lib/sanity";

interface PageTestimonialProps {
  testimonial: {
    _id: string;
    _type: string;
    testimonialShort?: string;
    testimonialLong?: string;
    person?: string;
    role?: string;
    company?: string;
    personPhoto?: {
      asset?: {
        url?: string;
        _id?: string;
        metadata?: {
          dimensions?: {
            width?: number;
            height?: number;
          };
        };
      };
      alt?: string;
    };
  };
}

export default function PageTestimonial({ testimonial }: PageTestimonialProps) {
  if (!testimonial) {
    return null;
  }

  // Process person photo
  let personPhotoUrl: string | null = null;
  let personPhotoAlt = testimonial.personPhoto?.alt || testimonial.person || 'Person photo';

  if (testimonial.personPhoto?.asset) {
    try {
      personPhotoUrl = urlFor(testimonial.personPhoto)
        .width(42) // 21px * 2 for retina
        .height(42)
        .fit('crop')
        .quality(90)
        .format('jpg')
        .url();
    } catch (error) {
      console.error('Error building person photo URL:', error);
      if (testimonial.personPhoto.asset?.url) {
        personPhotoUrl = testimonial.personPhoto.asset.url;
      }
    }
  }

  // Format role and company
  const role = testimonial.role || '';
  const company = testimonial.company || '';
  const isFounderRole = role.toLowerCase().includes('founder') || role.toLowerCase().includes('co-founder');
  const roleAtCompany = role && company 
    ? isFounderRole 
      ? `${role} of ${company}`
      : `${role} at ${company}`
    : '';

  const testimonialText = testimonial.testimonialLong || testimonial.testimonialShort || '';

  return (
    <div className="w-full bg-white flex flex-col gap-[24px] items-start">
      <div className="flex flex-col gap-[12px] items-start w-full max-w-[600px] px-[24px]">
        <p className="font-normal text-[13px] leading-[19px] not-italic text-[#5d5d5d] w-full">
          {testimonialText}
        </p>
        <div className="flex items-center gap-[10px] min-h-[19px]">
          {personPhotoUrl ? (
            <div className="relative shrink-0 size-[21px] overflow-hidden rounded-full">
              <Image
                src={personPhotoUrl}
                alt={personPhotoAlt}
                fill
                className="object-cover"
                sizes="21px"
                quality={90}
              />
            </div>
          ) : (
            <div className="relative shrink-0 size-[21px]">
              <div className="size-full rounded-full bg-gray-300" />
            </div>
          )}
          <p className="relative shrink-0 font-normal text-[12px] leading-[19px] not-italic text-[#989898] text-nowrap">
            {testimonial.person}
            {roleAtCompany ? `, ${roleAtCompany}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

