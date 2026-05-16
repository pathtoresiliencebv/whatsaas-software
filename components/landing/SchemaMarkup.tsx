export function SchemaMarkup() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Kyrn',
    description: 'AI WhatsApp platform for sales and customer support. Automate conversations, scale your business, work on your rules.',
    url: 'https://kyrn.nl',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      name: 'Free Plan',
      description: 'Start free and scale as you grow',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
    provider: {
      '@type': 'Organization',
      name: 'Kyrn',
      url: 'https://kyrn.nl',
      logo: 'https://kyrn.nl/logo.svg',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'info@kyrn.nl',
        contactType: 'customer service',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
