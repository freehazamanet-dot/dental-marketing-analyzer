import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/masters/complaints - 主訴マスタ一覧を取得
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const complaints = await prisma.chiefComplaintMaster.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json(
      { error: "主訴マスタの取得に失敗しました" },
      { status: 500 }
    );
  }
}

