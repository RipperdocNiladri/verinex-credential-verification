import { Check, CircleDot, FileCheck2, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAnalyzeCredential, useVerifyCredential, type AnalysisJob, type VerificationReport } from '@workspace/api-client-react';
import { BrandMark } from '@/components/app-shell';
import { clearPending, demoReport, demoSteps, readPending } from '@/lib/credential';

type Pending = { mode: 'demo' | 'upload'; uploadId?: string; certificateId: string; fileName: string; fileSize: number; mimeType: string; fileHash: string };
type DisplayStep = { key: string; label: string; detail: string; status: 'pending' | 'processing' | 'complete' };

const initialSteps: DisplayStep[] = [
  { key: 'extract', label: 'Extract credential fields', detail: 'Reading identity, award, and date fields', status: 'processing' },
  { key: 'compare', label: 'Compare institutional signals', detail: 'Checking the issuing institution reference', status: 'pending' },
  { key: 'integrity', label: 'Inspect document integrity', detail: 'Looking for unexpected edits and anomalies', status: 'pending' },
  { key: 'explain', label: 'Build evidence summary', detail: 'Preparing the reviewer handoff', status: 'pending' },
];

export default function Processing() {
  const [, setLocation] = useLocation();
  const pending = useMemo<Pending>(() => readPending<Pending>() ?? { mode: 'demo', certificateId: 'CT-2024-019', fileName: 'demo-record.pdf', fileSize: 0, mimeType: 'application/pdf', fileHash: demoReport.documentHash }, []);
  const [steps, setSteps] = useState(initialSteps);
  const [message, setMessage] = useState('Opening the document safely');
  const [error, setError] = useState('');
  const analyze = useAnalyzeCredential();
  const verify = useVerifyCredential();

  useEffect(() => {
    let cancelled = false;
    const finish = (report: VerificationReport) => {
      if (cancelled) return;
      sessionStorage.setItem('creditrust-report', JSON.stringify(report));
      clearPending();
      setTimeout(() => setLocation(`/report/${report.certificate.certificateId}`), 500);
    };
    const advance = (index: number, text: string) => setTimeout(() => {
      if (cancelled) return;
      setSteps((current) => current.map((step, stepIndex) => ({ ...step, status: stepIndex < index ? 'complete' : stepIndex === index ? 'processing' : 'pending' })));
      setMessage(text);
    }, index * 650);

    if (pending.mode === 'demo') {
      const timers = [advance(0, 'Opening the document safely'), advance(1, 'Comparing against institutional signals'), advance(2, 'Inspecting document integrity'), advance(3, 'Writing the evidence summary')];
      const finalTimer = setTimeout(() => {
        setSteps(demoSteps().map((step) => ({ ...step, detail: 'Signal reviewed and recorded', status: 'complete' })));
        setMessage('Evidence summary ready');
        finish(demoReport);
      }, 3200);
      return () => { cancelled = true; timers.forEach(clearTimeout); clearTimeout(finalTimer); };
    }

    const fail = (text: string) => {
      if (cancelled) return;
      setError(text);
    };
    if (!pending.uploadId) {
      fail('This upload session is missing. Return to Verify Credential and start again.');
      return () => { cancelled = true; };
    }
    analyze.mutate({ data: { uploadId: pending.uploadId } }, {
      onSuccess: (job: AnalysisJob) => {
        if (cancelled) return;
        const serverSteps = job.steps ?? [];
        setSteps((current) => current.map((step, index) => ({ ...step, status: serverSteps[index]?.status === 'complete' ? 'complete' : index === 0 ? 'processing' : 'pending' })));
        setMessage('Analysis engine is checking the record');
        setTimeout(() => {
          if (cancelled) return;
           verify.mutate({ data: { certificateId: pending.certificateId, uploadId: pending.uploadId, fileHash: pending.fileHash } }, { onSuccess: finish, onError: () => fail('The verification service could not complete this report. Your document was not marked as verified.') });
        }, 1800);
      },
       onError: () => fail('The analysis service could not receive this upload. Please try again.'),
    });
    return () => { cancelled = true; };
  }, []);

  const completed = steps.filter((step) => step.status === 'complete').length;
  if (error) return <div className="min-h-[100dvh] px-5 py-8 md:px-10 md:py-12"><div className="mx-auto max-w-xl text-center"><Link href="/verify" className="flex items-center justify-center gap-2.5"><BrandMark /><span className="font-semibold">CrediTrust</span></Link><div className="mt-24 rounded-2xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--card))] p-8"><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[hsl(var(--destructive))]">Analysis stopped</p><h1 className="mt-4 font-display text-5xl tracking-[-.03em]">No decision was made.</h1><p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{error}</p><Link href="/verify" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))]">Return to verification</Link></div></div></div>;
  return <div className="min-h-[100dvh] px-5 py-8 md:px-10 md:py-12"><div className="mx-auto max-w-3xl"><div className="mb-20 flex items-center justify-between"><Link href="/" className="flex items-center gap-2.5" data-testid="link-processing-brand"><BrandMark /><span className="font-semibold">CrediTrust</span></Link><span className="font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Secure analysis</span></div><div className="mb-12 text-center"><span className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><ShieldCheck size={30} /></span><p className="mb-3 font-mono-ui text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">Analysis in progress</p><h1 className="font-display text-5xl tracking-[-.035em] md:text-6xl">Reading the evidence.</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">{message}. No decision is made from a single signal.</p></div><div className="mb-8 h-1 overflow-hidden rounded-full bg-[hsl(var(--secondary))]"><div className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-700" style={{ width: `${Math.max(10, completed / steps.length * 100)}%` }} /></div><div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">{steps.map((step) => <div key={step.key} className="flex items-center gap-4 border-b border-[hsl(var(--border))] p-5 last:border-0 md:px-7"><span className={`grid size-9 shrink-0 place-items-center rounded-xl ${step.status === 'complete' ? 'bg-[hsl(157_42%_89%)] text-[hsl(161_54%_25%)]' : step.status === 'processing' ? 'bg-[hsl(var(--accent)/.25)] text-[hsl(var(--foreground))]' : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]'}`}>{step.status === 'complete' ? <Check size={17} /> : step.status === 'processing' ? <LoaderCircle size={17} className="animate-spin" /> : <CircleDot size={17} />}</span><div className="min-w-0 flex-1"><p className={`text-sm font-semibold ${step.status === 'pending' ? 'text-[hsl(var(--muted-foreground))]' : ''}`}>{step.label}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{step.detail}</p></div>{step.status === 'complete' && <span className="font-mono-ui text-[10px] uppercase tracking-wider text-[hsl(var(--primary))]">Recorded</span>}</div>)}</div><div className="mt-6 flex items-center justify-center gap-2 font-mono-ui text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><FileCheck2 size={13} /> {pending.fileName} <span className="text-[hsl(var(--border))]">·</span> {pending.mode === 'demo' ? 'Demo record' : 'Local upload'}</div></div></div>;
}