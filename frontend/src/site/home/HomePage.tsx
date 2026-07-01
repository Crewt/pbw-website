import { Hero } from "./sections/Hero";
import { Services } from "./sections/Services";
import { Highlights } from "./sections/Highlights";
import { Testimonials } from "./sections/Testimonials";

export function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Highlights />
      <Testimonials />
    </>
  );
}
