"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Save, Calendar, Users } from "lucide-react";

interface ChiefComplaint {
  id: string;
  name: string;
  icon: string | null;
}

interface PatientByComplaint {
  chiefComplaintId: string;
  patientCount: number;
}

export default function PatientDataInputPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [complaints, setComplaints] = useState<ChiefComplaint[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [memo, setMemo] = useState("");
  const [patientCounts, setPatientCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/masters/complaints");
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
        // Initialize patient counts
        const counts: Record<string, number> = {};
        data.forEach((c: ChiefComplaint) => {
          counts[c.id] = 0;
        });
        setPatientCounts(counts);
      }
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountChange = (id: string, value: string) => {
    const count = parseInt(value) || 0;
    setPatientCounts((prev) => ({ ...prev, [id]: count }));
  };

  const calculateTotal = () => {
    return Object.values(patientCounts).reduce((sum, count) => sum + count, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const byComplaint: PatientByComplaint[] = Object.entries(patientCounts)
        .filter(([, count]) => count > 0)
        .map(([id, count]) => ({
          chiefComplaintId: id,
          patientCount: count,
        }));

      const response = await fetch(`/api/clinics/${resolvedParams.id}/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          month,
          totalNewPatients: calculateTotal(),
          memo: memo || undefined,
          byComplaint,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "保存に失敗しました");
        return;
      }

      setSuccess("患者データを保存しました");
      setTimeout(() => {
        router.push(`/clinics/${resolvedParams.id}`);
      }, 1500);
    } catch {
      setError("保存中にエラーが発生しました");
    } finally {
      setIsSaving(false);
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
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/clinics/${resolvedParams.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">新規患者データ入力</h1>
          <p className="text-slate-500 mt-1">
            月別・主訴別の新規患者数を入力してください
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
            {success}
          </div>
        )}

        {/* Period Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-500" />
              対象年月
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="space-y-2">
                <Label>年</Label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="flex h-11 w-32 rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  {[...Array(5)].map((_, i) => {
                    const y = new Date().getFullYear() - i;
                    return (
                      <option key={y} value={y}>
                        {y}年
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="space-y-2">
                <Label>月</Label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="flex h-11 w-24 rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}月
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Counts by Complaint */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-500" />
              主訴別新規患者数
            </CardTitle>
            <CardDescription>
              各主訴の新規患者数を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{complaint.icon || "🦷"}</span>
                    <span className="font-medium">{complaint.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={patientCounts[complaint.id] || 0}
                      onChange={(e) => handleCountChange(complaint.id, e.target.value)}
                      className="w-24 text-right"
                    />
                    <span className="text-slate-500">人</span>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-4 border-t-2 border-slate-200">
                <span className="font-bold text-lg">合計</span>
                <span className="font-bold text-2xl text-teal-600">
                  {calculateTotal()} 人
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memo */}
        <Card>
          <CardHeader>
            <CardTitle>メモ・特記事項</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="特記事項があれば入力してください..."
              className="flex min-h-[100px] w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href={`/clinics/${resolvedParams.id}`}>
            <Button type="button" variant="outline">
              キャンセル
            </Button>
          </Link>
          <Button type="submit" isLoading={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            保存する
          </Button>
        </div>
      </form>
    </div>
  );
}

