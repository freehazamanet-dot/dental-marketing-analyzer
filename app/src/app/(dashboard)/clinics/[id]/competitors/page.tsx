"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ArrowLeft,
  Plus,
  Search,
  MapPin,
  Star,
  Building,
  TrendingUp,
  TrendingDown,
  Minus,
  Wand2,
  Loader2,
} from "lucide-react";

interface Competitor {
  id: string;
  name: string;
  address: string | null;
  googlePlaceId: string;
  reviewData: {
    averageRating: number;
    totalReviews: number;
    fetchedAt: string;
  }[];
}

interface SearchResult {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  totalReviews?: number;
}

export default function CompetitorsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState({ lat: "", lng: "" });
  const [ownClinicRating, setOwnClinicRating] = useState<number | null>(null);
  const [ownClinicReviews, setOwnClinicReviews] = useState<number | null>(null);

  useEffect(() => {
    fetchCompetitors();
    fetchOwnClinicData();
  }, [resolvedParams.id]);

  const fetchCompetitors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/clinics/${resolvedParams.id}/competitors`);
      if (response.ok) {
        const data = await response.json();
        setCompetitors(data);
      }
    } catch (err) {
      console.error("Error fetching competitors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOwnClinicData = async () => {
    try {
      const response = await fetch(`/api/clinics/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.reviewData && data.reviewData.length > 0) {
          setOwnClinicRating(data.reviewData[0].averageRating);
          setOwnClinicReviews(data.reviewData[0].totalReviews);
        }
      }
    } catch (err) {
      console.error("Error fetching clinic data:", err);
    }
  };

  // 競合医院を自動取得
  const handleAutoFetch = async () => {
    setIsAutoFetching(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/clinics/${resolvedParams.id}/competitors/auto`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "自動取得に失敗しました");
        return;
      }

      setSuccessMessage(data.message);
      await fetchCompetitors();
    } catch {
      setError("自動取得中にエラーが発生しました");
    } finally {
      setIsAutoFetching(false);
    }
  };

  const handleSearch = async () => {
    if (!searchLocation.lat || !searchLocation.lng) {
      setError("緯度と経度を入力してください");
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/clinics/${resolvedParams.id}/competitors/search?lat=${searchLocation.lat}&lng=${searchLocation.lng}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "検索に失敗しました");
        return;
      }

      setSearchResults(data);
    } catch {
      setError("検索中にエラーが発生しました");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddCompetitor = async (result: SearchResult) => {
    setIsAdding(true);
    setError(null);

    try {
      const response = await fetch(`/api/clinics/${resolvedParams.id}/competitors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googlePlaceId: result.placeId,
          name: result.name,
          address: result.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "追加に失敗しました");
        return;
      }

      await fetchCompetitors();
      setSearchResults((prev) => prev.filter((r) => r.placeId !== result.placeId));
    } catch {
      setError("追加中にエラーが発生しました");
    } finally {
      setIsAdding(false);
    }
  };

  const getRatingDiff = (competitorRating: number) => {
    if (ownClinicRating === null) return null;
    return competitorRating - ownClinicRating;
  };

  const getReviewsDiff = (competitorReviews: number) => {
    if (ownClinicReviews === null) return null;
    return competitorReviews - ownClinicReviews;
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
            <h1 className="text-2xl font-bold text-slate-900">競合医院管理</h1>
            <p className="text-slate-500 mt-1">
              周辺の競合医院と口コミを比較します
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAutoFetch} disabled={isAutoFetching} variant="outline">
            {isAutoFetching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4 mr-2" />
            )}
            自動取得
          </Button>
          <Button onClick={() => setShowSearch(!showSearch)}>
            <Plus className="h-4 w-4 mr-2" />
            手動で追加
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
          {successMessage}
        </div>
      )}

      {/* Search Panel */}
      {showSearch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              周辺の歯科医院を検索
            </CardTitle>
            <CardDescription>
              医院の緯度・経度を入力して周辺の歯科医院を検索します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="緯度（例: 35.6762）"
                  value={searchLocation.lat}
                  onChange={(e) => setSearchLocation((p) => ({ ...p, lat: e.target.value }))}
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="経度（例: 139.6503）"
                  value={searchLocation.lng}
                  onChange={(e) => setSearchLocation((p) => ({ ...p, lng: e.target.value }))}
                />
              </div>
              <Button onClick={handleSearch} isLoading={isSearching}>
                <Search className="h-4 w-4 mr-2" />
                検索
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  {searchResults.length}件の歯科医院が見つかりました
                </p>
                {searchResults.map((result) => (
                  <div
                    key={result.placeId}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50"
                  >
                    <div>
                      <p className="font-medium">{result.name}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {result.address}
                      </p>
                      {result.rating && (
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          {result.rating} ({result.totalReviews}件)
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddCompetitor(result)}
                      disabled={isAdding}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      追加
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Competitors List */}
      {competitors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              競合医院が登録されていません
            </h3>
            <p className="text-slate-500 mb-6">
              「自動取得」ボタンで医院の住所周辺の競合を自動で取得できます
            </p>
            <Button onClick={handleAutoFetch} disabled={isAutoFetching}>
              {isAutoFetching ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              競合を自動取得
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Summary Card */}
          {ownClinicRating !== null && (
            <Card>
              <CardHeader>
                <CardTitle>競合比較サマリー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 rounded-lg bg-teal-50">
                    <p className="text-sm text-slate-500">自院評価</p>
                    <p className="text-2xl font-bold text-teal-600 mt-1">
                      {ownClinicRating.toFixed(1)}
                    </p>
                    <p className="text-xs text-slate-500">{ownClinicReviews}件</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-slate-50">
                    <p className="text-sm text-slate-500">競合平均</p>
                    <p className="text-2xl font-bold text-slate-700 mt-1">
                      {(
                        competitors.reduce(
                          (sum, c) => sum + (c.reviewData[0]?.averageRating || 0),
                          0
                        ) / competitors.filter((c) => c.reviewData[0]).length || 0
                      ).toFixed(1)}
                    </p>
                    <p className="text-xs text-slate-500">
                      平均{" "}
                      {Math.round(
                        competitors.reduce(
                          (sum, c) => sum + (c.reviewData[0]?.totalReviews || 0),
                          0
                        ) / competitors.filter((c) => c.reviewData[0]).length || 0
                      )}
                      件
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-slate-50">
                    <p className="text-sm text-slate-500">登録競合数</p>
                    <p className="text-2xl font-bold text-slate-700 mt-1">
                      {competitors.length}
                    </p>
                    <p className="text-xs text-slate-500">医院</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Competitor Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {competitors.map((competitor) => {
              const review = competitor.reviewData[0];
              const ratingDiff = review ? getRatingDiff(review.averageRating) : null;
              const reviewsDiff = review ? getReviewsDiff(review.totalReviews) : null;

              return (
                <Card key={competitor.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{competitor.name}</h3>
                        {competitor.address && (
                          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {competitor.address}
                          </p>
                        )}
                      </div>
                    </div>

                    {review && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-slate-50">
                          <p className="text-xs text-slate-500">評価</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                            <span className="text-xl font-bold">
                              {review.averageRating.toFixed(1)}
                            </span>
                            {ratingDiff !== null && (
                              <span
                                className={`text-sm flex items-center ${
                                  ratingDiff > 0
                                    ? "text-red-500"
                                    : ratingDiff < 0
                                    ? "text-emerald-500"
                                    : "text-slate-400"
                                }`}
                              >
                                {ratingDiff > 0 ? (
                                  <TrendingUp className="h-3.5 w-3.5" />
                                ) : ratingDiff < 0 ? (
                                  <TrendingDown className="h-3.5 w-3.5" />
                                ) : (
                                  <Minus className="h-3.5 w-3.5" />
                                )}
                                {Math.abs(ratingDiff).toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50">
                          <p className="text-xs text-slate-500">口コミ数</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xl font-bold">{review.totalReviews}</span>
                            <span className="text-sm text-slate-500">件</span>
                            {reviewsDiff !== null && (
                              <span
                                className={`text-sm flex items-center ${
                                  reviewsDiff > 0
                                    ? "text-red-500"
                                    : reviewsDiff < 0
                                    ? "text-emerald-500"
                                    : "text-slate-400"
                                }`}
                              >
                                {reviewsDiff > 0 ? "+" : ""}
                                {reviewsDiff}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {review && (
                      <p className="text-xs text-slate-400 mt-3">
                        取得日: {new Date(review.fetchedAt).toLocaleDateString("ja-JP")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

