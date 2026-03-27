import Image from "next/image";

export type HomeTestimonialItem = {
  _id: string;
  person: string;
  role: string;
  company: string;
  body: string;
  photoUrl: string | null;
  photoAlt: string;
};

type HomeTestimonialsGridProps = {
  testimonials: HomeTestimonialItem[];
};

export default function HomeTestimonialsGrid({
  testimonials,
}: HomeTestimonialsGridProps) {
  if (testimonials.length === 0) return null;

  return (
    <section className="w-full max-w-[1900px] mx-auto" aria-label="Testimonials">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 w-full">
        {testimonials.map((t) => (
          <article
            key={t._id}
            className="flex flex-col gap-[21px] items-start p-6 sm:p-7"
          >
            <div className="flex gap-[15px] items-start w-full">
              <div className="relative shrink-0 size-[57px] rounded-sm overflow-hidden bg-border dark:bg-white/10">
                {t.photoUrl ? (
                  <Image
                    src={t.photoUrl}
                    alt={t.photoAlt}
                    width={57}
                    height={57}
                    className="object-cover size-full"
                  />
                ) : null}
              </div>
              <div className="flex flex-col gap-px font-inter font-normal text-[13px] leading-[19px] min-w-0 flex-1">
                <p className="text-[#111011] dark:text-foreground m-0">{t.person}</p>
                <p className="text-[#757575] dark:text-muted m-0">{t.role}</p>
                <p className="text-[#757575] dark:text-muted m-0">{t.company}</p>
              </div>
            </div>
            <div className="font-soehne font-normal text-[18px] sm:text-[20px] leading-[26px] sm:leading-[27px] tracking-[-0.25px] text-foreground w-full whitespace-pre-wrap">
              {t.body}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
