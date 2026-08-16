import { ArrowUpRight, BookOpen, ChevronRight, FileCheck2, LayoutDashboard, Menu, ShieldCheck, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';

const navItems = [
  { href: '/', label: 'Overview', icon: BookOpen },
  { href: '/verify', label: 'Verify a credential', icon: FileCheck2 },
  { href: '/dashboard', label: 'Activity', icon: LayoutDashboard },
];

export function BrandMark() {
  return <span className="grid size-8 place-items-center rounded-[10px] bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"><ShieldCheck size={18} strokeWidth={2.5} /></span>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLanding = location === '/';

  if (isLanding) {
    return <div className="grain min-h-[100dvh]">{children}</div>;
  }

  return (
    <div className="grain min-h-[100dvh] bg-[hsl(var(--background))]">
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border)/.8)] bg-[hsl(var(--background)/.9)] backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5" data-testid="link-brand-mobile"><BrandMark /><span className="font-semibold tracking-[-.02em]">CrediTrust</span></Link>
          <button onClick={() => setMobileOpen((value) => !value)} className="rounded-lg p-2 text-[hsl(var(--muted-foreground))]" aria-label="Toggle navigation" data-testid="button-toggle-navigation">{mobileOpen ? <X size={21} /> : <Menu size={21} />}</button>
        </div>
        {mobileOpen && <nav className="border-t border-[hsl(var(--border))] px-3 py-3">{navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${location === href ? 'bg-[hsl(var(--sidebar-accent))] font-semibold text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid={`link-mobile-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon size={17} />{label}</Link>)}</nav>}
      </header>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-[hsl(var(--sidebar))] px-4 py-5 text-[hsl(var(--sidebar-foreground))] lg:flex">
        <Link href="/" className="mb-12 flex items-center gap-2.5 px-2" data-testid="link-brand"><BrandMark /><span className="font-semibold tracking-[-.02em]">CrediTrust</span></Link>
        <div className="mb-3 px-2 font-mono-ui text-[10px] uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.48)]">Workspace</div>
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${location === href ? 'bg-[hsl(var(--sidebar-accent))] font-semibold text-[hsl(var(--sidebar-accent-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.7)] hover:bg-[hsl(var(--sidebar-accent)/.65)] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}><span className="flex items-center gap-3"><Icon size={17} />{label}</span>{location === href && <ChevronRight size={15} />}</Link>)}
        </nav>
        <div className="mt-auto rounded-2xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent)/.55)] p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold"><span className="size-2 rounded-full bg-[hsl(var(--sidebar-primary))] pulse-soft" />Demo environment</div>
          <p className="text-xs leading-relaxed text-[hsl(var(--sidebar-foreground)/.58)]">Institutional matches are illustrative until production registry access is connected.</p>
          <Link href="/how-it-works" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--sidebar-primary))]" data-testid="link-sidebar-how-it-works">How it works <ArrowUpRight size={13} /></Link>
        </div>
      </aside>
      <main className="min-h-[100dvh] lg:pl-[248px]">{children}</main>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-2 font-mono-ui text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">{eyebrow}</p><h1 className="font-display text-5xl leading-[.95] tracking-[-.035em] text-[hsl(var(--foreground))] md:text-6xl">{title}</h1>{description && <p className="mt-4 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{description}</p>}</div>{action}</div>;
}

export function StatusPill({ status }: { status: string }) {
  const tone = status === 'verified' || status === 'passed' || status === 'complete' ? 'bg-[hsl(157_42%_89%)] text-[hsl(161_54%_25%)]' : status === 'suspicious' || status === 'attention' || status === 'processing' ? 'bg-[hsl(40_91%_88%)] text-[hsl(31_74%_31%)]' : 'bg-[hsl(4_74%_92%)] text-[hsl(4_61%_37%)]';
  const label = status === 'likelyAuthentic' ? 'Likely authentic' : status === 'notChecked' ? 'Not checked' : status;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono-ui text-[10px] uppercase tracking-[.08em] ${tone}`} data-testid={`status-${status}`}>{label}</span>;
}