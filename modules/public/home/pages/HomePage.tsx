import PublicShell from "@/common/components/PublicShell";
import JsonLd from "@/common/components/JsonLd";
import { getSiteUrl } from "@/common/utils/site";
import HomeHero from "../components/HomeHero";
import FeatureGrid from "../components/FeatureGrid";
import ArchitectureSection from "../components/ArchitectureSection";
import QuickStartSection from "../components/QuickStartSection";
import { getHomePageData } from "../home.queries";

export default async function HomePage() {
  const { stats } = await getHomePageData();
  const siteUrl = getSiteUrl();

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "trcodes Enterprise Starter Boilerplate",
    operatingSystem: "All",
    applicationCategory: "BusinessApplication",
    url: siteUrl,
    description:
      "Enterprise Next.js 16 App Router boilerplate with Dynamic RBAC, Enterprise TOTP MFA, Strict Nonce CSP, PostgreSQL UUIDv7, and automated CLI scaffolding.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <PublicShell>
      <JsonLd data={websiteSchema} />
      <HomeHero stats={stats} />
      <FeatureGrid />
      <ArchitectureSection />
      <QuickStartSection />
    </PublicShell>
  );
}
