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
  const canonicalUrl = path ? `${siteUrl}${path}` : siteUrl;

  const defaultTitle = 'Hiya Wear | Premium Handmade Clothing for Global Customers';
  const defaultDescription = 'Discover premium handmade kimonos, jackets, dresses, bags and more at Hiya Wear. Designed for global customers with high-quality fabrics and unique styles.';

  return (
    <Helmet>
      {title ? (
        <title>{title} | Hiya Wear</title>
      ) : (
        <title>{defaultTitle}</title>
      )}
      <meta name="description" content={description || defaultDescription} />
      
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <link rel="canonical" href={canonicalUrl} />
      )}
    </Helmet>
  );
};

export default SEO;
