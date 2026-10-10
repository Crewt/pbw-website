import { Hero } from "./sections/Hero";
import { Services } from "./sections/Services";
import { Highlights } from "./sections/Highlights";
import { Testimonials } from "./sections/Testimonials";
import { Seo, HOME_TITLE, SITE_DESCRIPTION } from "../lib/Seo";

export function HomePage() {
  return (
    <>
      <Seo title={HOME_TITLE} description={SITE_DESCRIPTION} />
      <Hero />
      <Services />
      <Highlights />
      <Testimonials />
    </>
  );
}
