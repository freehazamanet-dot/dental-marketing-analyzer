"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Plus, Search, MapPin, Star, BarChart3 } from "lucide-react";

interface Clinic {
  id: string;
  name: string;
  prefecture: string;
  city: string;
  status: string;
  reviewData: { averageRating: number; totalReviews: number }[];
  analysisResults: { analyzedAt: string; overallScore: number | null }[];
  assignedUser: { name: string | null } | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchClinics();
  }, [currentPage, search]);

  const fetchClinics = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(search && { search }),
      });

      const response = await fetch(`/api/clinics?${params}`);
      const data = await response.json();

      if (response.ok) {
        setClinics(data.clinics);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching clinics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchClinics();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">歯科医院管理</h1>
          <p className="text-slate-500 mt-1">
            登録されている歯科医院の一覧と管理
          </p>
        </div>
        <Link href="/clinics/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新規登録
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="医院名・住所で検索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="secondary">
              検索
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Clinics List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>医院一覧</span>
            {pagination && (
              <span className="text-sm font-normal text-slate-500">
                全 {pagination.total} 件
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto" />
              <p className="text-slate-500 mt-4">読み込み中...</p>
            </div>
          ) : clinics.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">医院が見つかりません</p>
              <Link
                href="/clinics/new"
                className="text-teal-600 hover:text-teal-700 font-medium text-sm mt-2 inline-block"
              >
                医院を登録する →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {clinics.map((clinic) => (
                <Link
                  key={clinic.id}
                  href={`/clinics/${clinic.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-teal-500/10 to-emerald-500/10 group-hover:from-teal-500/20 group-hover:to-emerald-500/20 transition-colors">
                      <Building className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {clinic.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{clinic.prefecture}{clinic.city}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {clinic.reviewData[0] && (
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          <span className="font-semibold text-slate-900">
                            {clinic.reviewData[0].averageRating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {clinic.reviewData[0].totalReviews}件
                        </p>
                      </div>
                    )}
                    {clinic.analysisResults[0] && (
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-4 w-4 text-teal-500" />
                          <span className="font-semibold text-slate-900">
                            {clinic.analysisResults[0].overallScore ?? "-"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">スコア</p>
                      </div>
                    )}
                    <div
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        clinic.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700"
                          : clinic.status === "PENDING"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {clinic.status === "ACTIVE"
                        ? "アクティブ"
                        : clinic.status === "PENDING"
                        ? "連携待ち"
                        : "非アクティブ"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                前へ
              </Button>
              <span className="text-sm text-slate-500">
                {currentPage} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === pagination.totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                次へ
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

