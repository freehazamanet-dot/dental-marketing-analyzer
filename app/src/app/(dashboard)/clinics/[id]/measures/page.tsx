"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Plus,
  Target,
  TrendingUp,
  Megaphone,
  Search,
  Mail,
  MapPin,
  Share2,
  MoreHorizontal,
  Calendar,
  DollarSign,
} from "lucide-react";

interface Measure {
  id: string;
  name: string;
  category: string;
  description: string | null;
  cost: number | null;
  startDate: string;
  endDate: string | null;
  status: string;
  targetMetric: string | null;
  targetValue: number | null;
  effects: {
    roi: number | null;
    beforeSessions: number;
    afterSessions: number;
    beforePatients: number;
    afterPatients: number;
  }[];
}

const CATEGORY_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  ADVERTISING: { label: "広告", icon: <Megaphone className="h-4 w-4" />, color: "bg-blue-100 text-blue-700" },
  SEO: { label: "SEO", icon: <Search className="h-4 w-4" />, color: "bg-purple-100 text-purple-700" },
  DIRECT_MAIL: { label: "DM/ポスティング", icon: <Mail className="h-4 w-4" />, color: "bg-amber-100 text-amber-700" },
  SNS: { label: "SNS", icon: <Share2 className="h-4 w-4" />, color: "bg-pink-100 text-pink-700" },
  MEO: { label: "MEO", icon: <MapPin className="h-4 w-4" />, color: "bg-emerald-100 text-emerald-700" },
  OTHER: { label: "その他", icon: <MoreHorizontal className="h-4 w-4" />, color: "bg-slate-100 text-slate-700" },
};

export default function MeasuresPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "ADVERTISING",
    description: "",
    cost: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    targetMetric: "",
    targetValue: "",
  });

  useEffect(() => {
    fetchMeasures();
  }, [resolvedParams.id]);

  const fetchMeasures = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/clinics/${resolvedParams.id}/measures`);
      if (response.ok) {
        const data = await response.json();
        setMeasures(data);
      }
    } catch (err) {
      console.error("Error fetching measures:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/clinics/${resolvedParams.id}/measures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          description: formData.description || undefined,
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          targetMetric: formData.targetMetric || undefined,
          targetValue: formData.targetValue ? parseFloat(formData.targetValue) : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "登録に失敗しました");
        return;
      }

      await fetchMeasures();
      setShowForm(false);
      setFormData({
        name: "",
        category: "ADVERTISING",
        description: "",
        cost: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        targetMetric: "",
        targetValue: "",
      });
    } catch {
      setError("登録中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
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
            <h1 className="text-2xl font-bold text-slate-900">施策管理</h1>
            <p className="text-slate-500 mt-1">
              実施中の施策と効果を管理します
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          新規施策
        </Button>
      </div>

      {/* New Measure Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>新規施策登録</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">施策名 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                    placeholder="例: Google広告キャンペーン"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">カテゴリ *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value }))}
                    className="flex h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  placeholder="施策の詳細..."
                  className="flex min-h-[80px] w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cost">費用（円）</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData((f) => ({ ...f, cost: e.target.value }))}
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">開始日 *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData((f) => ({ ...f, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">終了日</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData((f) => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="targetMetric">目標指標</Label>
                  <Input
                    id="targetMetric"
                    value={formData.targetMetric}
                    onChange={(e) => setFormData((f) => ({ ...f, targetMetric: e.target.value }))}
                    placeholder="例: 新規患者数"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetValue">目標値</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => setFormData((f) => ({ ...f, targetValue: e.target.value }))}
                    placeholder="例: 30"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  キャンセル
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  登録する
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Measures List */}
      {measures.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              施策が登録されていません
            </h3>
            <p className="text-slate-500 mb-6">
              「新規施策」ボタンから施策を追加してください
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {measures.map((measure) => {
            const category = CATEGORY_LABELS[measure.category] || CATEGORY_LABELS.OTHER;
            const latestEffect = measure.effects[0];

            return (
              <Card key={measure.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{measure.name}</h3>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs mt-1 ${category.color}`}>
                          {category.label}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        measure.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {measure.status === "ACTIVE" ? "実施中" : "終了"}
                    </span>
                  </div>

                  {measure.description && (
                    <p className="text-sm text-slate-500 mt-3 line-clamp-2">
                      {measure.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(measure.startDate).toLocaleDateString("ja-JP")}
                        {measure.endDate && ` ~ ${new Date(measure.endDate).toLocaleDateString("ja-JP")}`}
                      </span>
                    </div>
                    {measure.cost && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>¥{measure.cost.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {latestEffect && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">効果測定結果</span>
                        {latestEffect.roi !== null && (
                          <span
                            className={`font-bold ${
                              latestEffect.roi > 0 ? "text-emerald-600" : "text-red-600"
                            }`}
                          >
                            <TrendingUp className="h-4 w-4 inline mr-1" />
                            ROI: {latestEffect.roi.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

