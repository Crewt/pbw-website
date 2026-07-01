import { Hero } from "./sections/Hero";
import { Services } from "./sections/Services";
import { Highlights } from "./sections/Highlights";
import { Testimonials } from "./sections/Testimonials";
import { Seo, SITE_TITLE, SITE_DESCRIPTION } from "../lib/Seo";

export function HomePage() {
  return (
    <>
      <Seo title={SITE_TITLE} description={SITE_DESCRIPTION} />
      <Hero />
      <Services />
      <Highlights />
      <Testimonials />
    </>
  );
}
