import TestimonialCard from "@/components/TestimonialCard";

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
    <section className="w-full" aria-label="Testimonials">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 w-full">
        {testimonials.map((t) => (
          <TestimonialCard key={t._id} t={t} />
        ))}
      </div>
    </section>
  );
}
