
PRODUCT REQUIREMENTS DOCUMENT
SocialCart
E-Commerce via WhatsApp & Instagram
Document Version	v1.0
Status	Draft
Prepared By	Product Team
Date	March 2026
Audience	Developers, Designers, Stakeholders

CONFIDENTIAL
 
🛍  1. Product Overview
1.1  Purpose of the Website
SocialCart is a mobile-first e-commerce storefront designed for small and micro businesses that primarily operate through social media channels. Rather than implementing a traditional payment gateway and checkout pipeline, SocialCart bridges the gap between product discovery on the web and order fulfilment through WhatsApp and Instagram Direct Messaging — channels that merchants already use and trust.
The website serves as a professional, always-on digital catalogue that dramatically lowers the barrier to entry for merchants who lack the technical expertise or capital to build and maintain a full-stack e-commerce platform.

1.2  Target Users
SocialCart serves two primary user groups:
•	Merchants / Business Owners — individuals or micro-teams selling products via social media, WhatsApp groups, or word-of-mouth who need a polished online presence.
•	Shoppers / End Customers — mobile users who discover the store through social media links, Google search, or messaging referrals and want a friction-free way to enquire and order.

1.3  Key Value Proposition
"A professional online store in minutes — with ordering as simple as sending a message."

Stakeholder	Core Value
Merchant	Zero payment-gateway setup, no transaction fees, full conversation context with every order
Shopper	Browse professionally, order through familiar apps (WhatsApp / Instagram) with no account required
Platform	Extremely low operational cost; no PCI-DSS compliance burden; viral growth via social sharing


⚡  2. Problem Statement
2.1  Problems for Small Business Owners
•	High cost and complexity of setting up a conventional e-commerce store (Shopify, WooCommerce) with payment gateways, SSL, hosting, and maintenance.
•	Merchants already manage orders via WhatsApp/Instagram but have no professional storefront to send customers to — they rely on screenshots, PDF catalogues, or informal messages.
•	Loss of potential customers who search online and cannot find a structured product listing.
•	Manual, error-prone order management with no standardised order format, leading to miscommunication and lost sales.
•	Lack of SEO-visibility for inventory that exists only inside social media profiles.

2.2  Problems for Customers
•	No central place to browse a merchant's full catalogue with prices, descriptions, and photos.
•	Forced to create accounts or share sensitive payment details with unfamiliar small businesses.
•	Uncertainty about product availability, pricing, and variants before reaching out to a seller.
•	Friction in initiating a conversation — customers have to manually type product details when messaging a seller.

2.3  Market Context
According to industry data, over 50 million small businesses use WhatsApp Business, and Instagram Shopping has onboarded millions of sellers globally. Yet the majority of these sellers still lack a dedicated product-catalogue website. SocialCart addresses this gap directly.


🎯  3. Goals and Objectives
3.1  Business Goals
•	Enable merchants to create a live storefront within 30 minutes with zero coding.
•	Achieve a storefront-to-conversation conversion rate of ≥ 15% within 90 days of launch.
•	Support at least 500 concurrent product catalogues on the platform within 6 months.
•	Drive organic traffic through SEO-optimised product pages to reduce customer acquisition cost.
•	Build a monetisation-ready foundation (premium plans, analytics, future payment gateway) for post-MVP growth.

3.2  User Goals
Merchant Goals
•	Have a branded, mobile-optimised storefront live within minutes.
•	Receive structured, complete order messages automatically populated with product details.
•	Manage product catalogue (add, edit, remove) without developer assistance.
•	Toggle WhatsApp and/or Instagram ordering independently per product or store-wide.

Shopper Goals
•	Browse the full product catalogue with clear images, descriptions, and pricing.
•	Initiate an order with a single tap, pre-filled with the correct product details.
•	Complete the enquiry via a familiar, trusted messaging app without creating an account.


