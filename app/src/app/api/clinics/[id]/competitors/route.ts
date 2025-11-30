import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getPlaceDetails, searchNearbyDentalClinics, convertToReviewData } from "@/lib/google/places";

const competitorSchema = z.object({
  googlePlaceId: z.string(),
  name: z.string(),
  address: z.string().optional(),
});

// GET /api/clinics/[id]/competitors - 競合一覧を取得
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

    const competitors = await prisma.competitor.findMany({
      where: { 
        dentalClinicId: id,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      include: {
        reviewData: {
          orderBy: { fetchedAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json(competitors);
  } catch (error) {
    console.error("Error fetching competitors:", error);
    return NextResponse.json(
      { error: "競合データの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// POST /api/clinics/[id]/competitors - 競合を追加
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
    const validatedData = competitorSchema.parse(body);

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

    // Check if already exists
    const existing = await prisma.competitor.findFirst({
      where: {
        dentalClinicId: id,
        googlePlaceId: validatedData.googlePlaceId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "この競合医院は既に登録されています" },
        { status: 400 }
      );
    }

    // Create competitor
    const competitor = await prisma.competitor.create({
      data: {
        dentalClinicId: id,
        googlePlaceId: validatedData.googlePlaceId,
        name: validatedData.name,
        address: validatedData.address,
        isActive: true,
      },
    });

    // Fetch initial review data
    try {
      const placeDetails = await getPlaceDetails(validatedData.googlePlaceId);
      if (placeDetails) {
        const reviewData = convertToReviewData(placeDetails);
        await prisma.competitorReviewData.create({
          data: {
            competitorId: competitor.id,
            ...reviewData,
            rawData: placeDetails as object,
          },
        });
      }
    } catch (e) {
      console.error("Error fetching competitor reviews:", e);
    }

    return NextResponse.json(
      { message: "競合を追加しました", data: competitor },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating competitor:", error);
    return NextResponse.json(
      { error: "競合の追加に失敗しました" },
      { status: 500 }
    );
  }
}

