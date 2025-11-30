import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { searchNearbyDentalClinics } from "@/lib/google/places";

// GET /api/clinics/[id]/competitors/search - 周辺の競合候補を検索
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
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius") || "2000";

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

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "位置情報が必要です" },
        { status: 400 }
      );
    }

    // Search nearby clinics
    const nearbyResults = await searchNearbyDentalClinics(
      { lat: parseFloat(lat), lng: parseFloat(lng) },
      parseInt(radius)
    );

    // Get already registered competitors
    const existingCompetitors = await prisma.competitor.findMany({
      where: { dentalClinicId: id },
      select: { googlePlaceId: true },
    });
    const existingIds = new Set(existingCompetitors.map((c) => c.googlePlaceId));

    // Filter out the clinic itself and already registered competitors
    const filtered = nearbyResults.filter(
      (result) =>
        result.placeId !== clinic.googlePlaceId &&
        !existingIds.has(result.placeId)
    );

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error searching competitors:", error);
    
    if (error instanceof Error && error.message.includes("GOOGLE_PLACES_API_KEY")) {
      return NextResponse.json(
        { error: "Google Places APIキーが設定されていません" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "競合検索に失敗しました" },
      { status: 500 }
    );
  }
}

