"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  ArrowRight,
  FileText,
} from "lucide-react";

interface AnalysisReport {
  id: string;
  clinic: {
    id: string;
    name: string;
    prefecture: string;
    city: string;
  };
  analyzedAt: string;
  overallScore: number | null;
  status: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/reports");
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">分析レポート</h1>
          <p className="text-slate-500 mt-1">過去の分析結果を確認できます</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              分析レポートがありません
            </h3>
            <p className="text-slate-500 mb-6">
              歯科医院の詳細ページから分析を実行してください
            </p>
            <Link href="/clinics">
              <Button>
                歯科医院一覧へ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={`/clinics/${report.clinic.id}/analysis`}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{report.clinic.name}</CardTitle>
                  <p className="text-sm text-slate-500">
                    {report.clinic.prefecture} {report.clinic.city}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="h-4 w-4" />
                      {new Date(report.analyzedAt).toLocaleDateString("ja-JP")}
                    </div>
                    {report.overallScore !== null && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-teal-500" />
                        <span className="font-bold text-teal-600">
                          {report.overallScore}点
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

