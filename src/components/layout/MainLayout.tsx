import { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from './Header';
import { Footer } from './Footer';
import { useSiteSettings } from '@/hooks/useSiteData';
import { PageTransition } from '@/components/PageTransition';
import { SEO_CONFIG, generateOrganizationSchema } from '@/lib/seo';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  image?: string;
  keywords?: string | string[];
  type?: string;
  schema?: object;
}

export const MainLayout = ({
  children,
  title,
  description,
  image,
  keywords,
  type,
  schema
}: MainLayoutProps) => {
  const { data: settings } = useSiteSettings();

  const clubName = settings?.club_name || 'AISA';
  const clubFullName = settings?.club_full_name || 'AISA';
  const collegeName = settings?.college_name || '';
  const clubTagline = settings?.tagline || 'Empowering future tech leaders through innovation and excellence';

  const finalTitle = title
    ? `${title} | ${clubName}`
    : `${clubName} | ${collegeName}`;

  const finalDescription = description || SEO_CONFIG.description;
  const finalImage = image ? (image.startsWith('http') ? image : `${SEO_CONFIG.siteUrl}${image}`) : `${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultImage}`;

  const finalKeywords = Array.isArray(keywords)
    ? keywords.join(', ')
    : keywords || SEO_CONFIG.keywords.join(', ');

  const canonicalUrl = `${SEO_CONFIG.siteUrl}${window.location.pathname}`;

  return (
    <div className="flex min-h-screen flex-col">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{finalTitle}</title>
        <meta name="title" content={finalTitle} />
        <meta name="description" content={finalDescription} />
        <meta name="keywords" content={finalKeywords} />
        <meta name="author" content={clubFullName} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content={type || 'website'} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={finalTitle} />
        <meta property="og:description" content={finalDescription} />
        <meta property="og:image" content={finalImage} />
        <meta property="og:site_name" content={SEO_CONFIG.siteName} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={finalTitle} />
        <meta property="twitter:description" content={finalDescription} />
        <meta property="twitter:image" content={finalImage} />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(generateOrganizationSchema())}
        </script>
        {schema && (
          <script type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        )}
      </Helmet>

      <Header />
      <main className="flex-1">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
};
