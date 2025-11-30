"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Building,
  MapPin,
  Phone,
  Globe,
  Star,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  AlertTriangle,
  ExternalLink,
  Edit,
  RefreshCw,
  LineChart,
  Search,
} from "lucide-react";

interface ClinicDetail {
  id: string;
  name: string;
  prefecture: string;
  city: string;
  address: string | null;
  phoneNumber: string | null;
  websiteUrl: string | null;
  googlePlaceId: string | null;
  specialties: string[];
  status: string;
  reviewData: {
    averageRating: number;
    totalReviews: number;
    rating5Count: number;
    rating4Count: number;
    rating3Count: number;
    rating2Count: number;
    rating1Count: number;
    fetchedAt: string;
  }[];
  analyticsData: {
    periodStart: string;
    periodEnd: string;
    totalSessions: number;
    totalUsers: number;
    avgSessionDuration: number;
    bounceRate: number;
  }[];
  analysisResults: {
    id: string;
    analyzedAt: string;
    overallScore: number | null;
    issues: { type: string; severity: string; message: string }[];
    aiAnalysis: string | null;
  }[];
  monthlyPatientData: {
    year: number;
    month: number;
    totalNewPatients: number;
    patientsByComplaint: {
      patientCount: number;
      chiefComplaint: { name: string; icon: string | null };
    }[];
  }[];
  competitors: {
    id: string;
    name: string;
    reviewData: { averageRating: number; totalReviews: number }[];
  }[];
}

export default function ClinicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [clinic, setClinic] = useState<ClinicDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchClinic();
  }, [resolvedParams.id]);

  const fetchClinic = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/clinics/${resolvedParams.id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "医院情報の取得に失敗しました");
        return;
      }

      setClinic(data);
    } catch {
      setError("医院情報の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // データ更新（口コミ取得を含む）
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 口コミデータを取得（Place IDがある場合）
      if (clinic?.googlePlaceId) {
        const reviewResponse = await fetch(`/api/clinics/${resolvedParams.id}/reviews`, {
          method: "POST",
        });
        
        if (reviewResponse.ok) {
          setSuccessMessage("口コミデータを取得しました");
        } else {
          const reviewData = await reviewResponse.json();
          console.error("Review fetch error:", reviewData.error);
        }
      }

      // 医院データを再取得
      await fetchClinic();
    } catch (err) {
      console.error("Refresh error:", err);
      setError("データの更新に失敗しました");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <p className="text-slate-500">{error || "医院が見つかりません"}</p>
        <Link href="/clinics" className="text-teal-600 hover:text-teal-700 mt-4 inline-block">
          一覧に戻る
        </Link>
      </div>
    );
  }

  const latestReview = clinic.reviewData[0];
  const latestAnalytics = clinic.analyticsData[0];
  const latestAnalysis = clinic.analysisResults[0];
  const latestPatientData = clinic.monthlyPatientData[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/clinics">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{clinic.name}</h1>
            <div className="flex items-center gap-2 text-slate-500 mt-1">
              <MapPin className="h-4 w-4" />
              <span>
                {/* cityに県名が含まれている場合は重複を避ける */}
                {clinic.city.includes(clinic.prefecture) 
                  ? `${clinic.city}${clinic.address || ""}`
                  : `${clinic.prefecture}${clinic.city}${clinic.address || ""}`
                }
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "更新中..." : "更新"}
          </Button>
          <Link href={`/clinics/${clinic.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Button>
          </Link>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
          {successMessage}
        </div>
      )}
      {error && !isLoading && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
          {error}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Review Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              口コミ評価
            </CardTitle>
            <Star className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {latestReview?.averageRating.toFixed(1) || "-"}
              </span>
              <span className="text-slate-500">/ 5.0</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {latestReview ? `${latestReview.totalReviews}件の口コミ` : "データなし"}
            </p>
          </CardContent>
        </Card>

        {/* Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              月間セッション
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {latestAnalytics?.totalSessions.toLocaleString() || "-"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {latestAnalytics ? "前月比 +12%" : "データなし"}
            </p>
          </CardContent>
        </Card>

        {/* New Patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              新規患者数
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {latestPatientData?.totalNewPatients || "-"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {latestPatientData
                ? `${latestPatientData.year}年${latestPatientData.month}月`
                : "データなし"}
            </p>
          </CardContent>
        </Card>

        {/* Overall Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              総合スコア
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {latestAnalysis?.overallScore || "-"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {latestAnalysis ? "/ 100" : "未分析"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Clinic Info */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-teal-500" />
                基本情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clinic.phoneNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{clinic.phoneNumber}</span>
                </div>
              )}
              {clinic.websiteUrl && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <a
                    href={clinic.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    ホームページ
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {clinic.specialties.length > 0 && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">診療科目</p>
                  <div className="flex flex-wrap gap-1.5">
                    {clinic.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-xs"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Competitors */}
          {clinic.competitors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>競合医院</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clinic.competitors.map((competitor) => (
                    <div
                      key={competitor.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                    >
                      <span className="font-medium text-sm">{competitor.name}</span>
                      {competitor.reviewData[0] && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          <span>{competitor.reviewData[0].averageRating.toFixed(1)}</span>
                          <span className="text-slate-400">
                            ({competitor.reviewData[0].totalReviews})
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issues */}
          {latestAnalysis && latestAnalysis.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  検出された課題
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {latestAnalysis.issues.map((issue, index) => (
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
                        {issue.severity === "HIGH" ? (
                          <TrendingDown className="h-5 w-5 text-red-500 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium text-slate-900">{issue.type}</p>
                          <p className="text-sm text-slate-600 mt-1">{issue.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis */}
          {latestAnalysis?.aiAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>AI分析結果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-slate-600">
                    {latestAnalysis.aiAnalysis}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Patient Data by Complaint */}
          {latestPatientData && latestPatientData.patientsByComplaint.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  主訴別患者数 ({latestPatientData.year}年{latestPatientData.month}月)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {latestPatientData.patientsByComplaint.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{item.chiefComplaint.icon || "🦷"}</span>
                        <span className="text-sm">{item.chiefComplaint.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{
                              width: `${(item.patientCount / latestPatientData.totalNewPatients) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {item.patientCount}人
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Link href={`/clinics/${clinic.id}/analysis`}>
              <Button>
                <BarChart3 className="h-4 w-4 mr-2" />
                AI分析
              </Button>
            </Link>
            <Link href={`/clinics/${clinic.id}/analytics`}>
              <Button variant="outline">
                <LineChart className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link href={`/clinics/${clinic.id}/searchconsole`}>
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search Console
              </Button>
            </Link>
            <Link href={`/clinics/${clinic.id}/patients`}>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                患者データ
              </Button>
            </Link>
            <Link href={`/clinics/${clinic.id}/competitors`}>
              <Button variant="outline">
                <Building className="h-4 w-4 mr-2" />
                競合管理
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

