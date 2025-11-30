import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fetchSearchConsoleData, fetchDeviceData, fetchDailyTrend } from "@/lib/google/searchconsole";

// GET /api/clinics/[id]/searchconsole - サーチコンソールデータを取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    // デフォルトは過去30日
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startDate = searchParams.get("startDate") || thirtyDaysAgo.toISOString().split("T")[0];
    const endDate = searchParams.get("endDate") || today.toISOString().split("T")[0];

    // Verify clinic access
    const clinic = await prisma.dentalClinic.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
        deletedAt: null,
      },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: "医院が見つかりません" },
        { status: 404 }
      );
    }

    if (!clinic.gscSiteUrl) {
      return NextResponse.json(
        { error: "Search Console サイトURLが設定されていません" },
        { status: 400 }
      );
    }

    // Fetch data from Search Console
    const [searchData, deviceData, dailyTrend] = await Promise.all([
      fetchSearchConsoleData(clinic.gscSiteUrl, startDate, endDate),
      fetchDeviceData(clinic.gscSiteUrl, startDate, endDate),
      fetchDailyTrend(clinic.gscSiteUrl, startDate, endDate),
    ]);

    // Save to database
    await prisma.searchConsoleData.create({
      data: {
        dentalClinicId: id,
        periodStart: new Date(startDate),
        periodEnd: new Date(endDate),
        totalClicks: searchData.totalClicks,
        totalImpressions: searchData.totalImpressions,
        avgCtr: searchData.avgCtr,
        avgPosition: searchData.avgPosition,
        queryData: searchData.queryData,
        pageData: searchData.pageData,
        rawData: { deviceData, dailyTrend },
      },
    });

    return NextResponse.json({
      summary: {
        totalClicks: searchData.totalClicks,
        totalImpressions: searchData.totalImpressions,
        avgCtr: searchData.avgCtr,
        avgPosition: searchData.avgPosition,
      },
      queries: searchData.queryData,
      pages: searchData.pageData,
      devices: deviceData,
      dailyTrend,
    });
  } catch (error) {
    console.error("Error fetching search console data:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("認証情報")) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "サーチコンソールデータの取得に失敗しました" },
      { status: 500 }
    );
  }
}

