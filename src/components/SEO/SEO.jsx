/**
 * SEO Component
 * 
 * Handles meta tags, Open Graph, and structured data
 */

import { Helmet } from 'react-helmet-async';

const SEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  keywords = [],
  noIndex = false,
}) => {
  const siteTitle = 'Postify Blog';
  const defaultDescription = 'Postify; teknoloji, ürün ve geliştirici deneyimi üzerine kısa editoryal notlar.';
  const defaultImage = '/images/posts/ai-muhendisligi.webp';
  const siteUrl = import.meta.env.VITE_APP_URL || 'https://postify.zekiakgul.dev';

  const pageTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const pageDescription = description || defaultDescription;
  const pageImage = image || `${siteUrl}${defaultImage}`;
  const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : siteUrl);

  // JSON-LD structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'BlogPosting' : 'WebSite',
    headline: title || siteTitle,
    description: pageDescription,
    image: pageImage,
    url: pageUrl,
    ...(author && {
      author: {
        '@type': 'Person',
        name: author,
      },
    }),
    ...(publishedTime && {
      datePublished: publishedTime,
    }),
    ...(modifiedTime && {
      dateModified: modifiedTime,
    }),
    publisher: {
      '@type': 'Organization',
      name: siteTitle,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/posts/ai-muhendisligi.webp`,
      },
    },
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={title || siteTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={title || siteTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />

      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={pageUrl} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
