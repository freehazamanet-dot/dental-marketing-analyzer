import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Building, Key } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">設定</h1>
        <p className="text-slate-500 mt-1">アカウントと組織の設定を管理します</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-teal-500" />
            プロフィール
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>名前</Label>
            <Input defaultValue={session?.user?.name || ""} />
          </div>
          <div className="space-y-2">
            <Label>メールアドレス</Label>
            <Input defaultValue={session?.user?.email || ""} disabled />
            <p className="text-xs text-slate-500">
              メールアドレスは変更できません
            </p>
          </div>
          <Button>プロフィールを更新</Button>
        </CardContent>
      </Card>

      {/* Organization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-teal-500" />
            組織設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>組織名</Label>
            <Input defaultValue="デモ組織" />
          </div>
          <div className="space-y-2">
            <Label>プラン</Label>
            <div className="p-3 rounded-lg bg-slate-50">
              <span className="font-medium">スタンダードプラン</span>
            </div>
          </div>
          <Button>組織情報を更新</Button>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-teal-500" />
            API連携設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Google Places API</Label>
            <div className="flex items-center gap-2">
              <Input type="password" value="••••••••••••" disabled />
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs whitespace-nowrap">
                設定済み
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>OpenRouter API</Label>
            <div className="flex items-center gap-2">
              <Input type="password" value="••••••••••••" disabled />
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs whitespace-nowrap">
                設定済み
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            API設定は環境変数で管理されています
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
