"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { AnalysisReportPDF } from "./AnalysisReportPDF";

interface PDFDownloadButtonProps {
  clinicId: string;
  analysisId: string;
  clinicName: string;
}

export function PDFDownloadButton({
  clinicId,
  analysisId,
  clinicName,
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      // 分析データを取得
      const response = await fetch(
        `/api/clinics/${clinicId}/analysis/${analysisId}/report`
      );

      if (!response.ok) {
        throw new Error("データの取得に失敗しました");
      }

      const data = await response.json();

      // PDFを生成
      const blob = await pdf(<AnalysisReportPDF data={data} />).toBlob();

      // ダウンロード
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${clinicName}_分析レポート_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("PDFの生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={isGenerating} variant="outline">
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          生成中...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          PDF出力
        </>
      )}
    </Button>
  );
}