👥  4. Target Audience
Segment	Description	Primary Order Channel	Technical Comfort
Home-based Sellers	Homemade food, craft, clothing sold via WhatsApp groups and Instagram Stories	WhatsApp	Low
Instagram Boutiques	Fashion, accessories, beauty products with Instagram-first branding	Instagram DM	Medium
Local Service Providers	Salons, bakeries, custom printing with walk-in + online enquiries	WhatsApp	Low–Medium
Freelance Resellers	Electronics, imported goods, seasonal products sold via referral networks	WhatsApp	Medium
D2C Micro-Brands	Emerging brands building audience before moving to full e-commerce platforms	Both	Medium–High


✨  5. Core Features
5.1  Product Catalogue
•	Responsive product grid displayed on the home/shop page.
•	Each product card shows: thumbnail image, product name, short description (max 80 characters), price, and a quick-order CTA button.
•	Supports grid (3-column desktop / 2-column tablet / 1-column mobile) and list view toggle.
•	Lazy-loading images for optimal performance on slow mobile connections.
•	Out-of-stock badge overlay when product is disabled by the merchant.

5.2  Product Detail Page (PDP)
•	Full-page view accessible via unique SEO-friendly URL slug (e.g., /products/handmade-candle-rose).
•	Sections: Image Gallery, Product Name, SKU / Product ID, Price, Variant Selector (size, colour, etc.), Full Description, Tags/Category breadcrumb, and Order CTA buttons.
•	"Share" button generates a shareable product URL for WhatsApp/social forwarding.
•	Related products section (same category, up to 4 items).

5.3  Image Gallery
•	Up to 8 images per product with swipeable carousel on mobile.
•	Thumbnail strip on desktop with main image zoom on click/tap.
•	Supports JPEG, PNG, and WebP; images auto-compressed to max 800 KB on upload.
•	Aspect ratio enforced at 1:1 (square) for visual consistency in the grid.

5.4  Order via WhatsApp Button
•	Prominent, green CTA button on the product card and PDP.
•	On click, constructs a WhatsApp deep link using the wa.me protocol.
•	Opens WhatsApp (app or web) pre-filled with the merchant's registered phone number and the order message template.
•	Merchant can configure their WhatsApp Business number in the admin panel.

5.5  Order via Instagram Button
•	Purple/gradient CTA button on PDP (optionally on product card per merchant setting).
•	Opens Instagram Direct with the merchant's username pre-populated where supported, or copies the pre-filled message to clipboard with a notification.
•	Merchant can configure their Instagram username in the admin panel.
•	Button is hidden store-wide if merchant disables Instagram ordering.

5.6  Pre-filled Order Message
When a shopper taps an order button, the following message is automatically generated and pre-filled in the messaging app:

Hello, I would like to place an order:  Product: [Product Name] Variant: [Selected Variant, if applicable] Quantity: 1 Price: ₹[Product Price] Product Link: [PDP URL]  Please confirm availability and share payment/delivery details. Thank you!

•	All fields are dynamically populated from the product data.
•	Quantity is editable by the shopper within WhatsApp before sending.
•	Merchant can customise the message template prefix/suffix via the admin panel.

5.7  Mobile-First Design
•	All layouts designed at 375 px viewport first and scaled up.
•	Touch targets minimum 44 × 44 px (Apple HIG / Google Material guidelines).
•	Bottom navigation bar on mobile for Home, Search, and Cart (future).
•	Fast Tap-to-Order flow achievable in ≤ 3 taps from landing page.

5.8  Admin Product Management
(Detailed in Section 8. Summary of capabilities:)
•	Add, edit, and delete products via a web-based dashboard.
•	Drag-and-drop image uploads with crop/preview.
•	Category and tag management.
•	Toggle product visibility and ordering channels.
•	Bulk product import via CSV (Phase 2).

5.9  Category Filtering
•	Horizontal scrollable category pills on mobile; sidebar on desktop.
•	Multi-select filtering (e.g., Clothing + Sale).
•	"All" category always visible as the default/reset option.
•	URL query params update on filter change to support shareable filtered URLs (/shop?category=clothing).

