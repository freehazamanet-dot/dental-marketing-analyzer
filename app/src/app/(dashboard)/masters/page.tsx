"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Stethoscope, Target, AlertTriangle } from "lucide-react";

interface ChiefComplaint {
  id: string;
  name: string;
  icon: string | null;
  isActive: boolean;
}

interface ServiceMaster {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
}

export default function MastersPage() {
  const [complaints, setComplaints] = useState<ChiefComplaint[]>([]);
  const [services, setServices] = useState<ServiceMaster[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const [complaintsRes, servicesRes] = await Promise.all([
        fetch("/api/masters/complaints"),
        fetch("/api/masters/services"),
      ]);

      if (complaintsRes.ok) {
        setComplaints(await complaintsRes.json());
      }
      if (servicesRes.ok) {
        setServices(await servicesRes.json());
      }
    } catch (error) {
      console.error("Error fetching masters:", error);
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">マスタ管理</h1>
        <p className="text-slate-500 mt-1">システムのマスタデータを管理します</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chief Complaints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-teal-500" />
              主訴マスタ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{complaint.icon || "🦷"}</span>
                    <span className="font-medium">{complaint.name}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      complaint.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {complaint.isActive ? "有効" : "無効"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-teal-500" />
              提案サービスマスタ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                >
                  <div>
                    <span className="font-medium">{service.name}</span>
                    <span className="ml-2 text-xs text-slate-500">
                      ({service.category})
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      service.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {service.isActive ? "有効" : "無効"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

