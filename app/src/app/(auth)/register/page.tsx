"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Lock, User, Building } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(1, "名前を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "パスワードは大文字、小文字、数字を含む必要があります"
    ),
  confirmPassword: z.string(),
  organizationName: z.string().min(1, "組織名を入力してください"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          organizationName: data.organizationName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "登録中にエラーが発生しました");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("登録中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/30 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            DentalMarketing Analyzer
          </h1>
          <p className="text-slate-500 mt-1">歯科医院向けマーケティング分析</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">新規登録</CardTitle>
            <CardDescription>
              アカウントを作成して始めましょう
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="organizationName">組織名</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="organizationName"
                    placeholder="株式会社〇〇"
                    className="pl-10"
                    error={errors.organizationName?.message}
                    {...register("organizationName")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">お名前</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="name"
                    placeholder="山田 太郎"
                    className="pl-10"
                    error={errors.name?.message}
                    {...register("name")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@company.com"
                    className="pl-10"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="8文字以上（大文字・小文字・数字）"
                    className="pl-10"
                    error={errors.password?.message}
                    {...register("password")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">パスワード（確認）</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="パスワードを再入力"
                    className="pl-10"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                アカウントを作成
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-slate-500">既にアカウントをお持ちの方は</span>{" "}
              <Link
                href="/login"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                ログイン
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

