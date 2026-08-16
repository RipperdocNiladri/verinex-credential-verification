import type { AnalysisJob, VerificationReport } from '@workspace/api-client-react';

export const DEMO_ID = 'CT-2024-019';

export const demoReport: VerificationReport = {
  certificate: {
    certificateId: DEMO_ID,
    studentName: 'Ada Mensah',
    institution: 'University of Cape Coast',
    degree: 'BSc Computer Science',
    registrationNumber: 'UCC/CS/2024/019',
    issueDate: '2024-07-18',
    graduationYear: 2024,
    status: 'verified',
  },
  score: 100,
  status: 'verified',
  timestamp: '2026-08-16T06:00:00.000Z',
  signals: [
    { key: 'certificateId', label: 'Certificate ID', status: 'passed', detail: 'Certificate ID exists in the demo institutional registry.', points: 20, maxPoints: 20 },
    { key: 'institution', label: 'Institution', status: 'passed', detail: 'University of Cape Coast matches the registered issuer.', points: 20, maxPoints: 20 },
    { key: 'credentialData', label: 'Credential data', status: 'passed', detail: 'Name, degree, and registration data are consistent with the record.', points: 15, maxPoints: 15 },
    { key: 'qr', label: 'QR verification', status: 'passed', detail: 'QR payload matches the registered certificate identifier.', points: 15, maxPoints: 15 },
    { key: 'hash', label: 'Document integrity', status: 'passed', detail: 'SHA-256 hash matches the registered demo document.', points: 20, maxPoints: 20 },
    { key: 'date', label: 'Date consistency', status: 'passed', detail: 'Issue date and graduation year are internally consistent.', points: 5, maxPoints: 5 },
    { key: 'anomalies', label: 'Anomaly review', status: 'passed', detail: 'No high-severity rule-based anomalies were detected.', points: 5, maxPoints: 5 },
  ],
  findings: [
    { type: 'NO_HIGH_RISK_ANOMALIES', severity: 'LOW', message: 'No high-severity anomalies were found by the transparent MVP rules.' },
  ],
  documentHash: '9b91d1c7a4e22a4c6e8c4d9b7e2f8a1c5d3e0b6f6c4a1e2d8f3b5c7a9e0d1f2',
  explanation: [
    'Pass — Certificate ID exists in the demo institutional registry.',
    'Pass — University of Cape Coast matches the registered issuer.',
    'Pass — SHA-256 hash matches the registered demo document.',
  ],
};

export const demoSteps = (): AnalysisJob['steps'] => [
  { key: 'extract', label: 'Extract credential fields', status: 'complete' },
  { key: 'compare', label: 'Compare institutional signals', status: 'complete' },
  { key: 'integrity', label: 'Inspect document integrity', status: 'complete' },
  { key: 'explain', label: 'Build evidence summary', status: 'complete' },
];

export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return `local-${file.name.replace(/\W/g, '').slice(0, 24)}`;
}

export function savePending(value: unknown) {
  sessionStorage.setItem('creditrust-pending', JSON.stringify(value));
}

export function readPending<T>() {
  const raw = sessionStorage.getItem('creditrust-pending');
  return raw ? (JSON.parse(raw) as T) : null;
}

export function clearPending() {
  sessionStorage.removeItem('creditrust-pending');
}

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}