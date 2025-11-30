import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/reports - 全分析レポート一覧
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = await prisma.analysisResult.findMany({
      where: {
        dentalClinic: {
          organizationId: session.user.organizationId,
          deletedAt: null,
        },
      },
      orderBy: { analyzedAt: "desc" },
      take: 50,
      include: {
        dentalClinic: {
          select: {
            id: true,
            name: true,
            prefecture: true,
            city: true,
          },
        },
      },
    });

    return NextResponse.json(
      reports.map((r) => ({
        id: r.id,
        clinic: r.dentalClinic,
        analyzedAt: r.analyzedAt,
        overallScore: r.overallScore,
        status: r.status,
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

