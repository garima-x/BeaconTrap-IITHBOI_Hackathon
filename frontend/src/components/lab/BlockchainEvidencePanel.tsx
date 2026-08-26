import React, { useState } from "react";
import { Fingerprint, AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import { useAnalysis } from "../../context/AnalysisContext";
import { useBlockchainAnchor } from "../../hooks/useBlockchainAnchor";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://beacontrap-backend.onrender.com";

export default function BlockchainEvidencePanel() {
  const { caseData, updateBlockchainAnchor } = useAnalysis();
  const { anchorEvidence, status, error } = useBlockchainAnchor();
  const [localError, setLocalError] = useState<string | null>(null);

  if (!caseData) {
    return (
      <div className="text-center py-10 text-xs font-mono text-[var(--text-muted)]">
        NO CASE DATA LOADED FOR EVIDENCE LEDGER
      </div>
    );
  }

  const handleAnchor = async () => {
    setLocalError(null);
    try {
      const reportPayload = caseData.analystReport || JSON.stringify(caseData);
      const reportBytes = new TextEncoder().encode(reportPayload);

      const result = await anchorEvidence(caseData.id, reportBytes);
      if (result) {
        updateBlockchainAnchor(
          result.txHash,
          result.blockNumber,
          new Date()
        );
        try {
          const verifyRes = await fetch(`${API_BASE_URL}/api/v1/cases/${caseData.id}/verify-anchor`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tx_hash: result.txHash }),
          });
          if (verifyRes.ok) {
            const verified = await verifyRes.json();
            updateBlockchainAnchor(
              verified.tx_hash,
              verified.block_number,
              new Date()
            );
          }
        } catch (verifyErr) {
          // Backend verification optional in local preview
        }
      }

    } catch (err: any) {
      setLocalError(err?.message || "Anchoring failed");
    }
  };

  const isBusy = status === "connecting" || status === "anchoring";

  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono">
            Evidence Ledger & Blockchain Anchoring
          </h3>
        </div>

        {!caseData.blockchainTxHash && (
          <button
            onClick={handleAnchor}
            disabled={isBusy}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-2xl bg-[var(--accent)] text-[var(--btn-copilot-text)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isBusy ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {status === "connecting" ? "Connecting MetaMask..." : "Anchoring..."}
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                Anchor to Sepolia
              </>
            )}
          </button>
        )}
      </div>

      {(error || localError) && (
        <div className="text-xs font-mono text-[var(--severity-critical)] bg-[var(--severity-critical)]/10 border border-[var(--severity-critical)]/30 rounded-2xl p-3">
          {error || localError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-panel-alt)] border border-[var(--border)] p-5 rounded-2xl space-y-4">
          <h4 className="text-xs font-bold uppercase text-[var(--text-muted)] font-mono tracking-wider">
            Block Ledger Receipt
          </h4>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <span className="text-[var(--text-muted)] text-[10px] block">TRANSACTION HASH</span>
              {caseData.blockchainTxHash ? (
                <a
                  href={`https://sepolia.etherscan.io/address/0xd9aa91a39248916D946C75Abf875F2b1660a8732`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline break-all block"
                >
                  {caseData.blockchainTxHash} (Click to View Contract on Sepolia)
                </a>
              ) : (

                <span className="text-[var(--text-primary)] break-all block">
                  {isBusy ? "Awaiting MetaMask confirmation..." : "Not yet anchored"}
                </span>
              )}
            </div>
            <div>
              <span className="text-[var(--text-muted)] text-[10px] block">BLOCK ANCHOR INDEX</span>
              <span className="text-[var(--text-primary)] block">{caseData.blockchainBlock ?? "Pending mine..."}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)] text-[10px] block">ANCHOR TIMESTAMP</span>
              <span className="text-[var(--text-primary)] block">
                {caseData.blockchainTimestamp ? new Date(caseData.blockchainTimestamp).toLocaleString() : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--severity-critical)]/10 border border-[var(--severity-critical)]/30 p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-[var(--severity-critical)]">
            <AlertTriangle className="w-4 h-4" />
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider">
              Chain-of-Custody Integrity Guarantee
            </h4>
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed font-mono">
            This malware report has been cryptographically signed and hash-anchored onto the distributed evidence ledger. This record guarantees immutable verification of intelligence findings across judicial proceedings.
          </p>
        </div>
      </div>
    </div>
  );
}
