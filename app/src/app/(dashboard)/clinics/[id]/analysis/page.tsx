"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ArrowLeft,
  Play,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Clock,
  Target,
  Lightbulb,
  DollarSign,
  ArrowRight,
  Zap,
} from "lucide-react";

interface AnalysisResult {
  id: string;
  analyzedAt: string;
  periodStart: string;
  periodEnd: string;
  trafficScore: number | null;
  engagementScore: number | null;
  reviewScore: number | null;
  overallScore: number | null;
  issues: { type: string; severity: string; message: string }[];
  aiAnalysis: string | null;
  status: string;
}

interface ProposedService {
  name: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  estimatedCost: string;
  expectedEffect: string;
  reason: string;
  timeline?: string;
}

interface AIAnalysisResult {
  currentAnalysis: string;
  mainIssues: string[];
  competitorAnalysis?: string;
  webAnalysis?: string;
  reviewAnalysis?: string;
  complaintAnalysis?: string;
  measureEvaluation?: string;
  recommendations: string[];
  proposedServices: ProposedService[];
  expectedEffects: string;
}

export default function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [parsedAI, setParsedAI] = useState<AIAnalysisResult | null>(null);

  useEffect(() => {
    fetchLatestAnalysis();
  }, [resolvedParams.id]);

  const fetchLatestAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/clinics/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.analysisResults && data.analysisResults.length > 0) {
          const latest = data.analysisResults[0];
          setAnalysisResult(latest);
          if (latest.aiAnalysis) {
            try {
              const parsed = JSON.parse(latest.aiAnalysis);
              // 古い形式のデータを新形式に変換
              if (typeof parsed.mainIssues === "string") {
                parsed.mainIssues = parsed.mainIssues.split(/\n|・|●|•/).filter((s: string) => s.trim());
              }
              if (typeof parsed.recommendations === "string") {
                parsed.recommendations = parsed.recommendations.split(/\n|・|●|•/).filter((s: string) => s.trim());
              }
              if (!parsed.proposedServices) {
                parsed.proposedServices = [];
              }
              setParsedAI(parsed);
            } catch {
              setParsedAI(null);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching analysis:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`/api/clinics/${resolvedParams.id}/analyze`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "分析の実行に失敗しました");
        return;
      }

      setAnalysisResult(result.data);
      if (result.data.aiAnalysis) {
        try {
          const parsed = JSON.parse(result.data.aiAnalysis);
          if (typeof parsed.mainIssues === "string") {
            parsed.mainIssues = parsed.mainIssues.split(/\n|・|●|•/).filter((s: string) => s.trim());
          }
          if (typeof parsed.recommendations === "string") {
            parsed.recommendations = parsed.recommendations.split(/\n|・|●|•/).filter((s: string) => s.trim());
          }
          if (!parsed.proposedServices) {
            parsed.proposedServices = [];
          }
          setParsedAI(parsed);
        } catch {
          setParsedAI(null);
        }
      }
    } catch {
      setError("分析中にエラーが発生しました");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-slate-400";
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number | null) => {
    if (score === null) return "bg-slate-50 border-slate-200";
    if (score >= 80) return "bg-emerald-50 border-emerald-200";
    if (score >= 60) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-700 border-red-200";
      case "MEDIUM":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "優先度：高";
      case "MEDIUM":
        return "優先度：中";
      default:
        return "優先度：低";
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/clinics/${resolvedParams.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI分析</h1>
            <p className="text-slate-500 mt-1">
              Gemini AIによる総合分析・施策提案
            </p>
          </div>
        </div>
        <Button onClick={runAnalysis} isLoading={isAnalyzing}>
          {analysisResult ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              再分析
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              分析を実行
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
          {error}
        </div>
      )}

      {!analysisResult ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              まだ分析が実行されていません
            </h3>
            <p className="text-slate-500 mb-6">
              「分析を実行」ボタンをクリックして、AI分析を開始してください
            </p>
            <Button onClick={runAnalysis} isLoading={isAnalyzing}>
              <Play className="h-4 w-4 mr-2" />
              分析を実行
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Score Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className={`border-2 ${getScoreBg(analysisResult.overallScore)}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  総合スコア
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-4xl font-bold ${getScoreColor(analysisResult.overallScore)}`}>
                  {analysisResult.overallScore ?? "-"}
                </div>
                <p className="text-xs text-slate-500 mt-1">/ 100点</p>
              </CardContent>
            </Card>

            <Card className={`border ${getScoreBg(analysisResult.trafficScore)}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  流入スコア
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(analysisResult.trafficScore)}`}>
                  {analysisResult.trafficScore ?? "-"}
                </div>
              </CardContent>
            </Card>

            <Card className={`border ${getScoreBg(analysisResult.engagementScore)}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  エンゲージメント
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(analysisResult.engagementScore)}`}>
                  {analysisResult.engagementScore ?? "-"}
                </div>
              </CardContent>
            </Card>

            <Card className={`border ${getScoreBg(analysisResult.reviewScore)}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  口コミスコア
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(analysisResult.reviewScore)}`}>
                  {analysisResult.reviewScore ?? "-"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis - Current Analysis */}
          {parsedAI && (
            <>
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    現状分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">
                    {parsedAI.currentAnalysis}
                  </p>
                </CardContent>
              </Card>

              {/* Main Issues */}
              {parsedAI.mainIssues && parsedAI.mainIssues.length > 0 && (
                <Card className="border-l-4 border-l-amber-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      主な課題
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {parsedAI.mainIssues.map((issue, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-slate-700">
                            {typeof issue === "object" ? JSON.stringify(issue) : issue}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* 詳細分析セクション */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Web集客分析 */}
                {parsedAI.webAnalysis && (
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        Web集客分析
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {parsedAI.webAnalysis}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* 口コミ分析 */}
                {parsedAI.reviewAnalysis && (
                  <Card className="border-l-4 border-l-yellow-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Target className="h-4 w-4 text-yellow-500" />
                        口コミ分析
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {parsedAI.reviewAnalysis}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* 競合分析 */}
                {parsedAI.competitorAnalysis && (
                  <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Target className="h-4 w-4 text-orange-500" />
                        競合分析
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {parsedAI.competitorAnalysis}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* 主訴別分析 */}
                {parsedAI.complaintAnalysis && (
                  <Card className="border-l-4 border-l-indigo-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Sparkles className="h-4 w-4 text-indigo-500" />
                        主訴別分析
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {parsedAI.complaintAnalysis}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Recommendations */}
              {parsedAI.recommendations && parsedAI.recommendations.length > 0 && (
                <Card className="border-l-4 border-l-emerald-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-emerald-500" />
                      推奨アクション
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {parsedAI.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700">
                            {typeof rec === "object" ? JSON.stringify(rec) : rec}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Proposed Services */}
              {parsedAI.proposedServices && parsedAI.proposedServices.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Target className="h-6 w-6 text-teal-500" />
                    提案サービス
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {parsedAI.proposedServices.map((service, index) => (
                      <Card key={index} className="relative overflow-hidden">
                        <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-medium rounded-bl-lg border ${getPriorityColor(service.priority)}`}>
                          {getPriorityLabel(service.priority)}
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg pr-20">{service.name}</CardTitle>
                          <CardDescription>{service.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-600">{service.estimatedCost}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Zap className="h-4 w-4 text-amber-500" />
                            <span className="text-slate-600">{service.expectedEffect}</span>
                          </div>
                          <div className="pt-2 border-t space-y-1">
                            <p className="text-xs text-slate-500">
                              <span className="font-medium">提案理由:</span> {service.reason}
                            </p>
                            {service.timeline && (
                              <p className="text-xs text-slate-400">
                                <span className="font-medium">期間:</span> {service.timeline}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Expected Effects */}
              {parsedAI.expectedEffects && (
                <Card className="border-l-4 border-l-teal-500 bg-gradient-to-r from-teal-50 to-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-teal-500" />
                      期待効果
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 leading-relaxed">
                      {parsedAI.expectedEffects}
                    </p>
                  </CardContent>
                </Card>
              )}

            </>
          )}

          {/* Issues from Rules */}
          {analysisResult.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  自動検出された課題
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisResult.issues.map((issue, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        issue.severity === "HIGH"
                          ? "border-red-500 bg-red-50"
                          : issue.severity === "MEDIUM"
                          ? "border-amber-500 bg-amber-50"
                          : "border-blue-500 bg-blue-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            issue.severity === "HIGH"
                              ? "bg-red-200 text-red-800"
                              : issue.severity === "MEDIUM"
                              ? "bg-amber-200 text-amber-800"
                              : "bg-blue-200 text-blue-800"
                          }`}
                        >
                          {issue.severity === "HIGH" ? "重要" : issue.severity === "MEDIUM" ? "注意" : "参考"}
                        </span>
                        <p className="text-slate-700">{issue.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Meta */}
          <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                分析日時: {new Date(analysisResult.analyzedAt).toLocaleString("ja-JP")}
              </span>
            </div>
            <Link href={`/clinics/${resolvedParams.id}/measures`}>
              <Button variant="outline" size="sm">
                施策を登録
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
