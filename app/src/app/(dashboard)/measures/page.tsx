"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Target,
  ArrowRight,
  Calendar,
  Building,
  TrendingUp,
} from "lucide-react";

interface Measure {
  id: string;
  name: string;
  category: string;
  status: string;
  startDate: string;
  cost: number | null;
  clinic: {
    id: string;
    name: string;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  ADVERTISING: "広告",
  SEO: "SEO",
  DIRECT_MAIL: "DM/ポスティング",
  SNS: "SNS",
  MEO: "MEO",
  OTHER: "その他",
};

export default function MeasuresPage() {
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMeasures();
  }, []);

  const fetchMeasures = async () => {
    try {
      const response = await fetch("/api/measures");
      if (response.ok) {
        const data = await response.json();
        setMeasures(data);
      }
    } catch (error) {
      console.error("Error fetching measures:", error);
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
          <h1 className="text-2xl font-bold text-slate-900">施策管理</h1>
          <p className="text-slate-500 mt-1">全医院の施策を一覧で確認できます</p>
        </div>
      </div>

      {measures.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              施策が登録されていません
            </h3>
            <p className="text-slate-500 mb-6">
              歯科医院の詳細ページから施策を登録してください
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
          {measures.map((measure) => (
            <Link
              key={measure.id}
              href={`/clinics/${measure.clinic.id}/measures`}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{measure.name}</CardTitle>
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
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 w-fit">
                    {CATEGORY_LABELS[measure.category] || measure.category}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {measure.clinic.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(measure.startDate).toLocaleDateString("ja-JP")}〜
                    </div>
                    {measure.cost && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        ¥{measure.cost.toLocaleString()}
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

