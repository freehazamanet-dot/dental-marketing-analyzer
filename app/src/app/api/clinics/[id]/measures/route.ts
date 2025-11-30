import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const measureSchema = z.object({
  name: z.string().min(1, "施策名は必須です"),
  category: z.enum(["ADVERTISING", "SEO", "DIRECT_MAIL", "SNS", "MEO", "OTHER"]),
  description: z.string().optional(),
  cost: z.number().min(0).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  targetMetric: z.string().optional(),
  targetValue: z.number().optional(),
});

// GET /api/clinics/[id]/measures - 施策一覧を取得
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

    const measures = await prisma.measure.findMany({
      where: { dentalClinicId: id },
      orderBy: { startDate: "desc" },
      include: {
        effects: {
          orderBy: { analyzedAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json(measures);
  } catch (error) {
    console.error("Error fetching measures:", error);
    return NextResponse.json(
      { error: "施策データの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// POST /api/clinics/[id]/measures - 新規施策を登録
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = measureSchema.parse(body);

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

    const measure = await prisma.measure.create({
      data: {
        dentalClinicId: id,
        name: validatedData.name,
        category: validatedData.category,
        description: validatedData.description,
        cost: validatedData.cost,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        targetMetric: validatedData.targetMetric,
        targetValue: validatedData.targetValue,
        status: "ACTIVE",
        createdById: session.user.id,
      },
    });

    return NextResponse.json(
      { message: "施策を登録しました", data: measure },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating measure:", error);
    return NextResponse.json(
      { error: "施策の登録に失敗しました" },
      { status: 500 }
    );
  }
}

