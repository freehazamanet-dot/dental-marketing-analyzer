"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowRight,
  FileText,
  Search,
  Filter,
  CheckSquare,
  Square,
  GitCompare,
  Download,
  User,
  AlertTriangle,
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
  analyzedBy: string;
  overallScore: number | null;
  trafficScore: number | null;
  engagementScore: number | null;
  reviewScore: number | null;
  status: string;
  issueCount: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

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

  const filteredReports = reports.filter(
    (report) =>
      report.clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.clinic.prefecture.includes(searchQuery) ||
      report.clinic.city.includes(searchQuery)
  );

  const toggleReportSelection = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : prev.length < 3
        ? [...prev, reportId]
        : prev
    );
  };

  const selectedReportData = reports.filter((r) =>
    selectedReports.includes(r.id)
  );

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-slate-400";
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreTrend = (
    current: number | null,
    previous: number | null
  ): "up" | "down" | "same" | null => {
    if (current === null || previous === null) return null;
    if (current > previous) return "up";
    if (current < previous) return "down";
    return "same";
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">分析レポート</h1>
          <p className="text-slate-500 mt-1">
            過去の分析結果を確認・比較できます
          </p>
        </div>
        {selectedReports.length >= 2 && (
          <Button onClick={() => setShowCompare(!showCompare)}>
            <GitCompare className="h-4 w-4 mr-2" />
            {selectedReports.length}件を比較
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="医院名・地域で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Compare Panel */}
      {showCompare && selectedReportData.length >= 2 && (
        <Card className="border-2 border-teal-200 bg-teal-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-teal-600" />
              履歴比較
            </CardTitle>
            <CardDescription>
              選択した{selectedReportData.length}件の分析結果を比較
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left font-medium text-slate-600">
                      項目
                    </th>
                    {selectedReportData.map((report) => (
                      <th
                        key={report.id}
                        className="py-3 px-4 text-center font-medium text-slate-600"
                      >
                        <div>{report.clinic.name}</div>
                        <div className="text-xs font-normal text-slate-400">
                          {new Date(report.analyzedAt).toLocaleDateString(
                            "ja-JP"
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">総合スコア</td>
                    {selectedReportData.map((report, index) => {
                      const prev =
                        index > 0
                          ? selectedReportData[index - 1].overallScore
                          : null;
                      const trend = getScoreTrend(report.overallScore, prev);
                      return (
                        <td
                          key={report.id}
                          className="py-3 px-4 text-center"
                        >
                          <span
                            className={`text-lg font-bold ${getScoreColor(
                              report.overallScore
                            )}`}
                          >
                            {report.overallScore ?? "-"}
                          </span>
                          {trend === "up" && (
                            <TrendingUp className="inline ml-1 h-4 w-4 text-emerald-500" />
                          )}
                          {trend === "down" && (
                            <TrendingDown className="inline ml-1 h-4 w-4 text-red-500" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">流入スコア</td>
                    {selectedReportData.map((report) => (
                      <td
                        key={report.id}
                        className={`py-3 px-4 text-center font-semibold ${getScoreColor(
                          report.trafficScore
                        )}`}
                      >
                        {report.trafficScore ?? "-"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">エンゲージメント</td>
                    {selectedReportData.map((report) => (
                      <td
                        key={report.id}
                        className={`py-3 px-4 text-center font-semibold ${getScoreColor(
                          report.engagementScore
                        )}`}
                      >
                        {report.engagementScore ?? "-"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">口コミスコア</td>
                    {selectedReportData.map((report) => (
                      <td
                        key={report.id}
                        className={`py-3 px-4 text-center font-semibold ${getScoreColor(
                          report.reviewScore
                        )}`}
                      >
                        {report.reviewScore ?? "-"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">検出課題数</td>
                    {selectedReportData.map((report) => (
                      <td key={report.id} className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-amber-600">
                          <AlertTriangle className="h-4 w-4" />
                          {report.issueCount}件
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedReports([]);
                  setShowCompare(false);
                }}
              >
                選択をクリア
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selection Info */}
      {selectedReports.length > 0 && !showCompare && (
        <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-lg text-teal-700">
          <CheckSquare className="h-4 w-4" />
          <span className="text-sm">
            {selectedReports.length}件選択中（最大3件まで選択して比較できます）
          </span>
        </div>
      )}

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchQuery
                ? "該当する分析レポートがありません"
                : "分析レポートがありません"}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchQuery
                ? "検索条件を変更してください"
                : "歯科医院の詳細ページから分析を実行してください"}
            </p>
            {!searchQuery && (
              <Link href="/clinics">
                <Button>
                  歯科医院一覧へ
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const isSelected = selectedReports.includes(report.id);
            return (
              <Card
                key={report.id}
                className={`transition-all ${
                  isSelected
                    ? "border-teal-500 bg-teal-50/30"
                    : "hover:shadow-md"
                }`}
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    {/* Selection Checkbox */}
                    <button
                      onClick={() => toggleReportSelection(report.id)}
                      className="flex-shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-5 w-5 text-teal-600" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-300 hover:text-slate-500" />
                      )}
                    </button>

                    {/* Clinic Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/clinics/${report.clinic.id}/analysis`}
                        className="hover:text-teal-600"
                      >
                        <h3 className="font-semibold text-slate-900 truncate">
                          {report.clinic.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-slate-500">
                        {report.clinic.prefecture} {report.clinic.city}
                      </p>
                    </div>

                    {/* Scores */}
                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-xs text-slate-500 mb-1">総合</div>
                        <div
                          className={`text-lg font-bold ${getScoreColor(
                            report.overallScore
                          )}`}
                        >
                          {report.overallScore ?? "-"}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 mb-1">流入</div>
                        <div
                          className={`font-semibold ${getScoreColor(
                            report.trafficScore
                          )}`}
                        >
                          {report.trafficScore ?? "-"}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 mb-1">口コミ</div>
                        <div
                          className={`font-semibold ${getScoreColor(
                            report.reviewScore
                          )}`}
                        >
                          {report.reviewScore ?? "-"}
                        </div>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="hidden lg:flex flex-col items-end gap-1 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(report.analyzedAt).toLocaleDateString("ja-JP")}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {report.analyzedBy}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/clinics/${report.clinic.id}/analysis`}>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          詳細
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {filteredReports.length > 0 && (
        <div className="text-center text-sm text-slate-500">
          全{filteredReports.length}件の分析レポート
        </div>
      )}
    </div>
  );
}
