import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, BarChart3, AlertTriangle } from "lucide-react";
import Link from "next/link";

async function getDashboardStats(organizationId: string) {
  const [clinicsCount, analysisCount, issuesCount] = await Promise.all([
    prisma.dentalClinic.count({
      where: { organizationId, deletedAt: null },
    }),
    prisma.analysisResult.count({
      where: {
        dentalClinic: { organizationId },
        status: "COMPLETED",
      },
    }),
    prisma.analysisResult.count({
      where: {
        dentalClinic: { organizationId },
        status: "COMPLETED",
        issues: { not: { equals: [] } },
      },
    }),
  ]);

  return { clinicsCount, analysisCount, issuesCount };
}

async function getRecentClinics(organizationId: string) {
  return prisma.dentalClinic.findMany({
    where: { organizationId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: {
      reviewData: {
        orderBy: { fetchedAt: "desc" },
        take: 1,
      },
      analysisResults: {
        orderBy: { analyzedAt: "desc" },
        take: 1,
      },
    },
  });
}

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.organizationId) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">組織に所属していません</p>
      </div>
    );
  }

  const [stats, recentClinics] = await Promise.all([
    getDashboardStats(session.user.organizationId),
    getRecentClinics(session.user.organizationId),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ダッシュボード</h1>
        <p className="text-slate-500 mt-1">
          歯科医院のマーケティング分析の概要
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              登録医院数
            </CardTitle>
            <Building className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {stats.clinicsCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">医院</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              分析実行回数
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {stats.analysisCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">回</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              課題検出数
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {stats.issuesCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              担当医院
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {stats.clinicsCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">医院</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Clinics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>最近更新された医院</CardTitle>
          <Link
            href="/clinics"
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            すべて見る →
          </Link>
        </CardHeader>
        <CardContent>
          {recentClinics.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">まだ医院が登録されていません</p>
              <Link
                href="/clinics/new"
                className="text-teal-600 hover:text-teal-700 font-medium text-sm mt-2 inline-block"
              >
                医院を登録する →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentClinics.map((clinic) => (
                <Link
                  key={clinic.id}
                  href={`/clinics/${clinic.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100">
                      <Building className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{clinic.name}</p>
                      <p className="text-sm text-slate-500">
                        {clinic.prefecture}
                        {clinic.city}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {clinic.reviewData[0] && (
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-amber-500">★</span>
                        <span className="font-medium">
                          {clinic.reviewData[0].averageRating.toFixed(1)}
                        </span>
                        <span className="text-slate-400">
                          ({clinic.reviewData[0].totalReviews}件)
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {clinic.analysisResults[0]
                        ? `最終分析: ${new Date(clinic.analysisResults[0].analyzedAt).toLocaleDateString("ja-JP")}`
                        : "未分析"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

