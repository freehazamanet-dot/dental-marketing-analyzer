"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  RefreshCw,
  MousePointer,
  Eye,
  TrendingUp,
  Search,
  FileText,
  Monitor,
  Smartphone,
  Tablet,
  AlertTriangle,
} from "lucide-react";

interface SearchConsoleData {
  summary: {
    totalClicks: number;
    totalImpressions: number;
    avgCtr: number;
    avgPosition: number;
  };
  queries: {
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }[];
  pages: {
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }[];
  devices: {
    device: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }[];
  dailyTrend: {
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }[];
}

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  DESKTOP: <Monitor className="h-4 w-4" />,
  MOBILE: <Smartphone className="h-4 w-4" />,
  TABLET: <Tablet className="h-4 w-4" />,
};

export default function SearchConsolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [data, setData] = useState<SearchConsoleData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/clinics/${resolvedParams.id}/searchconsole`);
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400 && result.error?.includes("サイトURL")) {
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
            <h1 className="text-2xl font-bold text-slate-900">Search Console</h1>
            <p className="text-slate-500 mt-1">検索パフォーマンスデータ</p>
          </div>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Search Console が設定されていません
            </h3>
            <p className="text-slate-500 mb-6">
              医院の編集画面でサイトURLを設定してください
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
            <h1 className="text-2xl font-bold text-slate-900">Search Console</h1>
            <p className="text-slate-500 mt-1">検索パフォーマンスデータ（過去30日間）</p>
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
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              データを取得してください
            </h3>
            <p className="text-slate-500 mb-6">
              「データを取得」ボタンをクリックして、Search Consoleからデータを取得します
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
                  クリック数
                </CardTitle>
                <MousePointer className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data.summary.totalClicks.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  表示回数
                </CardTitle>
                <Eye className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data.summary.totalImpressions.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  平均CTR
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data.summary.avgCtr.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  平均掲載順位
                </CardTitle>
                <Search className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data.summary.avgPosition.toFixed(1)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Query Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-teal-500" />
                  検索クエリ TOP20
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 font-medium text-slate-500">クエリ</th>
                        <th className="text-right py-2 font-medium text-slate-500">クリック</th>
                        <th className="text-right py-2 font-medium text-slate-500">順位</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.queries.slice(0, 20).map((query, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="py-2 truncate max-w-[200px]" title={query.query}>
                            {query.query}
                          </td>
                          <td className="py-2 text-right">{query.clicks}</td>
                          <td className="py-2 text-right">{query.position.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Page Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal-500" />
                  ページ別パフォーマンス
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 font-medium text-slate-500">ページ</th>
                        <th className="text-right py-2 font-medium text-slate-500">クリック</th>
                        <th className="text-right py-2 font-medium text-slate-500">CTR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.pages.slice(0, 15).map((page, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="py-2 truncate max-w-[200px]" title={page.page}>
                            {page.page.replace(/^https?:\/\/[^\/]+/, '')}
                          </td>
                          <td className="py-2 text-right">{page.clicks}</td>
                          <td className="py-2 text-right">{page.ctr.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                <div className="space-y-4">
                  {data.devices.map((device) => (
                    <div key={device.device} className="p-4 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-2 mb-2">
                        {DEVICE_ICONS[device.device] || <Monitor className="h-4 w-4" />}
                        <span className="font-medium capitalize">
                          {device.device.toLowerCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">クリック</p>
                          <p className="font-medium">{device.clicks.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">CTR</p>
                          <p className="font-medium">{device.ctr.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-slate-500">順位</p>
                          <p className="font-medium">{device.position.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily Trend */}
            <Card>
              <CardHeader>
                <CardTitle>日別トレンド（直近7日）</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.dailyTrend.slice(-7).map((day) => (
                    <div key={day.date} className="flex items-center justify-between p-2 rounded bg-slate-50">
                      <span className="text-sm">{day.date}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{day.clicks} クリック</span>
                        <span className="text-slate-400">|</span>
                        <span>{day.impressions.toLocaleString()} 表示</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

