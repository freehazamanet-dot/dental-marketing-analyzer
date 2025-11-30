"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  RefreshCw,
  Users,
  Clock,
  TrendingDown,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  BarChart3,
  AlertTriangle,
} from "lucide-react";

interface AnalyticsData {
  analytics: {
    totalSessions: number;
    totalUsers: number;
    newUsers: number;
    avgSessionDuration: number;
    bounceRate: number;
    regionData: Record<string, number>;
    cityData: Record<string, number>;
    channelData: Record<string, number>;
    paidSessions?: number;
    paidBounceRate?: number;
  };
  pages: {
    page: string;
    pageViews: number;
    avgDuration: number;
    bounceRate: number;
  }[];
  devices: {
    device: string;
    sessions: number;
    users: number;
  }[];
}

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  desktop: <Monitor className="h-4 w-4" />,
  mobile: <Smartphone className="h-4 w-4" />,
  tablet: <Tablet className="h-4 w-4" />,
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/clinics/${resolvedParams.id}/analytics`);
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400 && result.error?.includes("プロパティID")) {
          setNotConfigured(true);
        } else {
          setError(result.error || "データの取得に失敗しました");
        }
        return;
      }

      setData(result);
    } catch {
      setError("データの取得中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (notConfigured) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/clinics/${resolvedParams.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Google Analytics</h1>
            <p className="text-slate-500 mt-1">アクセス解析データ</p>
          </div>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Google Analytics が設定されていません
            </h3>
            <p className="text-slate-500 mb-6">
              医院の編集画面でGA4プロパティIDを設定してください
            </p>
            <Link href={`/clinics/${resolvedParams.id}/edit`}>
              <Button>設定画面へ</Button>
            </Link>
          </CardContent>
        </Card>
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
            <h1 className="text-2xl font-bold text-slate-900">Google Analytics</h1>
            <p className="text-slate-500 mt-1">アクセス解析データ（過去30日間）</p>
          </div>
        </div>
        <Button onClick={fetchData} isLoading={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          データを取得
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
          {error}
        </div>
      )}

      {!data && !isLoading && !error && (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              データを取得してください
            </h3>
            <p className="text-slate-500 mb-6">
              「データを取得」ボタンをクリックして、Google Analyticsからデータを取得します
            </p>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  セッション数
                </CardTitle>
                <Users className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data.analytics.totalSessions.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  ユーザー数
                </CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data.analytics.totalUsers.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  新規: {data.analytics.newUsers.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  平均滞在時間
                </CardTitle>
                <Clock className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatDuration(data.analytics.avgSessionDuration)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  直帰率
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data.analytics.bounceRate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Channel Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-teal-500" />
                  流入チャネル
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(data.analytics.channelData)
                    .sort((a, b) => b[1] - a[1])
                    .map(([channel, sessions]) => {
                      const percentage = (sessions / data.analytics.totalSessions) * 100;
                      return (
                        <div key={channel} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{channel}</span>
                            <span className="font-medium">{sessions.toLocaleString()}</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Device Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-teal-500" />
                  デバイス別
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.devices.map((device) => {
                    const percentage = (device.sessions / data.analytics.totalSessions) * 100;
                    return (
                      <div key={device.device} className="flex items-center gap-4">
                        <div className="flex items-center gap-2 w-24">
                          {DEVICE_ICONS[device.device] || <Monitor className="h-4 w-4" />}
                          <span className="text-sm capitalize">{device.device}</span>
                        </div>
                        <div className="flex-1">
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium w-16 text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Region Data */}
            <Card>
              <CardHeader>
                <CardTitle>地域別アクセス</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(data.analytics.regionData)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([region, sessions]) => (
                      <div key={region} className="flex justify-between items-center p-2 rounded bg-slate-50">
                        <span className="text-sm">{region}</span>
                        <span className="text-sm font-medium">{sessions.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Page Data */}
            <Card>
              <CardHeader>
                <CardTitle>ページ別アクセス</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.pages.slice(0, 10).map((page) => (
                    <div key={page.page} className="flex justify-between items-center p-2 rounded bg-slate-50">
                      <span className="text-sm truncate max-w-[200px]" title={page.page}>
                        {page.page}
                      </span>
                      <span className="text-sm font-medium">{page.pageViews.toLocaleString()} PV</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Paid Data */}
          {data.analytics.paidSessions && (
            <Card>
              <CardHeader>
                <CardTitle>広告経由のアクセス</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg bg-amber-50">
                    <p className="text-sm text-slate-500">広告経由セッション</p>
                    <p className="text-2xl font-bold text-amber-700 mt-1">
                      {data.analytics.paidSessions.toLocaleString()}
                    </p>
                  </div>
                  {data.analytics.paidBounceRate && (
                    <div className="p-4 rounded-lg bg-amber-50">
                      <p className="text-sm text-slate-500">広告経由の直帰率</p>
                      <p className="text-2xl font-bold text-amber-700 mt-1">
                        {data.analytics.paidBounceRate.toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

