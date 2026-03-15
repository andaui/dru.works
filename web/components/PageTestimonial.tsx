import Image from "next/image";
import { urlFor } from "@/lib/sanity";

interface PageTestimonialProps {
  /** When true, stay within parent padding (e.g. on project page). When false, full-bleed to viewport. */
  contained?: boolean;
  /** When true, do not render the top horizontal line (caller renders it for full-bleed). */
  hideTopLine?: boolean;
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

export default function PageTestimonial({ testimonial, contained = false, hideTopLine = false }: PageTestimonialProps) {
  if (!testimonial) {
    return null;
  }

  // Process person photo
  let personPhotoUrl: string | null = null;
  let personPhotoAlt = testimonial.personPhoto?.alt || testimonial.person || 'Person photo';

  if (testimonial.personPhoto?.asset) {
    try {
      // Optimize for mobile - use lower quality
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
    <div
      className="w-full flex flex-col gap-[75px] items-center"
      style={contained ? undefined : { width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}
    >
      {/* Horizontal Line - edge to edge (omit when hideTopLine so caller can render full-bleed) */}
      {!hideTopLine && (
        <div className="w-screen h-px bg-border relative left-1/2 -translate-x-1/2" />
      )}
      
      {/* Testimonial Content Container - Full Width, Center Aligned */}
      <div className="flex flex-col gap-[12px] items-center w-full px-[4%] lg:px-[24px]">
        {/* Text Content - Max Width 824px, Centered */}
        <div className="flex flex-col gap-[20px] items-center w-full max-w-[780px]">
          <p className="font-inter font-normal text-[16px] leading-[23px] not-italic text-black text-center tracking-[0%] w-full whitespace-pre-line">
            {testimonialText}
          </p>
          <div className="flex flex-col md:flex-row items-center gap-[10px] min-h-[19px]">
            {personPhotoUrl ? (
              <div className="relative shrink-0 size-[21px] overflow-hidden rounded-full">
                <Image
                  src={personPhotoUrl}
                  alt={personPhotoAlt}
                  fill
                  className="object-cover"
                  sizes="21px"
                  quality={90}
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="relative shrink-0 size-[21px]">
                <div className="size-full rounded-full bg-gray-300" />
              </div>
            )}
            <p className="relative shrink-0 font-normal text-[12px] leading-[19px] not-italic text-[#989898] text-center md:text-left w-full md:w-auto">
              {testimonial.person}
              {roleAtCompany ? `, ${roleAtCompany}` : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

