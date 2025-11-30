"use client";

import { signOut } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { LogOut, User, Bell } from "lucide-react";

interface HeaderProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    organizationId: string | null;
  };
}

const roleLabels: Record<UserRole, string> = {
  SYSTEM_ADMIN: "システム管理者",
  ORG_ADMIN: "組織管理者",
  SALES: "営業担当者",
};

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {/* Breadcrumb or page title can go here */}
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full" />
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-900">
                {user.name || user.email}
              </p>
              <p className="text-xs text-slate-500">{roleLabels[user.role]}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-slate-400 hover:text-slate-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

