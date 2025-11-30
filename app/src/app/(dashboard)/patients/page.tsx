"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  ArrowRight,
  Building,
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface PatientData {
  id: string;
  year: number;
  month: number;
  totalNewPatients: number;
  clinic: {
    id: string;
    name: string;
  };
}

export default function PatientsPage() {
  const [patientData, setPatientData] = useState<PatientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      const response = await fetch("/api/patients");
      if (response.ok) {
        const data = await response.json();
        setPatientData(data);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
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
          <h1 className="text-2xl font-bold text-slate-900">患者データ</h1>
          <p className="text-slate-500 mt-1">
            全医院の新規患者データを一覧で確認できます
          </p>
        </div>
      </div>

      {patientData.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              患者データがありません
            </h3>
            <p className="text-slate-500 mb-6">
              歯科医院の詳細ページから患者データを入力してください
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
          {patientData.map((data) => (
            <Link key={data.id} href={`/clinics/${data.clinic.id}/patients`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{data.clinic.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="h-4 w-4" />
                      {data.year}年{data.month}月
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-teal-500" />
                      <span className="font-bold text-teal-600">
                        {data.totalNewPatients}人
                      </span>
                    </div>
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