5.10  Search Functionality
•	Full-text search across product name, description, and tags.
•	Search bar in the header; dedicated /search results page.
•	Real-time results with debounce (300 ms) to minimise API calls.
•	"No results" state with suggested categories.


🔄  6. User Flow
6.1  Primary Shopper Flow — WhatsApp Order
Step	Screen / Action	Key Elements
1	Land on Homepage	Hero banner, featured products, category pills, search bar
2	Browse Product Grid	Filter by category, scroll catalogue, product thumbnails + price
3	Open Product Detail Page (PDP)	Image gallery, description, price, variant selection, Order buttons
4	Tap 'Order on WhatsApp'	Button click triggers deep-link generation
5	WhatsApp Opens (App / Web)	Pre-filled message with product name, price, and link
6	Shopper Reviews & Sends	Shopper can edit quantity, then sends message to merchant
7	Merchant Receives & Responds	Merchant confirms, negotiates, and arranges delivery/payment

6.2  Primary Shopper Flow — Instagram Order
Step	Screen / Action	Key Elements
1–3	Same as WhatsApp flow above	—
4	Tap 'Order on Instagram'	Button click on PDP
5	Instagram DM Opens	On mobile: app deeplink. On desktop: instagram.com/direct
6	Message Copied to Clipboard	Toast notification: 'Order message copied! Paste it in the chat.'
7	Shopper Pastes & Sends	Shopper sends the message to the merchant's IG account

6.3  Merchant Admin Flow
1.	Merchant registers/logs in to the Admin Panel.
2.	Configures store settings: name, logo, WhatsApp number, Instagram username.
3.	Creates product categories.
4.	Adds products: uploads images, fills in name/description/price/category/variants.
5.	Publishes product — it becomes visible on the storefront immediately.
6.	Manages orders manually via WhatsApp/Instagram chat threads.


💬  7. WhatsApp & Instagram Order Message Specification
7.1  WhatsApp Deep Link Format
https://wa.me/{MERCHANT_PHONE}?text={ENCODED_MESSAGE}

7.2  Default Order Message Template
Hello, I want to order:  Product Name : {PRODUCT_NAME} Variant       : {VARIANT}  (or 'N/A') Quantity      : 1 Price         : ₹{PRODUCT_PRICE} Product Page  : {PRODUCT_URL}  Kindly confirm availability and share delivery details. Thank you!

7.3  Message Construction Rules
•	All placeholders are replaced at runtime; no placeholder should remain empty in the final message.
•	If a variant is not applicable, the Variant line is omitted entirely from the message.
•	The phone number must be in E.164 format (e.g., +919876543210) — no spaces, dashes, or brackets.
•	The entire message is URL-encoded (encodeURIComponent) before appending to the wa.me link.
•	Message max length: 1,000 characters to prevent truncation in WhatsApp.

7.4  Instagram Order Flow
•	Instagram does not support pre-filled DM text via deep links as of early 2026.
•	The CTA button instead: (a) copies the formatted order message to the clipboard, and (b) opens Instagram DM via instagram.com/direct/t/{USERNAME} on desktop or the app deep link on mobile.
•	A dismissable toast notification informs the shopper: "Order details copied! Open the chat and paste your message."
•	Merchant Instagram username must be configured in admin settings for the button to appear.


⚙️  8. Admin Panel Requirements
8.1  Authentication
•	Email + password login with JWT session management (7-day refresh token).
•	"Forgot password" flow via email OTP.
•	Optional: Google OAuth for quick setup.

8.2  Store Settings
•	Store Name, Store Tagline, Store Logo (upload).
•	WhatsApp Business Number (E.164 format, with validation).
•	Instagram Username.
•	Enable / Disable WhatsApp ordering (store-wide toggle).
•	Enable / Disable Instagram ordering (store-wide toggle).
•	Custom order message prefix and suffix.
•	Store Theme: choose accent colour (hex input + palette).
•	Currency symbol and locale (default: INR / ₹).

