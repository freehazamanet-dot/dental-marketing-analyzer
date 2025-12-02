import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/clinics/[id]/analysis/[analysisId]/report - PDF用データ取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; analysisId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, analysisId } = await params;

    // 医院情報を取得
    const clinic = await prisma.dentalClinic.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        prefecture: true,
        city: true,
        address: true,
        websiteUrl: true,
      },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: "医院が見つかりません" },
        { status: 404 }
      );
    }

    // 分析結果を取得
    const analysis = await prisma.analysisResult.findFirst({
      where: {
        id: analysisId,
        dentalClinicId: id,
      },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "分析結果が見つかりません" },
        { status: 404 }
      );
    }

    // 最新の口コミデータを取得
    const review = await prisma.reviewData.findFirst({
      where: { dentalClinicId: id },
      orderBy: { fetchedAt: "desc" },
      select: {
        averageRating: true,
        totalReviews: true,
      },
    });

    // 競合データを取得
    const competitors = await prisma.competitor.findMany({
      where: {
        dentalClinicId: id,
        isActive: true,
      },
      select: {
        name: true,
        reviewData: {
          orderBy: { fetchedAt: "desc" },
          take: 1,
          select: {
            averageRating: true,
            totalReviews: true,
          },
        },
      },
    });

    return NextResponse.json({
      clinic,
      analysis: {
        analyzedAt: analysis.analyzedAt.toISOString(),
        overallScore: analysis.overallScore,
        trafficScore: analysis.trafficScore,
        engagementScore: analysis.engagementScore,
        reviewScore: analysis.reviewScore,
        issues: analysis.issues as { type: string; severity: string; message: string }[],
        aiAnalysis: analysis.aiAnalysis,
      },
      review,
      competitors,
    });
  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json(
      { error: "レポートデータの取得に失敗しました" },
      { status: 500 }
    );
  }
}

