import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SealLab } from "./seal-lab";
import "../go.css";

/**
 * Dev-only harness for the /lp/go success moment (seal/). The real QuoteLeadForm with a mock action that
 * resolves to success, so the envelope can be checked without sending an inquiry. 404 in production.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function GoLab() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className="go">
      <main className="shell" style={{ maxWidth: 560, paddingBlock: 40 }}>
        <SealLab />
      </main>
    </div>
  );
}
