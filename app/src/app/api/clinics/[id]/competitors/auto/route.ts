import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { geocodeAddress, searchNearbyDentalClinics, getPlaceDetails } from "@/lib/google/places";

// POST /api/clinics/[id]/competitors/auto - 競合医院を自動取得
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

    // Verify clinic access
    const clinic = await prisma.dentalClinic.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
        deletedAt: null,
      },
      include: {
        competitors: {
          where: { isActive: true },
          select: { googlePlaceId: true },
        },
      },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: "医院が見つかりません" },
        { status: 404 }
      );
    }

    // 住所から緯度経度を取得（cityに県名が含まれている場合の重複を避ける）
    const fullAddress = clinic.city.includes(clinic.prefecture)
      ? `${clinic.city}${clinic.address || ""}`
      : `${clinic.prefecture}${clinic.city}${clinic.address || ""}`;
    const location = await geocodeAddress(fullAddress);

    if (!location) {
      return NextResponse.json(
        { error: "住所から位置情報を取得できませんでした" },
        { status: 400 }
      );
    }

    // 周辺の歯科医院を検索（2km圏内）
    const nearbyResults = await searchNearbyDentalClinics(location, 2000);

    // 既存の競合を除外
    const existingIds = new Set(clinic.competitors.map((c) => c.googlePlaceId));
    
    // 自院を除外し、上位5件を取得
    const filtered = nearbyResults
      .filter(
        (result) =>
          result.placeId !== clinic.googlePlaceId &&
          !existingIds.has(result.placeId)
      )
      .slice(0, 5);

    if (filtered.length === 0) {
      return NextResponse.json({
        message: "新しい競合医院が見つかりませんでした",
        competitors: [],
      });
    }

    // 競合医院を登録
    const createdCompetitors = [];

    for (const result of filtered) {
      // 詳細情報を取得
      const details = await getPlaceDetails(result.placeId);
      
      // 住所から都道府県と市区町村を抽出
      let prefecture = clinic.prefecture;
      let city = "";
      const addressParts = (result.address || "").match(/(.+?[都道府県])(.+?[市区町村])(.+)?/);
      if (addressParts) {
        prefecture = addressParts[1] || clinic.prefecture;
        city = addressParts[2] || "";
      } else {
        city = result.address || "";
      }

      const competitor = await prisma.competitor.create({
        data: {
          dentalClinicId: id,
          name: result.name,
          googlePlaceId: result.placeId,
          prefecture: prefecture,
          city: city,
          address: result.address,
          isActive: true,
        },
      });

      // 口コミデータを保存
      if (details) {
        await prisma.competitorReviewData.create({
          data: {
            competitorId: competitor.id,
            averageRating: details.rating || 0,
            totalReviews: details.totalReviews || 0,
            rating5Count: 0,
            rating4Count: 0,
            rating3Count: 0,
            rating2Count: 0,
            rating1Count: 0,
          },
        });
      }

      createdCompetitors.push({
        ...competitor,
        rating: details?.rating || result.rating,
        totalReviews: details?.totalReviews || result.totalReviews,
      });
    }

    return NextResponse.json({
      message: `${createdCompetitors.length}件の競合医院を登録しました`,
      competitors: createdCompetitors,
    });
  } catch (error) {
    console.error("Error auto-fetching competitors:", error);

    if (error instanceof Error && error.message.includes("GOOGLE_PLACES_API_KEY")) {
      return NextResponse.json(
        { error: "Google Places APIキーが設定されていません" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "競合医院の自動取得に失敗しました" },
      { status: 500 }
    );
  }
}

