import type { StoneDetailDto } from "@/lib/backend";

export function buildCertificateLink(
  stoneDetail?: StoneDetailDto | null
): string | null {
  if (!stoneDetail) return null;
  const certNo =
    stoneDetail.externalReportNo || stoneDetail.externalCertNo || "";
  const trimmed = certNo.trim();
  if (!trimmed) return null;

  return `https://www.gia.edu/report-check?reportno=${encodeURIComponent(
    trimmed
  )}`;
}
