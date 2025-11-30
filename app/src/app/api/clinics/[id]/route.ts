import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateClinicSchema = z.object({
  name: z.string().min(1, "医院名を入力してください").optional(),
  postalCode: z.string().optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  googlePlaceId: z.string().optional(),
  gaPropertyId: z.string().optional(),
  gscSiteUrl: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional(),
});

// GET /api/clinics/[id] - 歯科医院詳細取得
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

    const clinic = await prisma.dentalClinic.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
        deletedAt: null,
      },
      include: {
        reviewData: {
          orderBy: { fetchedAt: "desc" },
          take: 5,
        },
        analyticsData: {
          orderBy: { periodEnd: "desc" },
          take: 6,
        },
        searchConsoleData: {
          orderBy: { periodEnd: "desc" },
          take: 6,
        },
        analysisResults: {
          orderBy: { analyzedAt: "desc" },
          take: 10,
          include: {
            proposedServices: {
              include: {
                serviceMaster: true,
              },
            },
          },
        },
        competitors: {
          where: { isActive: true },
          include: {
            reviewData: {
              orderBy: { fetchedAt: "desc" },
              take: 1,
            },
          },
        },
        monthlyPatientData: {
          orderBy: [{ year: "desc" }, { month: "desc" }],
          take: 12,
          include: {
            patientsByComplaint: {
              include: {
                chiefComplaint: true,
              },
            },
          },
        },
        measures: {
          orderBy: { startDate: "desc" },
          take: 10,
          include: {
            effects: {
              orderBy: { analyzedAt: "desc" },
              take: 1,
            },
          },
        },
        assignedUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: "医院が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(clinic);
  } catch (error) {
    console.error("Error fetching clinic:", error);
    return NextResponse.json(
      { error: "医院情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// PUT /api/clinics/[id] - 歯科医院更新
export async function PUT(
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
    const validatedData = updateClinicSchema.parse(body);

    // Check if clinic exists and belongs to organization
    const existingClinic = await prisma.dentalClinic.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
        deletedAt: null,
      },
    });

    if (!existingClinic) {
      return NextResponse.json(
        { error: "医院が見つかりません" },
        { status: 404 }
      );
    }

    const clinic = await prisma.dentalClinic.update({
      where: { id },
      data: {
        ...validatedData,
        websiteUrl: validatedData.websiteUrl || null,
        gaPropertyId: validatedData.gaPropertyId || null,
        gscSiteUrl: validatedData.gscSiteUrl || null,
      },
    });

    return NextResponse.json(clinic);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error updating clinic:", error);
    return NextResponse.json(
      { error: "医院情報の更新に失敗しました" },
      { status: 500 }
    );
  }
}

// DELETE /api/clinics/[id] - 歯科医院削除（論理削除）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if clinic exists and belongs to organization
    const existingClinic = await prisma.dentalClinic.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
        deletedAt: null,
      },
    });

    if (!existingClinic) {
      return NextResponse.json(
        { error: "医院が見つかりません" },
        { status: 404 }
      );
    }

    await prisma.dentalClinic.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "医院を削除しました" });
  } catch (error) {
    console.error("Error deleting clinic:", error);
    return NextResponse.json(
      { error: "医院の削除に失敗しました" },
      { status: 500 }
    );
  }
}

