'use client';

const logos = [
  "https://venius.nl/logos/partner-1.png",
  "https://venius.nl/logos/partner-2.png",
  "https://venius.nl/logos/partner-3.png",
  "https://venius.nl/logos/partner-4.png",
  "https://venius.nl/logos/partner-5.png",
  "https://venius.nl/logos/partner-6.png",
  "https://venius.nl/logos/partner-7.png",
  "https://venius.nl/logos/partner-8.png",
  "https://venius.nl/logos/partner-9.png",
  "https://venius.nl/logos/partner-10.png",
  "https://venius.nl/logos/partner-11.png",
  "https://venius.nl/logos/partner-12.png",
  "https://venius.nl/logos/partner-13.png",
  "https://venius.nl/logos/partner-14.png",
  "https://venius.nl/logos/partner-15.png",
  "https://venius.nl/logos/partner-16.png",
];

export function LogoCarouselClient() {
  return (
    <div className="relative overflow-hidden group">
      <div
        className="flex gap-12 whitespace-nowrap group-hover:[animation-play-state:paused]"
        style={{ animation: 'logoScroll 40s linear infinite' }}
      >
        {[...logos, ...logos].map((logo, i) => (
          <img
            key={i}
            src={logo}
            alt={`Partner ${(i % logos.length) + 1}`}
            className="h-10 md:h-12 w-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 flex-shrink-0"
          />
        ))}
      </div>
      <style jsx global>{`
        @keyframes logoScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
