import { AlertCircle, ArrowRight, Check, FileText, Hash, LoaderCircle, Sparkles, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useUploadCredential } from '@workspace/api-client-react';
import { BrandMark, PageHeader } from '@/components/app-shell';
import { DEMO_ID, demoReport, formatBytes, hashFile, savePending } from '@/lib/credential';

export default function Verify() {
  const [, setLocation] = useLocation();
  const upload = useUploadCredential();
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState('');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  async function chooseFile(nextFile: File | undefined) {
    if (!nextFile) return;
    if (nextFile.size > 15 * 1024 * 1024) { setError('That file is larger than 15 MB. Choose a smaller document.'); return; }
    if (!['application/pdf', 'image/png', 'image/jpeg'].includes(nextFile.type)) { setError('Upload a PDF, PNG, or JPEG credential document.'); return; }
    setError('');
    setFile(nextFile);
    setHash(await hashFile(nextFile));
  }

  function startDemo() {
    savePending({ mode: 'demo', certificateId: DEMO_ID, fileName: 'ada-mensah-degree.pdf', fileSize: 184320, mimeType: 'application/pdf', fileHash: demoReport.documentHash });
    setLocation('/processing');
  }

  async function submit() {
    if (!file || upload.isPending) return;
    setError('');
    upload.mutate({ data: { file: file.name.replace(/[^\w.-]/g, '-'), fileSize: file.size, mimeType: file.type, fileHash: hash } }, {
      onSuccess: (receipt) => {
        savePending({ mode: 'upload', uploadId: receipt.uploadId, certificateId: receipt.uploadId, fileName: receipt.fileName, fileSize: receipt.fileSize, mimeType: receipt.mimeType, fileHash: hash });
        setLocation('/processing');
      },
         onError: () => setError('We could not receive this document. Check your connection and try again.'),
    });
  }

  return <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12"><div className="mb-10 flex items-center justify-between lg:hidden"><Link href="/" className="flex items-center gap-2.5" data-testid="link-verify-brand"><BrandMark /><span className="font-semibold">CrediTrust</span></Link><span className="font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Step 01 / 03</span></div><PageHeader eyebrow="New verification" title="Bring the record." description="Upload a credential document, or explore a prepared demo record to see the full evidence trail." action={<span className="hidden font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] lg:block">Step 01 / 03</span>} />
    <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-sm)] md:p-8">
        <div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); void chooseFile(event.dataTransfer.files[0]); }} className={`relative flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition-colors ${dragging ? 'border-[hsl(var(--primary))] bg-[hsl(var(--secondary)/.5)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--background)/.6)]'}`}>
          {file ? <><span className="mb-5 grid size-14 place-items-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><FileText size={25} /></span><p className="max-w-xs truncate text-sm font-semibold" data-testid="text-selected-file">{file.name}</p><p className="mt-2 font-mono-ui text-[10px] text-[hsl(var(--muted-foreground))]">{formatBytes(file.size)} · {file.type === 'application/pdf' ? 'PDF' : file.type.split('/')[1].toUpperCase()}</p><button onClick={() => { setFile(null); setHash(''); }} className="mt-5 text-xs font-semibold text-[hsl(var(--primary))] underline-offset-4 hover:underline" data-testid="button-remove-file">Choose another</button></> : <><span className="mb-5 grid size-14 place-items-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><UploadCloud size={25} /></span><p className="text-base font-semibold">Drop a credential here</p><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">PDF, PNG, or JPEG · up to 15 MB</p><label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[hsl(var(--secondary))]" data-testid="label-choose-file">Browse files<input type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" className="sr-only" onChange={(event) => void chooseFile(event.target.files?.[0])} data-testid="input-credential-file" /></label></>}
        </div>
        {file && <div className="mt-4 flex items-center gap-2 rounded-lg bg-[hsl(var(--secondary)/.6)] px-3 py-2 font-mono-ui text-[10px] text-[hsl(var(--muted-foreground))]" data-testid="text-file-hash"><Hash size={13} className="text-[hsl(var(--primary))]" /> Local hash created · {hash}</div>}
        {error && <div className="mt-4 flex items-start gap-2 rounded-lg border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.07)] p-3 text-xs leading-5 text-[hsl(var(--destructive))]" role="alert" data-testid="status-upload-error"><AlertCircle size={15} className="mt-0.5 shrink-0" />{error}</div>}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button onClick={submit} disabled={!file || upload.isPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-submit-upload">{upload.isPending ? <><LoaderCircle size={16} className="animate-spin" /> Receiving document</> : <>Analyze this document <ArrowRight size={16} /></>}</button></div>
      </div>
      <aside className="space-y-4">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.72)] p-5"><p className="mb-4 font-mono-ui text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">What happens next</p><ol className="space-y-4">{['Receive and hash locally', 'Extract and compare signals', 'Return an explainable score'].map((item, index) => <li key={item} className="flex gap-3 text-sm"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-[hsl(var(--secondary))] font-mono-ui text-[10px] text-[hsl(var(--primary))]">{index + 1}</span><span className="pt-1">{item}</span></li>)}</ol></div>
         <div className="rounded-2xl border border-[hsl(var(--accent)/.5)] bg-[hsl(var(--accent)/.12)] p-5"><div className="mb-3 flex items-center gap-2 text-sm font-semibold"><SparkleIcon /><span>Try the guided demo</span></div><p className="text-xs leading-5 text-[hsl(var(--muted-foreground))]">Review Ada Mensah’s University of Cape Coast credential with a complete evidence trail.</p><button onClick={startDemo} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[hsl(var(--foreground))] underline-offset-4 hover:underline" data-testid="button-start-demo">Open demo record <ArrowRight size={13} /></button></div>
        <p className="flex items-center gap-2 px-1 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]"><Check size={13} className="text-[hsl(var(--primary))]" /> Documents are represented by a browser-generated hash in this MVP.</p>
      </aside>
    </div>
  </div>;
}

function SparkleIcon() { return <span className="grid size-6 place-items-center rounded-lg bg-[hsl(var(--accent))]"><Sparkles size={13} /></span>; }