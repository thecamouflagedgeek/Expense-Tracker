"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { generateReceiptUploadLink } from "@/app/receipt-upload/service";
import { useAuth } from "@/contexts/auth-context";
import { Copy, QrCode, RefreshCcw } from "lucide-react";

export default function GenerateUploadQR() {
  const { user } = useAuth();
  const [link, setLink] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [expiry, setExpiry] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!expiry) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiry]);

  const generateQR = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await generateReceiptUploadLink(user.id);
      setLink(result.uploadUrl);
      setSessionId(result.linkId);
      setExpiry(result.expiresAt.toMillis());
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    alert("Link copied");
  };

  return (
    <Card className="card-gradient p-8">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="font-black text-2xl">Share Receipt Upload</h2>
          <p className="text-black/60">Generate a QR for temporary uploads</p>
        </div>

        <Button
          onClick={generateQR}
          disabled={loading}
          className="button-gradient"
        >
          <QrCode className="mr-2 w-4 h-4" />
          {loading ? "Generating..." : "Generate QR"}
        </Button>

        {link && timeLeft > 0 && (
          <>
            <div className="bg-white rounded-3xl p-6 flex justify-center">
              <QRCode value={link} size={220} />
            </div>

            <div className="text-center">
              <p className="font-bold">Expires in</p>
              <p className="text-4xl font-black">
                {Math.floor(timeLeft / 60)}:
                {String(timeLeft % 60).padStart(2, "0")}
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={copyLink} variant="outline" className="flex-1">
                <Copy className="mr-2 w-4 h-4" />
                Copy Link
              </Button>

              <Button onClick={generateQR} className="flex-1">
                <RefreshCcw className="mr-2 w-4 h-4" />
                Regenerate
              </Button>
            </div>

            <div className="break-all text-xs text-black/40">{link}</div>
          </>
        )}

        {timeLeft === 0 && link && (
          <div className="text-center">
            <p className="font-bold text-red-500">QR Expired</p>
          </div>
        )}
      </div>
    </Card>
  );
}
