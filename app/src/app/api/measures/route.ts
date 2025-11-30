import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/measures - 全施策一覧
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const measures = await prisma.measure.findMany({
      where: {
        dentalClinic: {
          organizationId: session.user.organizationId,
          deletedAt: null,
        },
      },
      orderBy: { startDate: "desc" },
      take: 50,
      include: {
        dentalClinic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      measures.map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        status: m.status,
        startDate: m.startDate,
        cost: m.cost,
        clinic: m.dentalClinic,
      }))
    );
  } catch (error) {
    console.error("Error fetching measures:", error);
    return NextResponse.json(
      { error: "施策の取得に失敗しました" },
      { status: 500 }
    );
  }
}

