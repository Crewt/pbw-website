import { Container } from "../../components/Container";
import { highlights } from "../data";

export function Highlights() {
  return (
    <section className="border-y border-line bg-bg-alt py-20">
      <Container>
        <h2 className="mb-12 text-center text-[34px] font-bold tracking-[-0.6px] text-ink max-[960px]:mb-10">
          Was Sie erwarten können
        </h2>
        <div className="grid grid-cols-3 gap-6 max-[960px]:grid-cols-1 max-[960px]:gap-10">
          {highlights.map((h) => {
            const Icon = h.icon;
            return (
              <div key={h.title} className="px-2 text-center">
                <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-line bg-bg text-navy shadow-[0_4px_20px_rgba(27,43,72,0.05)] [&_svg]:size-[30px]">
                  <Icon />
                </span>
                <h4 className="mb-2 text-[20px] font-bold text-navy">{h.title}</h4>
                <p className="mx-auto max-w-[320px] text-[15px] leading-[1.6] text-text">{h.text}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
