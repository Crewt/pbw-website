import type { ComponentType, SVGProps } from "react";
import {
  IconIndividual,
  IconCouple,
  IconCoaching,
  IconSupervision,
  IconOrg,
  IconEducation,
  IconShuffle,
  IconBlocks,
  IconAward,
} from "../components/Icons";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export interface Service {
  icon: IconType;
  title: string;
  description: string;
}

export const services: Service[] = [
  {
    icon: IconIndividual,
    title: "Einzelberatung",
    description:
      "Individuelle Begleitung in Krisen, bei Neuorientierung oder für die persönliche Entwicklung und Klarheit.",
  },
  {
    icon: IconCouple,
    title: "Paarberatung",
    description:
      "Unterstützung für Paare zur Klärung von Konflikten, Verbesserung der Kommunikation und Entwicklung neuer Perspektiven.",
  },
  {
    icon: IconCoaching,
    title: "Coaching",
    description:
      "Individuelle Unterstützung für Führungskräfte zur Stärkung der Führungskompetenz, Rollenklärung und Bewältigung komplexer Herausforderungen.",
  },
  {
    icon: IconSupervision,
    title: "Supervision",
    description:
      "Stärkung von Zusammenarbeit und Zusammenhalt im Team durch Klärung der Strukturen, Prozesse und Teamkultur sowie durch Förderung direkter Kommunikation.",
  },
  {
    icon: IconOrg,
    title: "Organisationsentwicklung",
    description:
      "Entwicklung der Organisation und Menschen zur Stärkung der Wirksamkeit - durch flexible, aktive Anpassung an Veränderungen für mehr Effektivität, bessere Zusammenarbeit und Arbeitszufriedenheit.",
  },
  {
    icon: IconEducation,
    title: "Weiterbildung",
    description:
      "Unterstützung im bewussten Umgang mit eigenen Ressourcen und Grenzen sowie Förderung der Selbstreflexion zu authentischen Beziehungen und einer stimmigen persönlichen Haltung.",
  },
];

export interface Highlight {
  icon: IconType;
  title: string;
  text: string;
}

export const highlights: Highlight[] = [
  {
    icon: IconShuffle,
    title: "Handwerkzeug für den Alltag",
    text: "Praxisnahe Werkzeuge für die sofortige Anwendung in Ihrem beruflichen und privaten Kontext.",
  },
  {
    icon: IconBlocks,
    title: "Praxisorientierte Analyse",
    text: "Klare, anschlussfähige Prozesse basierend auf den Modellen der Transaktionsanalyse.",
  },
  {
    icon: IconAward,
    title: "Langjährige Expertise",
    text: "Zertifizierte Lehrtrainerin und Supervisorin mit umfangreicher Erfahrung im (Non-)Profit-Bereich.",
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  org: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "Die Arbeit mit Frau Czekalla zeichnet sich durch eine bemerkenswerte Klarheit aus. Die transaktionsanalytischen Konzepte wurden so vermittelt, dass wir als Führungsteam sofort handlungsfähiger wurden und festgefahrene Kommunikationsmuster auflösen konnten.",
    name: "Geschäftsführung",
    org: "Mittelständisches IT-Unternehmen",
  },
  {
    quote:
      "Die Supervision hat unserem Team geholfen, Konflikte konstruktiv anzugehen und wieder mit Freude und Vertrauen zusammenzuarbeiten. Ein echter Wendepunkt.",
    name: "Teamleitung",
    org: "Sozialer Träger, Hamburg",
  },
  {
    quote:
      "In der Einzelberatung habe ich Klarheit über meine nächsten beruflichen Schritte gewonnen - wertschätzend, strukturiert und immer auf den Punkt.",
    name: "Führungskraft",
    org: "Industrieunternehmen, NRW",
  },
  {
    quote:
      "Die Weiterbildung in Transaktionsanalyse war fundiert, praxisnah und zutiefst menschlich. Ich nehme Werkzeuge mit, die ich täglich anwende.",
    name: "Weiterbildungsteilnehmerin",
    org: "Beraterin i. A.",
  },
];

export const badges = ["DGTA", "EATA", "EASC"];
