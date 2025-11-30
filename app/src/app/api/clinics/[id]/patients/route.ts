import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patientDataSchema = z.object({
  year: z.number().min(2020).max(2100),
  month: z.number().min(1).max(12),
  totalNewPatients: z.number().min(0),
  memo: z.string().optional(),
  byComplaint: z.array(
    z.object({
      chiefComplaintId: z.string(),
      patientCount: z.number().min(0),
    })
  ),
});

// GET /api/clinics/[id]/patients - 患者データ一覧を取得
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

    // Get clinic to verify access
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

    const patientData = await prisma.monthlyPatientData.findMany({
      where: { dentalClinicId: id },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: {
        patientsByComplaint: {
          include: {
            chiefComplaint: true,
          },
        },
      },
    });

    return NextResponse.json(patientData);
  } catch (error) {
    console.error("Error fetching patient data:", error);
    return NextResponse.json(
      { error: "患者データの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// POST /api/clinics/[id]/patients - 患者データを登録
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
    const validatedData = patientDataSchema.parse(body);

    // Get clinic to verify access
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

    // Check if data already exists for this month
    const existing = await prisma.monthlyPatientData.findUnique({
      where: {
        dentalClinicId_year_month: {
          dentalClinicId: id,
          year: validatedData.year,
          month: validatedData.month,
        },
      },
    });

    if (existing) {
      // Update existing data
      await prisma.patientByComplaint.deleteMany({
        where: { monthlyPatientDataId: existing.id },
      });

      const updated = await prisma.monthlyPatientData.update({
        where: { id: existing.id },
        data: {
          totalNewPatients: validatedData.totalNewPatients,
          memo: validatedData.memo,
          inputById: session.user.id,
          patientsByComplaint: {
            create: validatedData.byComplaint.map((c) => ({
              chiefComplaintId: c.chiefComplaintId,
              patientCount: c.patientCount,
            })),
          },
        },
        include: {
          patientsByComplaint: {
            include: {
              chiefComplaint: true,
            },
          },
        },
      });

      return NextResponse.json({
        message: "患者データを更新しました",
        data: updated,
      });
    }

    // Create new data
    const created = await prisma.monthlyPatientData.create({
      data: {
        dentalClinicId: id,
        year: validatedData.year,
        month: validatedData.month,
        totalNewPatients: validatedData.totalNewPatients,
        memo: validatedData.memo,
        inputById: session.user.id,
        patientsByComplaint: {
          create: validatedData.byComplaint.map((c) => ({
            chiefComplaintId: c.chiefComplaintId,
            patientCount: c.patientCount,
          })),
        },
      },
      include: {
        patientsByComplaint: {
          include: {
            chiefComplaint: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "患者データを登録しました",
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error saving patient data:", error);
    return NextResponse.json(
      { error: "患者データの保存に失敗しました" },
      { status: 500 }
    );
  }
}

