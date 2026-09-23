import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Container } from "../components/Container";
import { getContent } from "../../lib/api";
import type { Kollege, Ressource, Zertifikat } from "../../lib/types";
import { resolveImg } from "../lib/img";
import { safeHref } from "../../lib/url";
import { IconArrowUpRight, IconDownload, IconInstitute, IconLink } from "../components/Icons";
import { Seo, SITE_NAME } from "../lib/Seo";

const FALLBACK_HEADER_BG = "/assets/header-bg.webp";

function initials(name: string): string {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();
}

function SectionTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mb-8 flex items-center gap-6 ${className}`}>
      <span className="h-px flex-1 bg-line" />
      <h2 className="text-center text-[26px] font-bold text-ink">{children}</h2>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

const rowCls =
  "flex items-center gap-4 rounded-[10px] border border-line bg-white px-6 py-[18px] transition hover:-translate-y-px hover:border-navy hover:shadow-soft";
const goCls = "inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold tracking-[0.4px] text-navy [&_svg]:size-3";

function Row({
  href,
  download,
  icon,
  title,
  subtitle,
  action,
}: {
  href?: string;
  download?: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const inner = (
    <>
      {icon}
      <div className="min-w-0 flex-1">
        <h4 className="text-[16px] font-bold text-navy">{title}</h4>
        {subtitle && <p className="mt-1 text-sm leading-[1.45] text-text">{subtitle}</p>}
      </div>
      {action}
    </>
  );
  const safe = safeHref(href);
  if (safe) {
    return (
      <a className={rowCls} href={safe} {...(download ? { download } : { target: "_blank", rel: "noopener noreferrer" })}>
        {inner}
      </a>
    );
  }
  return <div className={rowCls}>{inner}</div>;
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className={rowCls}>
      <p className="text-sm text-text">{text}</p>
    </div>
  );
}

function InstitutionCard({ z }: { z: Zertifikat }) {
  const img = resolveImg(z.image);
  return (
    <article className="rounded-xl border border-line bg-white px-8 py-7 transition hover:-translate-y-0.5 hover:border-navy hover:shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <span className="icon-chip overflow-hidden">
          {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <IconInstitute />}
        </span>
        {z.badge && (
          <span className="rounded-full bg-accent-soft/60 px-3 py-1 text-xs font-medium text-navy">{z.badge}</span>
        )}
      </div>
      <h3 className="mb-3 text-[18px] font-bold leading-[1.35] text-navy">{z.name}</h3>
      {z.description && <p className="mb-5 text-[15px] leading-[1.55] text-text">{z.description}</p>}
      {safeHref(z.link) && (
        <a
          href={safeHref(z.link)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium tracking-[0.6px] text-navy transition-all hover:gap-2.5 [&_svg]:size-3"
        >
          Website besuchen <IconArrowUpRight />
        </a>
      )}
    </article>
  );
}

function KollegeRow({ k }: { k: Kollege }) {
  const img = resolveImg(k.image);
  const avatar = (
    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft/50 text-navy">
      {img ? (
        <img src={img} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="text-[15px] font-bold text-navy">{initials(k.name)}</span>
      )}
    </span>
  );
  const subtitle = [k.role, k.bio].filter(Boolean).join(" — ");
  return (
    <Row
      icon={avatar}
      title={k.name}
      subtitle={subtitle || undefined}
      href={k.link || undefined}
      action={
        k.link ? (
          <span className={goCls}>
            Profil ansehen <IconArrowUpRight />
          </span>
        ) : undefined
      }
    />
  );
}

function RessourceRow({ r }: { r: Ressource }) {
  const isDownload = r.type === "download";
  const href = isDownload ? r.file?.url || "" : r.url;
  const available = !!href;
  const icon = (
    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-soft/50 text-navy [&_svg]:size-5">
      {isDownload ? <IconDownload /> : <IconLink />}
    </span>
  );
  const action = available ? (
    <span className={goCls}>
      {isDownload ? (
        <>
          Download <IconDownload />
        </>
      ) : (
        <>
          Öffnen <IconArrowUpRight />
        </>
      )}
    </span>
  ) : (
    <span className="shrink-0 text-[13px] font-semibold tracking-[0.4px] text-navy/50">
      {isDownload ? "Download folgt" : "Link folgt"}
    </span>
  );
  return (
    <Row
      icon={icon}
      title={r.title}
      subtitle={r.description || undefined}
      href={available ? href : undefined}
      download={isDownload && available ? r.file?.name || "download" : undefined}
      action={action}
    />
  );
}

export function EmpfehlungenPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ["content"], queryFn: getContent });
  const headerBg = data?.bilder?.headerBg || FALLBACK_HEADER_BG;

  return (
    <>
      <Seo
        title={`Empfehlungen & Netzwerk | ${SITE_NAME}`}
        description="Empfehlungen, Kolleg:innen und Zertifizierungen im Netzwerk von PBW – Beatrice Czekalla."
      />
      <section className="relative overflow-hidden py-20 text-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.18]"
          style={{ backgroundImage: `url(${JSON.stringify(headerBg)})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(249,249,249,0.7)_0%,rgba(249,249,249,1)_100%)]" />
        <Container>
          <div className="relative z-[1]">
            { /*<span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-[13px] font-medium text-navy [&_svg]:size-3.5">
              <IconNetwork /> Netzwerk &amp; Austausch
            </span> */}
            <h1 className="my-4 text-[48px] font-bold leading-[1.05] tracking-[-1px] text-ink max-[960px]:text-[36px]">
              Kooperation &amp; Austausch
            </h1>
            <p className="mx-auto max-w-[720px] text-[17px] leading-[1.55] text-text">
              Ein vertrauensvolles Netzwerk ist das Fundament professioneller Begleitung. Hier finden Sie Institutionen und geschätzte Kolleg:innen, mit denen ich aufgrund ihrer fachlichen Qualität und menschlichen Integrität gern zusammenarbeite, sowie wertvolle Ressourcen, die ich empfehle.
            </p>
          </div>
        </Container>
      </section>

      <Container className="pb-20">
        {isLoading ? (
          <p className="py-16 text-center text-slate">Inhalte werden geladen…</p>   
        ) : isError || !data ? (
          <p className="py-16 text-center text-text">Die Inhalte konnten derzeit nicht geladen werden.</p>
        ) : (
          <>
            <SectionTitle>Fachgesellschaften & Institutionen</SectionTitle>
            {data.zertifikate.length > 0 ? (
              <div className="grid grid-cols-2 gap-6 max-[960px]:grid-cols-1">
                {data.zertifikate.map((z) => (
                  <InstitutionCard key={z.id} z={z} />
                ))}
              </div>
            ) : (
              <EmptyRow text="Aktuell sind keine Einträge vorhanden." />
            )}

            <SectionTitle className="mt-20">Kolleginnen &amp; Kollegen</SectionTitle>
            <div className="flex flex-col gap-3">
              {data.kollegen.length > 0 ? (
                data.kollegen.map((k) => <KollegeRow key={k.id} k={k} />)
              ) : (
                <EmptyRow text="Aktuell sind keine Einträge vorhanden." />
              )}
            </div>

            <SectionTitle className="mt-20">Weiterführende Ressourcen</SectionTitle>
            <div className="flex flex-col gap-3">
              {data.ressourcen.length > 0 ? (
                data.ressourcen.map((r) => <RessourceRow key={r.id} r={r} />)
              ) : (
                <EmptyRow text="Aktuell sind keine Ressourcen vorhanden." />
              )}
            </div>
          </>
        )}
      </Container>
    </>
  );
}
