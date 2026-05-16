'use client';

import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Jan de Vries',
    role: 'CEO',
    company: 'TechFlow BV',
    content: 'Kyrn heeft onze klantenservice compleet getransformeerd. Binnen 2 weken zagen we 40% reductie in reactietijd.',
    rating: 5,
  },
  {
    name: 'Lisa van Berg',
    role: 'Head of Sales',
    company: 'GrowthAcademy',
    content: 'De AI agent kwalificeert leads 24/7 terwijl wij slapen. Onze verkoopcyclus is nu 3x sneller.',
    rating: 5,
  },
  {
    name: 'Marco Pellegrini',
    role: 'Founder',
    company: 'Pellegrini Consulting',
    content: 'De automation flows zijn ongelooflijk krachtig maar ook makkelijk te bouwen. Zonder code.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Growing Businesses</h2>
          <p className="text-lg text-muted-foreground">
            See what our customers say about Kyrn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow"
            >
              <Quote className="h-8 w-8 text-primary/20 mb-4" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {testimonial.content}
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {testimonial.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
