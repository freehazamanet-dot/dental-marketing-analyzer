import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/reports - 全分析レポート一覧
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");
    const limit = parseInt(searchParams.get("limit") || "50");

    const reports = await prisma.analysisResult.findMany({
      where: {
        dentalClinic: {
          organizationId: session.user.organizationId,
          deletedAt: null,
          ...(clinicId ? { id: clinicId } : {}),
        },
      },
      orderBy: { analyzedAt: "desc" },
      take: limit,
      include: {
        dentalClinic: {
          select: {
            id: true,
            name: true,
            prefecture: true,
            city: true,
          },
        },
        analyzedBy: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      reports.map((r) => ({
        id: r.id,
        clinic: r.dentalClinic,
        analyzedAt: r.analyzedAt,
        analyzedBy: r.analyzedBy?.name || "不明",
        overallScore: r.overallScore,
        trafficScore: r.trafficScore,
        engagementScore: r.engagementScore,
        reviewScore: r.reviewScore,
        status: r.status,
        issueCount: Array.isArray(r.issues) ? r.issues.length : 0,
      }))
    );
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "レポートの取得に失敗しました" },
      { status: 500 }
    );
  }
}