8.3  Product Management
Add Product
•	Product Name (required, max 120 chars)
•	Short Description (max 160 chars — used in product card and meta description)
•	Full Description (rich text editor — bold, italic, lists, links)
•	Price (required) and Compare-at Price (optional, for showing strike-through discount)
•	SKU / Product Code (optional, auto-generated if blank)
•	Category (required; multi-select from existing categories)
•	Tags (free-text, comma-separated)
•	Variants: Add variant groups (e.g., Size: S/M/L; Colour: Red/Blue) with optional per-variant price override
•	Images: upload up to 8 images (drag-and-drop); set primary image
•	Status: Published / Draft
•	Enable WhatsApp order / Enable Instagram order toggles per product

Edit / Delete Product
•	All fields editable post-publication.
•	Soft delete (products marked inactive, not permanently removed to preserve order history).
•	Duplicate product for quick creation of similar listings.

8.4  Category Management
•	Create, rename, reorder, and delete categories.
•	Assign category icon/emoji for visual navigation.
•	Set category display order on storefront.

8.5  Image Management
•	Supported formats: JPEG, PNG, WebP, HEIC (auto-converted to WebP on the server).
•	Maximum upload size: 10 MB per image; server resizes to max 1200 × 1200 px.
•	Basic in-browser crop tool before upload.
•	CDN delivery for all product images (Cloudflare or similar).

8.6  Analytics Dashboard (MVP)
•	Total product page views (last 7 / 30 days).
•	WhatsApp button click count per product.
•	Instagram button click count per product.
•	Top 5 most-viewed products.
•	Traffic source breakdown (direct, social, search).


🛠  9. Technical Requirements
9.1  Frontend Stack
Technology	Role	Rationale
React 18 + Vite	UI framework & build tool	Fast HMR, modern bundling, wide ecosystem
React Router v6	Client-side routing	SEO-friendly dynamic routes
TailwindCSS	Styling	Utility-first, mobile-first, tiny production bundle
Zustand	Global state (cart, filters)	Lightweight, no boilerplate
React Query (TanStack)	Server-state management	Caching, background refresh, error handling
Vite PWA Plugin	Progressive Web App	Offline product browsing, add-to-home-screen

9.2  Backend Stack
Technology	Role	Rationale
Node.js + Express / Fastify	REST API	Lightweight, JSON-native
PostgreSQL	Primary database	Relational, ACID-compliant, JSONB for variants
Redis	Caching & sessions	Sub-millisecond catalogue reads
Cloudinary / AWS S3	Image storage & CDN	Automatic optimisation, global delivery
JWT + bcrypt	Auth & password security	Stateless tokens, industry-standard hashing

9.3  Performance Requirements
•	Lighthouse Performance Score ≥ 90 on mobile (throttled 4G).
•	First Contentful Paint (FCP) ≤ 1.5 s.
•	Largest Contentful Paint (LCP) ≤ 2.5 s.
•	Total Blocking Time (TBT) ≤ 200 ms.
•	Product catalogue page ≤ 500 KB total transfer (compressed).
•	Images served in next-gen WebP format with responsive srcset.

9.4  SEO Requirements
•	Server-Side Rendering (SSR) or Static Site Generation (SSG) for product pages using Next.js (recommended over Vite+React for SEO-critical pages) or a Vite SSR plugin.
•	Dynamic <title>, <meta description>, and Open Graph tags per product.
•	Structured data markup (JSON-LD) for Product schema (name, image, price, availability).
•	Canonical URLs, XML sitemap auto-generation, robots.txt.
•	Clean, human-readable URL slugs (auto-generated from product name).

