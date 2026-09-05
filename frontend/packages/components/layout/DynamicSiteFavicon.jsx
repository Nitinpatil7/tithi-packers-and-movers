'use client';

import { useEffect } from 'react';
import { useSiteSetting } from '@tithi/hooks/useSiteSetting';
import { resolveSiteAssetUrl } from '@tithi/utils/siteAssets';

const ICON_SELECTORS = [
  'link[rel="icon"]',
  'link[rel="shortcut icon"]',
  'link[rel="apple-touch-icon"]',
];

function upsertIconLink(rel, href) {
  let link = document.head.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export default function DynamicSiteFavicon() {
  const { data: site = {} } = useSiteSetting();
  const logoUrl = resolveSiteAssetUrl(site.logoUrl);

  useEffect(() => {
    if (!logoUrl) {
      document.head.querySelectorAll(ICON_SELECTORS.join(',')).forEach((link) => link.remove());
      return;
    }

    upsertIconLink('icon', logoUrl);
    upsertIconLink('shortcut icon', logoUrl);
    upsertIconLink('apple-touch-icon', logoUrl);
  }, [logoUrl]);

  return null;
}
