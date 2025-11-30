"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Building, MapPin, Phone, Globe, Hash, LineChart, Search, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

const SPECIALTIES = [
  "一般歯科", "矯正歯科", "小児歯科", "口腔外科", "インプラント",
  "ホワイトニング", "審美歯科", "予防歯科", "歯周病治療", "入れ歯・義歯"
];

const clinicSchema = z.object({
  name: z.string().min(1, "医院名を入力してください"),
  postalCode: z.string().optional(),
  prefecture: z.string().min(1, "都道府県を選択してください"),
  city: z.string().min(1, "市区町村を入力してください"),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  websiteUrl: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
  googlePlaceId: z.string().optional(),
  gaPropertyId: z.string().optional(),
  gscSiteUrl: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
  specialties: z.array(z.string()).default([]),
});

type ClinicFormData = z.infer<typeof clinicSchema>;

export default function NewClinicPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [placeIdInput, setPlaceIdInput] = useState("");
  const [extractedPlaceId, setExtractedPlaceId] = useState<string | null>(null);
  const [extractedPlaceName, setExtractedPlaceName] = useState<string | null>(null);
  const [placeIdWarning, setPlaceIdWarning] = useState<string | null>(null);
  const [isExtractingPlaceId, setIsExtractingPlaceId] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      specialties: [],
    },
  });

  // 埋め込みコードやURLからPlace IDを抽出
  const extractPlaceId = (input: string): string | null => {
    const placeIdMatch = input.match(/ChIJ[a-zA-Z0-9_-]+/);
    if (placeIdMatch) {
      return placeIdMatch[0];
    }
    const urlMatch = input.match(/!1s(ChIJ[a-zA-Z0-9_-]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }
    return null;
  };

  // Place ID入力の処理
  const handlePlaceIdInputChange = async (value: string) => {
    setPlaceIdInput(value);
    setExtractedPlaceId(null);
    setExtractedPlaceName(null);
    setPlaceIdWarning(null);

    if (!value.trim()) {
      setValue("googlePlaceId", "");
      return;
    }

    const extracted = extractPlaceId(value);
    if (extracted) {
      setExtractedPlaceId(extracted);
      setValue("googlePlaceId", extracted);
      return;
    }

    if (value.includes("google.com/maps") || value.includes("<iframe")) {
      setIsExtractingPlaceId(true);
      try {
        const response = await fetch("/api/places/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: value }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.placeId) {
            setExtractedPlaceId(data.placeId);
            setValue("googlePlaceId", data.placeId);
            if (data.name) {
              setExtractedPlaceName(data.name);
            }
            if (data.warning) {
              setPlaceIdWarning(data.warning);
            }
          }
        }
      } catch (e) {
        console.error("Place ID extraction failed:", e);
      } finally {
        setIsExtractingPlaceId(false);
      }
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  const onSubmit = async (data: ClinicFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          specialties: selectedSpecialties,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "登録中にエラーが発生しました");
        return;
      }

      router.push(`/clinics/${result.id}`);
    } catch {
      setError("登録中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/clinics">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">新規医院登録</h1>
          <p className="text-slate-500 mt-1">
            歯科医院の基本情報を入力してください
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-teal-500" />
              基本情報
            </CardTitle>
            <CardDescription>
              医院の基本情報を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">医院名 *</Label>
              <Input
                id="name"
                placeholder="○○歯科クリニック"
                error={errors.name?.message}
                {...register("name")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">電話番号</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="phoneNumber"
                    placeholder="03-1234-5678"
                    className="pl-10"
                    {...register("phoneNumber")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">ホームページURL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="websiteUrl"
                    placeholder="https://example.com"
                    className="pl-10"
                    error={errors.websiteUrl?.message}
                    {...register("websiteUrl")}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-teal-500" />
              住所情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">郵便番号</Label>
                <Input
                  id="postalCode"
                  placeholder="123-4567"
                  {...register("postalCode")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prefecture">都道府県 *</Label>
                <select
                  id="prefecture"
                  className="flex h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  {...register("prefecture")}
                >
                  <option value="">選択してください</option>
                  {PREFECTURES.map((pref) => (
                    <option key={pref} value={pref}>
                      {pref}
                    </option>
                  ))}
                </select>
                {errors.prefecture && (
                  <p className="text-sm text-red-500">{errors.prefecture.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">市区町村 *</Label>
              <Input
                id="city"
                placeholder="渋谷区"
                error={errors.city?.message}
                {...register("city")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">番地・建物名</Label>
              <Input
                id="address"
                placeholder="神南1-2-3 ○○ビル5F"
                {...register("address")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Google Place ID */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-teal-500" />
              Google連携情報
            </CardTitle>
            <CardDescription>
              Google口コミ取得のためのPlace IDを入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="placeIdInput">Google Maps URL / 埋め込みコード / Place ID</Label>
              <textarea
                id="placeIdInput"
                value={placeIdInput}
                onChange={(e) => handlePlaceIdInputChange(e.target.value)}
                placeholder="以下のいずれかを貼り付けてください:&#10;• Place ID (例: ChIJdWJldKiMGGARQWP0M84v6RQ)&#10;• Google Maps URL&#10;• 埋め込み用HTMLコード (<iframe ...>)"
                className="flex min-h-[100px] w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
              />
              <p className="text-xs text-slate-500">
                Google Maps で医院を検索 → 「共有」→「地図を埋め込む」→ HTMLコードをコピーして貼り付け
              </p>
            </div>

            {isExtractingPlaceId && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 text-blue-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Place IDを抽出中...</span>
              </div>
            )}

            {extractedPlaceId && !isExtractingPlaceId && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">
                    Place ID: <code className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded">{extractedPlaceId}</code>
                  </span>
                </div>
                {extractedPlaceName && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 text-blue-700">
                    <Building className="h-4 w-4" />
                    <span className="text-sm">
                      検出された医院名: <span className="font-medium">{extractedPlaceName}</span>
                    </span>
                  </div>
                )}
                {placeIdWarning && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 text-amber-700">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{placeIdWarning}</span>
                  </div>
                )}
              </div>
            )}

            <input type="hidden" {...register("googlePlaceId")} />
          </CardContent>
        </Card>

        {/* Google Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-teal-500" />
              Google Analytics
            </CardTitle>
            <CardDescription>
              GA4からデータを取得するための設定
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="gaPropertyId">GA4 プロパティID</Label>
              <Input
                id="gaPropertyId"
                placeholder="123456789"
                {...register("gaPropertyId")}
              />
              <p className="text-xs text-slate-500">
                GA4の管理画面 → プロパティ設定 → プロパティIDを確認してください
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Google Search Console */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-teal-500" />
              Google Search Console
            </CardTitle>
            <CardDescription>
              Search Consoleからデータを取得するための設定
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="gscSiteUrl">サイトURL</Label>
              <Input
                id="gscSiteUrl"
                placeholder="https://example.com または sc-domain:example.com"
                {...register("gscSiteUrl")}
              />
              <p className="text-xs text-slate-500">
                Search Consoleで登録したプロパティURLを入力してください
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Specialties */}
        <Card>
          <CardHeader>
            <CardTitle>診療科目</CardTitle>
            <CardDescription>
              該当する診療科目を選択してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => toggleSpecialty(specialty)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedSpecialties.includes(specialty)
                      ? "bg-teal-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/clinics">
            <Button type="button" variant="outline">
              キャンセル
            </Button>
          </Link>
          <Button type="submit" isLoading={isLoading}>
            登録する
          </Button>
        </div>
      </form>
    </div>
  );
}

