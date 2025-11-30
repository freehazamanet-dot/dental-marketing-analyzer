import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/patients - 全患者データ一覧
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patientData = await prisma.monthlyPatientData.findMany({
      where: {
        dentalClinic: {
          organizationId: session.user.organizationId,
          deletedAt: null,
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
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
      patientData.map((p) => ({
        id: p.id,
        year: p.year,
        month: p.month,
        totalNewPatients: p.totalNewPatients,
        clinic: p.dentalClinic,
      }))
    );
  } catch (error) {
    console.error("Error fetching patient data:", error);
    return NextResponse.json(
      { error: "患者データの取得に失敗しました" },
      { status: 500 }
    );
  }
}

