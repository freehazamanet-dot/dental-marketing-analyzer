"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Mail, Shield, Plus, UserCircle } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  SYSTEM_ADMIN: { label: "システム管理者", color: "bg-purple-100 text-purple-700" },
  ORG_ADMIN: { label: "組織管理者", color: "bg-blue-100 text-blue-700" },
  SALES: { label: "営業担当者", color: "bg-emerald-100 text-emerald-700" },
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/members");
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
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
          <h1 className="text-2xl font-bold text-slate-900">メンバー管理</h1>
          <p className="text-slate-500 mt-1">組織のメンバーを管理します</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          メンバーを招待
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => {
          const role = ROLE_LABELS[member.role] || {
            label: member.role,
            color: "bg-slate-100 text-slate-700",
          };
          return (
            <Card key={member.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100">
                    <UserCircle className="h-8 w-8 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{member.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                      <Mail className="h-3.5 w-3.5" />
                      {member.email}
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${role.color}`}
                    >
                      {role.label}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

