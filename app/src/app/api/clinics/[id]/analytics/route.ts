import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fetchAnalyticsData, fetchPageData, fetchDeviceData } from "@/lib/google/analytics";

// GET /api/clinics/[id]/analytics - アナリティクスデータを取得
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
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "today";

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

    if (!clinic.gaPropertyId) {
      return NextResponse.json(
        { error: "Google Analytics プロパティIDが設定されていません" },
        { status: 400 }
      );
    }

    // Fetch data from Google Analytics
    const [analyticsData, pageData, deviceData] = await Promise.all([
      fetchAnalyticsData(clinic.gaPropertyId, startDate, endDate),
      fetchPageData(clinic.gaPropertyId, startDate, endDate),
      fetchDeviceData(clinic.gaPropertyId, startDate, endDate),
    ]);

    // Save to database
    await prisma.analyticsData.create({
      data: {
        dentalClinicId: id,
        periodStart: new Date(startDate === "30daysAgo" ? Date.now() - 30 * 24 * 60 * 60 * 1000 : startDate),
        periodEnd: new Date(endDate === "today" ? Date.now() : endDate),
        totalSessions: analyticsData.totalSessions,
        totalUsers: analyticsData.totalUsers,
        newUsers: analyticsData.newUsers,
        avgSessionDuration: analyticsData.avgSessionDuration,
        bounceRate: analyticsData.bounceRate,
        regionData: analyticsData.regionData,
        cityData: analyticsData.cityData,
        channelData: analyticsData.channelData,
        paidSessions: analyticsData.paidSessions,
        paidBounceRate: analyticsData.paidBounceRate,
        rawData: { pageData, deviceData },
      },
    });

    return NextResponse.json({
      analytics: analyticsData,
      pages: pageData,
      devices: deviceData,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("認証情報")) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "アナリティクスデータの取得に失敗しました" },
      { status: 500 }
    );
  }
}