9.5  WhatsApp & Instagram Deep Link Integration
•	WhatsApp: wa.me deep link with URL-encoded pre-filled text. Graceful fallback to api.whatsapp.com for desktop.
•	Instagram: instagram://user?username={USERNAME} on mobile; https://www.instagram.com/{USERNAME} on desktop. Message copied to clipboard simultaneously.
•	Deep link construction handled in a reusable utility module (src/utils/orderLinks.js).
•	User-agent detection used to serve correct link (mobile vs desktop).

9.6  Security Requirements
•	HTTPS enforced everywhere; HTTP redirects to HTTPS.
•	Input sanitisation and parameterised queries to prevent SQL injection and XSS.
•	Rate limiting on admin auth endpoints (10 attempts per 15 minutes per IP).
•	CORS configured to storefront domain only for API.
•	Image uploads validated for MIME type and file size server-side.

9.7  Hosting & Deployment
•	Frontend: Vercel / Netlify with automatic CI/CD from main branch.
•	Backend API: Railway / Render / AWS EC2 with Docker containers.
•	Database: Managed PostgreSQL (Supabase or AWS RDS).
•	CDN: Cloudflare for DNS, DDoS protection, and edge caching.


🎨  10. UI/UX Requirements
10.1  Design Principles
•	Mobile-First: Every screen designed at 375 px width before scaling up.
•	Clarity: One primary action per screen; clear visual hierarchy.
•	Speed: Perceived performance prioritised — skeleton loaders, optimistic UI.
•	Trust: Professional look that communicates legitimacy to first-time visitors.
•	Accessibility: WCAG 2.1 AA compliance — contrast ratios ≥ 4.5:1, keyboard navigation, ARIA labels.

10.2  Visual Design
•	Typography: Inter or Plus Jakarta Sans (Google Fonts); fallback system-ui.
•	Colour system: primary brand colour configurable per merchant (admin setting); default: deep blue + green accents.
•	Spacing: 8 px base grid (4 / 8 / 16 / 24 / 32 / 48 / 64 px scale).
•	Iconography: Heroicons (MIT licence) or Phosphor Icons.
•	Product cards: subtle drop shadow, rounded corners (8 px radius), hover lift effect on desktop.

10.3  Key Screens
Screen	Key UI Elements
Homepage / Shop	Hero banner (optional), Category pills (horizontal scroll), Product grid, Search bar, Footer with merchant info
Product Detail Page	Swipeable image gallery, Variant selectors, Price (+ compare-at), Add-to-cart (future) / Order buttons, Description accordion, Related products
Search Results	Search bar (focused), Result count, Filtered product grid, Empty state illustration
Admin — Dashboard	Stats cards (views, clicks), Top products table, Quick-add product CTA
Admin — Product Form	Multi-step form (Details → Images → Variants → Publish), Live preview panel
Admin — Store Settings	Grouped settings panels: Branding / Ordering Channels / Message Template / Theme

