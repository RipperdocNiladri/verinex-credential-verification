import { createHash, randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import {
  AnalyzeCredentialBody,
  AnalyzeCredentialResponse,
  GetDashboardStatsResponse,
  GetCredentialParams,
  GetCredentialResponse,
  GetRecentCredentialsResponse,
  UploadCredentialBody,
  UploadCredentialResponse,
  VerifyCredentialBody,
  VerifyCredentialResponse,
} from "@workspace/api-zod";

type RegistryStatus = "verified" | "suspicious" | "invalid";
type SignalStatus = "passed" | "attention" | "failed" | "notChecked";
type FindingSeverity = "LOW" | "MEDIUM" | "HIGH";

type RegistryRecord = {
  certificateId: string;
  studentName: string;
  institution: string;
  degree: string;
  registrationNumber: string;
  issueDate: string;
  graduationYear: number;
  documentHash: string;
  qrValue: string;
  status: RegistryStatus;
};

type StoredUpload = {
  uploadId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileHash: string | null;
};

const demoRegistry: RegistryRecord[] = [
  {
    certificateId: "CT-2024-019",
    studentName: "Ada Mensah",
    institution: "University of Cape Coast",
    degree: "BSc Computer Science",
    registrationNumber: "UCC/CS/2024/019",
    issueDate: "2024-07-18",
    graduationYear: 2024,
    documentHash:
      "9b91d1c7a4e22a4c6e8c4d9b7e2f8a1c5d3e0b6f6c4a1e2d8f3b5c7a9e0d1f2",
    qrValue: "CREDiTRUST://CT-2024-019",
    status: "verified",
  },
  {
    certificateId: "CT-2024-021",
    studentName: "Kwame Boateng",
    institution: "University of Ghana",
    degree: "BBA Accounting",
    registrationNumber: "UG/BBA/2024/021",
    issueDate: "2024-06-28",
    graduationYear: 2024,
    documentHash:
      "71f0e2b9c3d1489a6fd780bd2c1f4b6e8a9d0c2b4e7f1a5c8d3b6e9f0a2c4d7e",
    qrValue: "CREDiTRUST://CT-2024-021",
    status: "suspicious",
  },
  {
    certificateId: "CT-2023-008",
    studentName: "Nia Okafor",
    institution: "University of Lagos",
    degree: "BA Economics",
    registrationNumber: "UNILAG/ECO/2023/008",
    issueDate: "2023-11-10",
    graduationYear: 2023,
    documentHash:
      "3ac7f190e2d4b6c8f0a1e3d5b7c9f2a4d6e8b0c2f4a6d8e0b1c3f5a7d9e2b4c6",
    qrValue: "CREDiTRUST://CT-2023-008",
    status: "verified",
  },
  {
    certificateId: "CT-2022-114",
    studentName: "Samira Hassan",
    institution: "University of Nairobi",
    degree: "MSc Data Science",
    registrationNumber: "UON/DS/2022/114",
    issueDate: "2022-12-02",
    graduationYear: 2022,
    documentHash:
      "ce2b54a1d7f3089e6c4a0b2d8f1e5a7c9d3b6f0a2e4c8b1d5f7a9e3c6b0d2f4",
    qrValue: "CREDiTRUST://CT-2022-114",
    status: "verified",
  },
  {
    certificateId: "CT-2024-063",
    studentName: "Daniel Osei",
    institution: "Ashesi University",
    degree: "BSc Management Information Systems",
    registrationNumber: "ASH/MIS/2024/063",
    issueDate: "2024-05-15",
    graduationYear: 2024,
    documentHash:
      "e4c1a9d7f3b0e2c8a6d4f1b9e7c3a0d8f5b2e6c9a1d4f7b0e3c6a8d2f5b9e1",
    qrValue: "CREDiTRUST://CT-2024-063",
    status: "verified",
  },
];

const uploads = new Map<string, StoredUpload>();

const analysisSteps = [
  { key: "received", label: "Upload received" },
  { key: "preprocess", label: "Document preprocessing" },
  { key: "ocr", label: "OCR field extraction" },
  { key: "qr", label: "QR detection" },
  { key: "fields", label: "Credential field normalization" },
  { key: "hash", label: "SHA-256 integrity hash" },
  { key: "registry", label: "Institutional registry match" },
  { key: "integrity", label: "Anomaly analysis" },
  { key: "score", label: "Trust score calculation" },
];

function sanitizedFileName(input: string) {
  return input.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

function makeDemoHash(fileName: string) {
  return createHash("sha256")
    .update(`creditrust-demo:${fileName}`)
    .digest("hex");
}

function placeholderRecord(certificateId: string): RegistryRecord {
  return {
    certificateId,
    studentName: "Not detected",
    institution: "Not detected",
    degree: "Not detected",
    registrationNumber: "Not detected",
    issueDate: "Not detected",
    graduationYear: 0,
    documentHash: "",
    qrValue: "",
    status: "invalid",
  };
}

function signal(
  key: string,
  label: string,
  status: SignalStatus,
  detail: string,
  points: number,
  maxPoints: number,
) {
  return { key, label, status, detail, points, maxPoints };
}

function buildReport(certificateId: string, fileHash?: string | null) {
  const record =
    demoRegistry.find((item) => item.certificateId === certificateId) ??
    placeholderRecord(certificateId);
  const isKnown = record.documentHash.length > 0;
  const hashMatches = Boolean(
    isKnown && (!fileHash || fileHash === record.documentHash),
  );
  const suspicious = record.status === "suspicious";

  const signals = [
    signal(
      "certificateId",
      "Certificate ID",
      isKnown ? "passed" : "failed",
      isKnown
        ? "Certificate ID exists in the demo institutional registry."
        : "Certificate ID was not found in the demo institutional registry.",
      isKnown ? 20 : 0,
      20,
    ),
    signal(
      "institution",
      "Institution",
      isKnown ? "passed" : "failed",
      isKnown
        ? `${record.institution} matches the registered issuer.`
        : "No registered issuer was found for this certificate.",
      isKnown ? 20 : 0,
      20,
    ),
    signal(
      "credentialData",
      "Credential data",
      isKnown && !suspicious ? "passed" : isKnown ? "attention" : "failed",
      isKnown
        ? suspicious
          ? "Some extracted fields need manual review against the source record."
          : "Name, degree, and registration data are consistent with the record."
        : "Credential fields could not be matched to a registry record.",
      isKnown && !suspicious ? 15 : isKnown ? 8 : 0,
      15,
    ),
    signal(
      "qr",
      "QR verification",
      isKnown && !suspicious ? "passed" : isKnown ? "attention" : "notChecked",
      isKnown
        ? suspicious
          ? "QR payload is present but does not fully agree with the demo record."
          : "QR payload matches the registered certificate identifier."
        : "QR code not detected or not associated with a registry record.",
      isKnown && !suspicious ? 15 : isKnown ? 6 : 0,
      15,
    ),
    signal(
      "hash",
      "Document integrity",
      hashMatches ? "passed" : isKnown ? "failed" : "notChecked",
      hashMatches
        ? "SHA-256 hash matches the registered demo document."
        : isKnown
          ? "Uploaded document hash does not match the registered document."
          : "No registered document hash is available for comparison.",
      hashMatches ? 20 : 0,
      20,
    ),
    signal(
      "date",
      "Date consistency",
      isKnown ? "passed" : "attention",
      isKnown
        ? "Issue date and graduation year are internally consistent."
        : "Issue date could not be verified against a registered record.",
      isKnown ? 5 : 0,
      5,
    ),
    signal(
      "anomalies",
      "Anomaly review",
      isKnown && !suspicious ? "passed" : isKnown ? "attention" : "failed",
      isKnown && !suspicious
        ? "No high-severity rule-based anomalies were detected."
        : suspicious
          ? "Rule-based review found signals that need human attention."
          : "The missing registry match is a high-severity finding.",
      isKnown && !suspicious ? 5 : 0,
      5,
    ),
  ];

  const score = Math.max(
    0,
    Math.min(100, signals.reduce((total, item) => total + item.points, 0)),
  );
  const status =
    score >= 85
      ? "verified"
      : score >= 65
        ? "likelyAuthentic"
        : score >= 40
          ? "suspicious"
          : "invalid";

  const findings: Array<{
    type: string;
    severity: FindingSeverity;
    message: string;
  }> = [];
  if (!isKnown) {
    findings.push({
      type: "REGISTRY_NOT_FOUND",
      severity: "HIGH",
      message:
        "Certificate ID was not found in the demo registry. Request issuer confirmation before relying on this credential.",
    });
  }
  if (isKnown && !hashMatches) {
    findings.push({
      type: "HASH_MISMATCH",
      severity: "HIGH",
      message:
        "Uploaded document hash does not match the registered demo document.",
    });
  }
  if (suspicious) {
    findings.push({
      type: "FIELD_REVIEW",
      severity: "MEDIUM",
      message:
        "Some credential fields or QR content require manual comparison with the issuing institution.",
    });
  }
  if (!findings.length) {
    findings.push({
      type: "NO_HIGH_RISK_ANOMALIES",
      severity: "LOW",
      message:
        "No high-severity anomalies were found by the transparent MVP rules.",
    });
  }

  const explanation = signals
    .filter((item) => item.status !== "notChecked")
    .map((item) => `${item.status === "passed" ? "Pass" : "Review"} — ${item.detail}`);

  return VerifyCredentialResponse.parse({
    certificate: {
      certificateId: record.certificateId,
      studentName: record.studentName,
      institution: record.institution,
      degree: record.degree,
      registrationNumber: record.registrationNumber,
      issueDate: record.issueDate,
      graduationYear: record.graduationYear,
      status: record.status,
    },
    score,
    status,
    timestamp: new Date(),
    signals,
    findings,
    documentHash:
      fileHash ?? record.documentHash ?? makeDemoHash(record.certificateId),
    explanation,
  });
}

function certificateIdFromUpload(upload: StoredUpload) {
  const match = upload.fileName.match(/CT-\d{4}-\d{3}/i);
  return match?.[0].toUpperCase() ?? "";
}

const router: IRouter = Router();

router.post("/credentials/upload", (req, res) => {
  const parsed = UploadCredentialBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Provide a file name, size, and MIME type." });
    return;
  }
  const { file, fileSize, mimeType, fileHash } = parsed.data;
  if (fileSize > 15 * 1024 * 1024) {
    res.status(400).json({ error: "Files must be 15 MB or smaller." });
    return;
  }
  if (!["application/pdf", "image/png", "image/jpeg"].includes(mimeType)) {
    res.status(400).json({ error: "Only PDF, PNG, and JPG files are supported." });
    return;
  }

  const uploadId = randomUUID();
  const upload: StoredUpload = {
    uploadId,
    fileName: sanitizedFileName(file),
    fileSize,
    mimeType,
    fileHash: fileHash ?? null,
  };
  uploads.set(uploadId, upload);
  res.status(201).json(
    UploadCredentialResponse.parse({
      uploadId,
      fileName: upload.fileName,
      fileSize,
      mimeType,
      receivedAt: new Date(),
    }),
  );
});

router.post("/credentials/analyze", (req, res) => {
  const parsed = AnalyzeCredentialBody.safeParse(req.body);
  if (!parsed.success || !uploads.has(parsed.data.uploadId)) {
    res.status(404).json({ error: "Upload not found. Start with a new document." });
    return;
  }
  const steps = analysisSteps.map((step, index) => ({
    ...step,
    status: index === 0 ? "processing" : "pending",
  }));
  res.status(202).json(
    AnalyzeCredentialResponse.parse({
      jobId: randomUUID(),
      uploadId: parsed.data.uploadId,
      status: "processing",
      steps,
    }),
  );
});

router.post("/credentials/verify", (req, res) => {
  const parsed = VerifyCredentialBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "A certificate ID is required." });
    return;
  }
  if (parsed.data.uploadId && !uploads.has(parsed.data.uploadId)) {
    res.status(404).json({ error: "Upload not found. Start with a new document." });
    return;
  }
  const upload = parsed.data.uploadId
    ? uploads.get(parsed.data.uploadId)
    : undefined;
  const certificateId =
    upload && parsed.data.certificateId === upload.uploadId
      ? certificateIdFromUpload(upload)
      : parsed.data.certificateId;
  res.json(buildReport(certificateId, parsed.data.fileHash ?? upload?.fileHash));
});

