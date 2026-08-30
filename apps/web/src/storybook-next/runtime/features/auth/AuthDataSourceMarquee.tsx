import googleAdsLogo from './assets/source-google-ads.svg';
import googleAnalyticsLogo from './assets/source-google-analytics.svg';
import metaLogo from './assets/source-meta.svg';
import shopifyLogo from './assets/source-shopify.svg';
import wooCommerceLogo from './assets/source-woocommerce.svg';
import type {
  PapaDataRuntimeLocale,
} from '../../../../design-system/foundations/runtime/index';

type AuthDataSource = {
  readonly label: string;
  readonly logo: string;
};

const dataSources = [
  {
    label: 'WooCommerce',
    logo: wooCommerceLogo,
  },
  {
    label: 'Shopify',
    logo: shopifyLogo,
  },
  {
    label: 'Google Ads',
    logo: googleAdsLogo,
  },
  {
    label: 'Meta Ads',
    logo: metaLogo,
  },
  {
    label: 'GA4',
    logo: googleAnalyticsLogo,
  },
] as const satisfies readonly AuthDataSource[];

export function AuthDataSourceMarquee({
  locale,
}: {
  readonly locale: PapaDataRuntimeLocale;
}) {
  return (
    <div className="pd-auth-source-marquee">
      <p className="pd-auth-source-marquee__label">
        {locale === 'en' ? 'Connected data sources' : 'Podłączone źródła danych'}
      </p>
      <div
        aria-label="WooCommerce, Shopify, Google Ads, Meta Ads, GA4"
        className="pd-auth-source-marquee__viewport"
        role="img"
      >
        <div aria-hidden="true" className="pd-auth-source-marquee__track">
          {[...dataSources, ...dataSources].map((source, index) => (
            <span
              className="pd-auth-source-marquee__item"
              key={`${source.label}-${index}`}
            >
              <img alt="" src={source.logo} />
              <span>{source.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
