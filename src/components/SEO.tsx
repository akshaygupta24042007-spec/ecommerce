import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface ProductSchemaData {
  name: string;
  description: string;
  image: string;
  availability: boolean;
  url: string;
}

interface ArticleSchemaData {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  url: string;
}

export interface VideoSchemaData {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  image?: string;
  product?: ProductSchemaData;
  article?: ArticleSchemaData;
  video?: VideoSchemaData;
  breadcrumbs?: BreadcrumbItem[];
}

const SEO = ({ 
  title, 
  description, 
  path, 
  noindex = false,
  image,
  product,
  article,
  video,
  breadcrumbs
}: SEOProps) => {
  const siteUrl = 'https://www.hiyawear.com';
  
  const cleanPath = path ? path.replace(/^\/+|\/+$/g, '') : '';
  const canonicalUrl = cleanPath ? `${siteUrl}/${cleanPath}` : siteUrl;

  const defaultTitle = 'Hiya Wear | Premium Handmade Clothing for Global Customers';
  const defaultDescription = 'Discover premium handmade kimonos, jackets, dresses, bags and more at Hiya Wear. Designed for global customers with high-quality fabrics and unique styles.';
  const defaultImage = `${siteUrl}/logo.png`;

  const finalTitle = title ? `${title} | Hiya Wear` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalImage = image || defaultImage;

  // Organization schema (shown on all pages)
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Hiya Wear',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      'https://www.instagram.com/hiyawear_'
    ]
  };

  // Product schema
  const productSchema = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    url: product.url,
    brand: {
      '@type': 'Brand',
      name: 'Hiya Wear'
    },
    offers: {
      '@type': 'Offer',
      availability: product.availability 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: product.url
    }
  } : null;

  // Article schema
  const articleSchema = article ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image || defaultImage,
    datePublished: article.datePublished,
    url: article.url,
    author: {
      '@type': 'Organization',
      name: 'Hiya Wear'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Hiya Wear',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`
      }
    }
  } : null;

  // Video schema
  const videoSchema = video ? {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl || defaultImage,
    uploadDate: video.uploadDate,
    contentUrl: video.contentUrl
  } : null;

  // Breadcrumb schema
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  } : null;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:site_name" content="Hiya Wear" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <>
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={canonicalUrl} />
        </>
      )}

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
      {videoSchema && (
        <script type="application/ld+json">
          {JSON.stringify(videoSchema)}
        </script>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