router.get("/credentials/recent", (_req, res) => {
  const recent = demoRegistry.map((record, index) => {
    const report = buildReport(record.certificateId);
    return {
      certificateId: record.certificateId,
      studentName: record.studentName,
      institution: record.institution,
      score: report.score,
      status: record.status,
      verifiedAt: new Date(Date.now() - index * 86_400_000),
    };
  });
  res.json(GetRecentCredentialsResponse.parse(recent));
});

router.get("/credentials/:certificateId", (req, res) => {
  const parsed = GetCredentialParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid certificate ID." });
    return;
  }
  res.json(GetCredentialResponse.parse(buildReport(parsed.data.certificateId)));
});

router.get("/dashboard/stats", (_req, res) => {
  const counts = demoRegistry.reduce(
    (result, record) => {
      result[record.status] += 1;
      return result;
    },
    { verified: 0, suspicious: 0, invalid: 1 } as Record<RegistryStatus, number>,
  );
  res.json(
    GetDashboardStatsResponse.parse({
      total: demoRegistry.length + 1,
      verified: counts.verified,
      suspicious: counts.suspicious,
      invalid: counts.invalid,
      weekly: [
        { label: "Mon", count: 4 },
        { label: "Tue", count: 7 },
        { label: "Wed", count: 5 },
        { label: "Thu", count: 9 },
        { label: "Fri", count: 8 },
        { label: "Sat", count: 6 },
        { label: "Sun", count: 3 },
      ],
    }),
  );
});

export default router;