"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Share2 } from "lucide-react";

interface ReferralClientProps {
  code: string;
  referralUrl: string;
}

export function ReferralClient({ code, referralUrl }: ReferralClientProps) {
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  async function handleCopyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCopyUrl() {
    await navigator.clipboard.writeText(referralUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join ScoopCraft",
          text: "Use my referral code to get 200 bonus points on ScoopCraft — handcrafted ice cream delivered to your door!",
          url: referralUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback to copy URL
      await handleCopyUrl();
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* The code itself */}
      <div
        className="flex items-center gap-3 rounded-2xl border px-8 py-4 cursor-pointer select-all transition-colors hover:border-opacity-80"
        style={{
          borderColor: "var(--primary)",
          backgroundColor: "rgba(212,83,106,0.05)",
        }}
        onClick={handleCopyCode}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleCopyCode()}
        aria-label="Copy referral code"
      >
        <span
          className="text-4xl font-bold tracking-[0.15em]"
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
        >
          {code}
        </span>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ color: "var(--primary)" }}
        >
          {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
        </div>
      </div>

      {copied && (
        <p className="text-sm font-medium" style={{ color: "var(--success)" }}>
          Code copied!
        </p>
      )}

      {/* Share buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={handleCopyUrl}
          className="gap-2"
        >
          {copiedUrl ? (
            <>
              <Check className="h-4 w-4" />
              Link copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy invite link
            </>
          )}
        </Button>

        <Button
          onClick={handleShare}
          className="gap-2"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>

      <p className="text-xs max-w-xs" style={{ color: "var(--foreground-muted)" }}>
        Click the code to copy, or share the invite link. You both earn 200 points when your friend signs up.
      </p>
    </div>
  );
}
