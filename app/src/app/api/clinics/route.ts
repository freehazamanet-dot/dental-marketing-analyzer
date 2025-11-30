import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const clinicSchema = z.object({
  name: z.string().min(1, "医院名を入力してください"),
  postalCode: z.string().optional(),
  prefecture: z.string().min(1, "都道府県を選択してください"),
  city: z.string().min(1, "市区町村を入力してください"),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  googlePlaceId: z.string().optional(),
  gaPropertyId: z.string().optional(),
  gscSiteUrl: z.string().url().optional().or(z.literal("")),
  specialties: z.array(z.string()).default([]),
});

// GET /api/clinics - 歯科医院一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const prefecture = searchParams.get("prefecture") || "";

    const where = {
      organizationId: session.user.organizationId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { city: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(prefecture && { prefecture }),
    };

    const [clinics, total] = await Promise.all([
      prisma.dentalClinic.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          reviewData: {
            orderBy: { fetchedAt: "desc" },
            take: 1,
          },
          analysisResults: {
            orderBy: { analyzedAt: "desc" },
            take: 1,
          },
          assignedUser: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.dentalClinic.count({ where }),
    ]);

    return NextResponse.json({
      clinics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching clinics:", error);
    return NextResponse.json(
      { error: "医院一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// POST /api/clinics - 歯科医院登録
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = clinicSchema.parse(body);

    // Check for duplicate Google Place ID
    if (validatedData.googlePlaceId) {
      const existing = await prisma.dentalClinic.findUnique({
        where: { googlePlaceId: validatedData.googlePlaceId },
      });
      if (existing) {
        return NextResponse.json(
          { error: "この医院は既に登録されています" },
          { status: 400 }
        );
      }
    }

    const clinic = await prisma.dentalClinic.create({
      data: {
        ...validatedData,
        websiteUrl: validatedData.websiteUrl || null,
        gaPropertyId: validatedData.gaPropertyId || null,
        gscSiteUrl: validatedData.gscSiteUrl || null,
        organizationId: session.user.organizationId,
        assignedUserId: session.user.id,
      },
    });

    return NextResponse.json(clinic, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating clinic:", error);
    return NextResponse.json(
      { error: "医院の登録に失敗しました" },
      { status: 500 }
    );
  }
}

