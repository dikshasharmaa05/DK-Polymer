import site from '../data/site.json';
import { abs } from './url';

const ORG_ID = abs('/') + '#organization';
const BIZ_ID = abs('/') + '#localbusiness';
const SITE_ID = abs('/') + '#website';

export interface Crumb { name: string; path: string }

const postalAddress = {
  '@type': 'PostalAddress',
  streetAddress: site.nap.streetAddress,
  addressLocality: site.nap.locality,
  addressRegion: site.nap.region,
  postalCode: site.nap.postalCode,
  addressCountry: site.nap.countryCode,
};

export function organization() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: site.name,
    legalName: site.legalName,
    url: abs('/'),
    description: site.description,
    address: postalAddress,
    telephone: site.nap.phoneHref,
    email: site.nap.emailHref,
    sameAs: [site.googleBusinessProfileUrl],
  };
}

export function localBusiness() {
  return {
    '@type': 'LocalBusiness',
    '@id': BIZ_ID,
    name: site.nap.name,
    url: abs('/'),
    parentOrganization: { '@id': ORG_ID },
    description: site.description,
    address: postalAddress,
    // Placeholder strings until real coordinates and hours are confirmed (see README).
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.latitude, longitude: site.geo.longitude },
    openingHours: site.openingHours.schema,
    telephone: site.nap.phoneHref,
    email: site.nap.emailHref,
    areaServed: site.areaServed,
    hasMap: site.googleBusinessProfileUrl,
  };
}

export function webSite() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: site.name,
    url: abs('/'),
    inLanguage: site.language,
    publisher: { '@id': ORG_ID },
  };
}

export function webPage(path: string, title: string, description: string, dateModified: string) {
  return {
    '@type': 'WebPage',
    '@id': abs(path) + '#webpage',
    url: abs(path),
    name: title,
    description,
    isPartOf: { '@id': SITE_ID },
    inLanguage: site.language,
    dateModified,
  };
}

export function breadcrumbList(crumbs: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

interface ProductLike {
  slug: string; name: string; summary: string; gradeNote: string;
  specs: { property: string; unit: string; value: string; method: string }[];
}

/** Product without `offers`: pricing is undecided, so no price is published (see README). */
export function product(p: ProductLike) {
  return {
    '@type': 'Product',
    '@id': abs(`/products/${p.slug}/`) + '#product',
    name: p.name,
    description: p.summary,
    category: 'Recycled PBT granules',
    material: 'Polybutylene terephthalate (PBT), post-industrial recycled',
    brand: { '@type': 'Brand', name: site.name },
    manufacturer: { '@id': ORG_ID },
    url: abs(`/products/${p.slug}/`),
    additionalProperty: p.specs.map((s) => ({
      '@type': 'PropertyValue',
      name: s.property,
      value: s.value,
      ...(s.unit ? { unitText: s.unit } : {}),
      ...(s.method ? { measurementTechnique: s.method } : {}),
    })),
  };
}

export function faqPage(items: { question: string; answer: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function article(a: { slug: string; headline: string; description: string; author: string; datePublished: string; dateModified: string }) {
  return {
    '@type': 'Article',
    headline: a.headline,
    description: a.description,
    url: abs(`/resources/${a.slug}/`),
    mainEntityOfPage: abs(`/resources/${a.slug}/`),
    author: { '@type': 'Person', name: a.author },
    publisher: { '@id': ORG_ID },
    datePublished: a.datePublished,
    dateModified: a.dateModified,
    inLanguage: site.language,
  };
}