10.4  CTA Button Design
•	WhatsApp CTA: WhatsApp green (#25D366) background, white text, WhatsApp icon. Label: "Order on WhatsApp".
•	Instagram CTA: Instagram gradient background (purple-to-orange), white text, Instagram icon. Label: "Order on Instagram".
•	Both buttons are full-width on mobile; side-by-side on desktop PDP.
•	Pulsing ring animation on the primary CTA to draw attention (respects prefers-reduced-motion).


🗺  11. Future Features (Product Roadmap)
Phase	Feature	Priority	Description
v1.1	Payment Gateway Integration	High	Razorpay / Stripe checkout as optional alternative to messaging order flow
v1.1	Order Management Dashboard	High	Merchant dashboard to log, track, and update orders received via chat
v1.2	Customer Accounts	Medium	Optional shopper login to save order history and re-order in one tap
v1.2	WhatsApp Business API	Medium	Automated order confirmation and follow-up messages via official API
v1.3	Inventory Management	Medium	Stock count per variant; auto-disable sold-out products
v1.3	Discount Codes & Offers	Medium	Promo codes that update the pre-filled order message automatically
v2.0	Multi-Merchant Platform	Low	SaaS model where multiple merchants each have their own subdomain storefront
v2.0	AI Product Description Gen	Low	Use AI to auto-generate SEO-optimised product descriptions from an image
v2.0	Abandoned Cart Recovery	Low	Detect partial user journeys and send re-engagement via WhatsApp
v2.1	Native Mobile App	Low	React Native app for merchant admin and shopper browsing


📊  12. Success Metrics
12.1  Primary KPIs
Metric	Definition	Target (90 days post-launch)
WhatsApp Button CTR	WA button clicks ÷ PDP views	≥ 12%
Instagram Button CTR	IG button clicks ÷ PDP views	≥ 5%
Catalogue-to-Chat Rate	Users who clicked an order button ÷ total visitors	≥ 8%
Merchant Activation Rate	Merchants who add ≥ 1 product within 48h of signup	≥ 70%
Storefront Uptime	% time storefront is available	≥ 99.5%

12.2  Secondary KPIs
•	Organic search impressions and click-through rate for product pages (Google Search Console).
•	Average session duration on the storefront.
•	Bounce rate on PDP (target ≤ 55%).
•	Mobile vs desktop traffic split (expected: ≥ 75% mobile).
•	Admin product management actions per merchant per week (indicates engagement).


⚠️  13. Risks and Limitations
#	Risk / Limitation	Impact	Probability	Mitigation
R1	WhatsApp API policy changes or deep link deprecation	High	Low	Monitor official WhatsApp Business API docs; maintain fallback to clipboard-copy flow
R2	Instagram removes or restricts DM deep links	High	Medium	Already using clipboard-copy as primary IG mechanism; deep link is enhancement only
R3	Order confirmation gap — no automated receipt	High	High	Phase 1.1 roadmap: WhatsApp Business API auto-confirmation; document manual merchant SOP
R4	Merchant phone number spam / scrapers	Medium	Medium	Obfuscate number in HTML; construct deep link client-side only; CAPTCHA on high-traffic stores
R5	Low SEO benefit if merchant uses common product names	Medium	Medium	Enforce unique slugs; provide SEO tips in onboarding; AI description generation in v2.0
R6	No payment security — cash/UPI arranged informally	High	High	Clearly communicate model as 'enquiry-first'; add payment gateway in v1.1
R7	Image CDN costs at scale	Low	Medium	Implement image compression at upload; set per-merchant storage quotas on free tier
R8	Merchant inactivity — stale catalogues	Medium	High	Email nudges for inactive merchants; auto-badge products not updated in 60+ days as 'unverified'


📎  14. Appendix
14.1  Glossary
Term	Definition
CTA	Call-to-Action — a button or link prompting a specific user action
PDP	Product Detail Page — the full-detail page for a single product
Deep Link	A URI scheme that opens a specific app (WhatsApp, Instagram) directly
wa.me	WhatsApp's official short-link service for deep links
E.164	International telephone numbering format (e.g., +919876543210)
FCP / LCP	Web performance metrics: First / Largest Contentful Paint
JWT	JSON Web Token — a compact, signed token used for authentication
CDN	Content Delivery Network — globally distributed edge servers for fast asset delivery
PWA	Progressive Web App — web app installable on mobile like a native app
WCAG 2.1 AA	Web Content Accessibility Guidelines — international web accessibility standard

14.2  Referenced Standards & Tools
•	WhatsApp Click-to-Chat API: https://faq.whatsapp.com/425247423114725
•	Instagram Deep Link Spec: https://developers.facebook.com/docs/instagram
•	Google Lighthouse: https://developer.chrome.com/docs/lighthouse
•	WCAG 2.1 AA: https://www.w3.org/TR/WCAG21/
•	Schema.org Product Markup: https://schema.org/Product

This document is a living PRD. All sections should be reviewed and updated at the start of each sprint. Feature scope changes must be approved by the Product Owner and reflected here before development begins.

