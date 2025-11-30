import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { analyzeClinic } from "@/lib/openrouter/gemini";

interface Issue {
  type: string;
  severity: string;
  message: string;
}

// POST /api/clinics/[id]/analyze - AI分析を実行
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

    // Get clinic with all related data
    const clinic = await prisma.dentalClinic.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
        deletedAt: null,
      },
      include: {
        reviewData: {
          orderBy: { fetchedAt: "desc" },
          take: 1,
        },
        analyticsData: {
          orderBy: { periodEnd: "desc" },
          take: 1,
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
          take: 1,
          include: {
            patientsByComplaint: {
              include: {
                chiefComplaint: true,
              },
            },
          },
        },
        measures: {
          where: { status: "ACTIVE" },
          include: {
            effects: {
              orderBy: { analyzedAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: "医院が見つかりません" },
        { status: 404 }
      );
    }

    // Build issues based on analysis rules
    const issues: Issue[] = [];
    const latestReview = clinic.reviewData[0];
    const latestAnalytics = clinic.analyticsData[0];
    const latestPatientData = clinic.monthlyPatientData[0];

    // Analyze review data
    if (latestReview) {
      if (latestReview.totalReviews < 30) {
        issues.push({
          type: "LOW_REVIEW_COUNT",
          severity: "MEDIUM",
          message: `口コミ数が${latestReview.totalReviews}件と少ないため、比較検討時に不利になる可能性があります。`,
        });
      }
      if (latestReview.averageRating < 3.5) {
        issues.push({
          type: "LOW_REVIEW_SCORE",
          severity: "HIGH",
          message: `口コミ評価が${latestReview.averageRating.toFixed(1)}点と低めです。評価改善が必要です。`,
        });
      }
    }

    // Analyze analytics data
    if (latestAnalytics) {
      if (latestAnalytics.totalSessions < 500) {
        issues.push({
          type: "LOW_TRAFFIC",
          severity: "HIGH",
          message: `月間流入数が${latestAnalytics.totalSessions}件と少なめです。広告やSEO対策で集客強化が必要です。`,
        });
      }
      if (latestAnalytics.avgSessionDuration < 60) {
        issues.push({
          type: "LOW_ENGAGEMENT",
          severity: "MEDIUM",
          message: `平均滞在時間が${Math.floor(latestAnalytics.avgSessionDuration)}秒と短いため、HPに魅力が少ない可能性があります。`,
        });
      }
      if (latestAnalytics.paidBounceRate && latestAnalytics.paidBounceRate > 70) {
        issues.push({
          type: "AD_INEFFICIENCY",
          severity: "HIGH",
          message: `広告経由の直帰率が${latestAnalytics.paidBounceRate}%と高く、広告がうまくいっていない可能性があります。`,
        });
      }
    }

    // Compare with competitors
    if (latestReview && clinic.competitors.length > 0) {
      const avgCompetitorReviews =
        clinic.competitors.reduce((sum, c) => {
          const review = c.reviewData[0];
          return sum + (review?.totalReviews || 0);
        }, 0) / clinic.competitors.length;

      if (latestReview.totalReviews < avgCompetitorReviews * 0.7) {
        issues.push({
          type: "COMPETITOR_REVIEW_GAP",
          severity: "HIGH",
          message: `口コミ数が競合平均（${Math.round(avgCompetitorReviews)}件）より少ない状況です。`,
        });
      }
    }

    // Prepare data for AI analysis
    const analysisData = {
      clinic: {
        name: clinic.name,
        prefecture: clinic.prefecture,
        city: clinic.city,
        specialties: clinic.specialties,
      },
      analytics: latestAnalytics
        ? {
            totalSessions: latestAnalytics.totalSessions,
            totalUsers: latestAnalytics.totalUsers,
            avgSessionDuration: latestAnalytics.avgSessionDuration,
            bounceRate: latestAnalytics.bounceRate,
            localTrafficRate: 50, // TODO: Calculate from regionData
            paidSessions: latestAnalytics.paidSessions || undefined,
            paidBounceRate: latestAnalytics.paidBounceRate || undefined,
          }
        : undefined,
      review: latestReview
        ? {
            totalReviews: latestReview.totalReviews,
            averageRating: latestReview.averageRating,
          }
        : undefined,
      competitors: clinic.competitors
        .filter((c) => c.reviewData[0])
        .map((c) => ({
          name: c.name,
          totalReviews: c.reviewData[0]?.totalReviews || 0,
          averageRating: c.reviewData[0]?.averageRating || 0,
        })),
      patientData: latestPatientData
        ? {
            year: latestPatientData.year,
            month: latestPatientData.month,
            totalNewPatients: latestPatientData.totalNewPatients,
            byComplaint: latestPatientData.patientsByComplaint.map((p) => ({
              name: p.chiefComplaint.name,
              count: p.patientCount,
            })),
          }
        : undefined,
      measures: clinic.measures.map((m) => ({
        name: m.name,
        category: m.category,
        cost: m.cost || 0,
        roi: m.effects[0]?.roi || undefined,
      })),
      issues,
    };

    // Call AI for analysis
    let aiAnalysis: string | null = null;
    let aiAnalyzedAt: Date | null = null;

    try {
      const result = await analyzeClinic(analysisData);
      aiAnalysis = JSON.stringify(result);
      aiAnalyzedAt = new Date();
    } catch (aiError) {
      console.error("AI analysis error:", aiError);
      // Continue without AI analysis
    }

    // Calculate scores (厳しめの基準)
    // 口コミスコア: 4.5点で90点、4.0点で80点、3.5点で65点、3.0点で50点
    const reviewScore = latestReview
      ? Math.round(Math.min(100, Math.max(0, (latestReview.averageRating - 2.5) * 40)))
      : null;
    
    // 流入スコア: 歯科医院の目安として月間3000セッションで80点、5000で100点
    // 500以下は30点以下
    const trafficScore = latestAnalytics
      ? Math.round(Math.min(100, Math.max(0, 
          latestAnalytics.totalSessions < 500 
            ? latestAnalytics.totalSessions / 500 * 30
            : 30 + (latestAnalytics.totalSessions - 500) / 4500 * 70
        )))
      : null;
    
    // エンゲージメントスコア: 平均滞在時間3分で60点、5分で80点、7分以上で100点
    // 1分以下は30点以下
    const engagementScore = latestAnalytics
      ? Math.round(Math.min(100, Math.max(0,
          latestAnalytics.avgSessionDuration < 60
            ? latestAnalytics.avgSessionDuration / 60 * 30
            : 30 + (latestAnalytics.avgSessionDuration - 60) / 360 * 70
        )))
      : null;

    // 直帰率によるペナルティ（直帰率が高いとスコアを下げる）
    const bounceRatePenalty = latestAnalytics?.bounceRate 
      ? Math.max(0, (latestAnalytics.bounceRate - 40) * 0.5) // 40%以上で減点
      : 0;
    
    // 競合比較によるスコア調整
    let competitorAdjustment = 0;
    if (latestReview && clinic.competitors.length > 0) {
      const avgCompetitorRating = clinic.competitors.reduce((sum, c) => {
        const review = c.reviewData[0];
        return sum + (review?.averageRating || 0);
      }, 0) / clinic.competitors.filter(c => c.reviewData[0]).length || 0;
      
      if (avgCompetitorRating > 0) {
        // 競合より低いと減点、高いと加点
        competitorAdjustment = (latestReview.averageRating - avgCompetitorRating) * 10;
      }
    }

    const scores = [
      reviewScore !== null ? Math.max(0, Math.min(100, reviewScore + competitorAdjustment)) : null,
      trafficScore !== null ? Math.max(0, Math.min(100, trafficScore - bounceRatePenalty)) : null,
      engagementScore
    ].filter((s) => s !== null) as number[];
    
    const overallScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;

    // Save analysis result
    const analysisResult = await prisma.analysisResult.create({
      data: {
        dentalClinicId: clinic.id,
        analyzedById: session.user.id,
        periodStart: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        periodEnd: new Date(),
        trafficScore,
        engagementScore,
        reviewScore,
        overallScore,
        issues: issues as object[],
        aiAnalysis,
        aiAnalyzedAt,
        status: "COMPLETED",
      },
    });

    return NextResponse.json({
      message: "分析が完了しました",
      data: analysisResult,
    });
  } catch (error) {
    console.error("Error analyzing clinic:", error);
    return NextResponse.json(
      { error: "分析の実行に失敗しました" },
      { status: 500 }
    );
  }
}

