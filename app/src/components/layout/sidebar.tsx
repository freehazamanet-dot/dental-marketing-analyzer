"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  LayoutDashboard,
  Building,
  BarChart3,
  Users,
  Settings,
  FileText,
  Target,
  TrendingUp,
} from "lucide-react";

const navigation = [
  { name: "ダッシュボード", href: "/dashboard", icon: LayoutDashboard },
  { name: "歯科医院管理", href: "/clinics", icon: Building },
  { name: "分析レポート", href: "/reports", icon: BarChart3 },
  { name: "施策管理", href: "/measures", icon: Target },
  { name: "患者データ", href: "/patients", icon: TrendingUp },
];

const secondaryNavigation = [
  { name: "メンバー管理", href: "/members", icon: Users },
  { name: "マスタ管理", href: "/masters", icon: FileText },
  { name: "設定", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-slate-200 px-6 pb-4">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/30">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">DentalMarketing</h1>
            <p className="text-xs text-slate-500">Analyzer</p>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex gap-x-3 rounded-lg p-3 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-gradient-to-r from-teal-500/10 to-emerald-500/10 text-teal-700 border border-teal-200"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-colors",
                            isActive
                              ? "text-teal-600"
                              : "text-slate-400 group-hover:text-slate-600"
                          )}
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>

            {/* Secondary Navigation */}
            <li>
              <div className="text-xs font-semibold leading-6 text-slate-400 uppercase tracking-wider">
                管理
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {secondaryNavigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex gap-x-3 rounded-lg p-3 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-gradient-to-r from-teal-500/10 to-emerald-500/10 text-teal-700 border border-teal-200"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-colors",
                            isActive
                              ? "text-teal-600"
                              : "text-slate-400 group-hover:text-slate-600"
                          )}
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

