import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPlaceDetails, convertToReviewData } from "@/lib/google/places";

// POST /api/clinics/[id]/reviews - 口コミデータを取得して保存
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

    // Get clinic with Google Place ID
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

    if (!clinic.googlePlaceId) {
      return NextResponse.json(
        { error: "Google Place IDが設定されていません" },
        { status: 400 }
      );
    }

    // Fetch place details from Google Places API
    const placeDetails = await getPlaceDetails(clinic.googlePlaceId);

    if (!placeDetails) {
      return NextResponse.json(
        { error: "Google Places APIからデータを取得できませんでした" },
        { status: 404 }
      );
    }

    // Convert to review data format
    const reviewData = convertToReviewData(placeDetails);

    // Save to database
    const savedReview = await prisma.reviewData.create({
      data: {
        dentalClinicId: clinic.id,
        ...reviewData,
        rawData: placeDetails as object,
      },
    });

    return NextResponse.json({
      message: "口コミデータを取得しました",
      data: savedReview,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    
    if (error instanceof Error && error.message.includes("GOOGLE_PLACES_API_KEY")) {
      return NextResponse.json(
        { error: "Google Places APIキーが設定されていません" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "口コミデータの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// GET /api/clinics/[id]/reviews - 口コミデータ履歴を取得
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

    const reviews = await prisma.reviewData.findMany({
      where: {
        dentalClinic: {
          id,
          organizationId: session.user.organizationId,
        },
      },
      orderBy: { fetchedAt: "desc" },
      take: 10,
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "口コミデータの取得に失敗しました" },
      { status: 500 }
    );
  }
}

