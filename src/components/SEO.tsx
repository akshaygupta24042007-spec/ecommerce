import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  noindex?: boolean;
}

const SEO = ({ 
  title, 
  description, 
  path, 
  noindex = false 
}: SEOProps) => {
  const siteUrl = 'https://www.hiyawear.com';
  
  // Clean the path: remove leading and trailing slashes for consistent construction
  const cleanPath = path ? path.replace(/^\/+|\/+$/g, '') : '';
  const canonicalUrl = cleanPath ? `${siteUrl}/${cleanPath}` : siteUrl;

  const defaultTitle = 'Hiya Wear | Premium Handmade Clothing for Global Customers';
  const defaultDescription = 'Discover premium handmade kimonos, jackets, dresses, bags and more at Hiya Wear. Designed for global customers with high-quality fabrics and unique styles.';
  const defaultImage = `${siteUrl}/logo.png`;

  const finalTitle = title ? `${title} | Hiya Wear` : defaultTitle;
  const finalDescription = description || defaultDescription;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={defaultImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={defaultImage} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <link rel="canonical" href={canonicalUrl} />
      )}
    </Helmet>
  );
};

export default SEO;
