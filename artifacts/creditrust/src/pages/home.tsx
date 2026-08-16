import { ArrowRight, Check, FileSearch, LockKeyhole, Sparkles, Waves } from 'lucide-react';
import { useHealthCheck } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { BrandMark } from '@/components/app-shell';

export default function Home() {
  const health = useHealthCheck();
  return (
    <div className="overflow-hidden">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Link href="/" className="flex items-center gap-2.5" data-testid="link-home-brand"><BrandMark /><span className="font-semibold tracking-[-.025em]">CrediTrust</span></Link>
        <nav className="hidden items-center gap-7 text-sm text-[hsl(var(--muted-foreground))] md:flex">
          <Link href="/how-it-works" className="transition-colors hover:text-[hsl(var(--foreground))]" data-testid="link-home-how-it-works">How it works</Link>
          <Link href="/about" className="transition-colors hover:text-[hsl(var(--foreground))]" data-testid="link-home-about">About</Link>
          <Link href="/dashboard" className="transition-colors hover:text-[hsl(var(--foreground))]" data-testid="link-home-dashboard">Activity</Link>
        </nav>
        <Link href="/verify" className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--foreground))] px-4 py-2.5 text-xs font-semibold text-[hsl(var(--background))] transition-transform hover:-translate-y-0.5" data-testid="link-home-verify">Verify a credential <ArrowRight size={14} /></Link>
      </header>

      <main>
        <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
          <div className="pointer-events-none absolute -right-24 top-8 size-[420px] rounded-full bg-[hsl(var(--accent)/.2)] blur-3xl" />
          <div className="relative grid items-center gap-14 lg:grid-cols-[1fr_440px]">
            <div className="max-w-3xl">
              <div className="fade-up mb-7 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/.65)] px-3 py-1.5 font-mono-ui text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]"><span className="size-1.5 rounded-full bg-[hsl(var(--primary))]" /> Evidence before confidence</div>
              <h1 className="fade-up fade-up-delay-1 font-display text-[clamp(4rem,9vw,8.2rem)] leading-[.82] tracking-[-.055em] text-[hsl(var(--foreground))]">Make the<br /><em className="text-[hsl(var(--primary))]">record</em> clear.</h1>
              <p className="fade-up fade-up-delay-2 mt-8 max-w-lg text-lg leading-8 text-[hsl(var(--muted-foreground))]">CrediTrust turns an uncertain academic document into a decision you can explain, defend, and share.</p>
              <div className="fade-up fade-up-delay-3 mt-9 flex flex-wrap items-center gap-3">
                <Link href="/verify" className="group inline-flex items-center gap-3 rounded-xl bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-md)] transition-transform hover:-translate-y-0.5" data-testid="link-hero-start">Start a verification <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link>
                <Link href="/how-it-works" className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.55)] px-5 py-3.5 text-sm font-semibold transition-colors hover:bg-[hsl(var(--secondary))]" data-testid="link-hero-learn">See the workflow</Link>
              </div>
              <div className="mt-8 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]"><span className={`size-1.5 rounded-full ${health.isError ? 'bg-[hsl(var(--destructive))]' : 'bg-[hsl(var(--primary))]'}`} /> {health.isError ? 'Demo environment' : 'Verification engine online'}</div>
            </div>
            <div className="relative mx-auto w-full max-w-[440px] lg:mr-0">
              <div className="absolute -left-6 top-12 hidden w-36 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.92)] p-3 shadow-[var(--shadow-sm)] sm:block">
                <div className="mb-2 flex items-center justify-between"><span className="font-mono-ui text-[9px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Signal</span><Check size={13} className="text-[hsl(var(--primary))]" /></div>
                <p className="text-xs font-semibold">Institution match</p><p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">Evidence found</p>
              </div>
              <div className="rounded-[28px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-[0_24px_80px_-36px_hsl(194_36%_16%/.35)]">
                <div className="rounded-[21px] bg-[hsl(var(--sidebar))] p-6 text-[hsl(var(--sidebar-foreground))]">
                  <div className="mb-12 flex items-center justify-between"><div className="flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.16em] text-[hsl(var(--sidebar-foreground)/.65)]"><LockKeyhole size={14} /> Credential review</div><span className="rounded-full bg-[hsl(var(--sidebar-accent))] px-2 py-1 font-mono-ui text-[9px] text-[hsl(var(--sidebar-primary))]">LIVE</span></div>
                  <div className="mb-2 font-mono-ui text-[10px] uppercase tracking-[.16em] text-[hsl(var(--sidebar-foreground)/.48)]">Trust score</div>
                  <div className="flex items-end gap-3"><span className="font-display text-8xl leading-none text-[hsl(var(--sidebar-primary))]">94</span><span className="mb-2 font-mono-ui text-xs text-[hsl(var(--sidebar-foreground)/.5)]">/ 100</span></div>
                  <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--sidebar-accent))]"><div className="h-full w-[94%] rounded-full bg-[hsl(var(--sidebar-primary))]" /></div>
                  <div className="mt-8 space-y-3 border-t border-[hsl(var(--sidebar-border))] pt-5">{['Identity & enrollment', 'Institutional record', 'Document integrity'].map((item) => <div className="flex items-center justify-between text-xs" key={item}><span className="text-[hsl(var(--sidebar-foreground)/.68)]">{item}</span><span className="flex items-center gap-1.5 text-[hsl(var(--sidebar-primary))]"><Check size={13} /> Pass</span></div>)}</div>
                </div>
              </div>
              <div className="absolute -bottom-7 -right-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 shadow-[var(--shadow-sm)]"><div className="flex items-center gap-2 text-xs font-semibold"><span className="grid size-6 place-items-center rounded-lg bg-[hsl(var(--secondary))]"><FileSearch size={13} className="text-[hsl(var(--primary))]" /></span> Explainable by design</div></div>
            </div>
          </div>
        </section>

        <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--card)/.45)]">
          <div className="mx-auto grid max-w-7xl divide-y border-x border-[hsl(var(--border))] md:grid-cols-3 md:divide-x md:divide-y-0">
            {[{ icon: FileSearch, title: 'Read the document', body: 'Extract the facts that matter, without burying reviewers in raw OCR.' }, { icon: Waves, title: 'Trace the signals', body: 'Compare identity, institution, timeline, and document integrity.' }, { icon: Sparkles, title: 'Make the call', body: 'Get a score with the evidence and caveats attached.' }].map(({ icon: Icon, title, body }, index) => <div className="p-7 md:p-9" key={title}><span className="mb-8 grid size-9 place-items-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><Icon size={18} /></span><div className="mb-2 font-mono-ui text-[10px] text-[hsl(var(--muted-foreground))]">0{index + 1}</div><h2 className="text-lg font-semibold">{title}</h2><p className="mt-2 max-w-xs text-sm leading-6 text-[hsl(var(--muted-foreground))]">{body}</p></div>)}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="grid gap-12 md:grid-cols-[.7fr_1fr] md:items-end"><div><p className="mb-3 font-mono-ui text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">For careful teams</p><h2 className="font-display text-5xl leading-none tracking-[-.035em] md:text-6xl">A second pair of eyes<br /><em>with a paper trail.</em></h2></div><p className="max-w-md text-base leading-7 text-[hsl(var(--muted-foreground))]">Recruiters, admissions teams, and compliance reviewers use CrediTrust when “looks right” is not enough. Every result keeps the reasoning close to the decision.</p></div>
          <div className="mt-14 grid gap-4 md:grid-cols-2"><div className="rounded-2xl bg-[hsl(var(--primary))] p-8 text-[hsl(var(--primary-foreground))] md:p-10"><p className="font-mono-ui text-[10px] uppercase tracking-[.16em] text-[hsl(var(--primary-foreground)/.62)]">A clearer handoff</p><p className="mt-14 max-w-sm font-display text-4xl leading-[1.02]">“Here’s what we found, and here’s what we could not verify.”</p></div><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 md:p-10"><p className="font-mono-ui text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Always visible</p><ul className="mt-10 space-y-5">{['What the document says', 'Which signals support it', 'Where uncertainty remains'].map((item) => <li key={item} className="flex items-center gap-3 text-sm"><span className="grid size-6 place-items-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><Check size={14} /></span>{item}</li>)}</ul></div></div>
        </section>
      </main>
      <footer className="border-t border-[hsl(var(--border))]"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-xs text-[hsl(var(--muted-foreground))] md:flex-row md:items-center md:justify-between md:px-8"><span>CrediTrust / academic verification workspace</span><span className="font-mono-ui text-[10px] uppercase tracking-wider">Demo records clearly marked</span></div></footer>
    </div>
  );
}