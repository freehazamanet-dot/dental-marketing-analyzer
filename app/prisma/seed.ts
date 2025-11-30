import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Chief Complaint Masters
  const chiefComplaints = [
    { name: "虫歯治療", icon: "🦷", description: "虫歯の治療、詰め物・被せ物", sortOrder: 1 },
    { name: "矯正歯科", icon: "😁", description: "歯列矯正、マウスピース矯正", sortOrder: 2 },
    { name: "インプラント", icon: "🔩", description: "インプラント治療", sortOrder: 3 },
    { name: "ホワイトニング", icon: "✨", description: "歯のホワイトニング", sortOrder: 4 },
    { name: "クリーニング・予防", icon: "🧹", description: "定期クリーニング、予防歯科", sortOrder: 5 },
    { name: "歯周病治療", icon: "🏥", description: "歯周病・歯肉炎の治療", sortOrder: 6 },
    { name: "小児歯科", icon: "👶", description: "子供の歯科治療", sortOrder: 7 },
    { name: "緊急・痛み", icon: "🆘", description: "急な痛み、緊急対応", sortOrder: 8 },
    { name: "入れ歯・義歯", icon: "🦴", description: "入れ歯の作成・調整", sortOrder: 9 },
    { name: "審美歯科", icon: "💎", description: "セラミック、ラミネートベニア", sortOrder: 10 },
    { name: "根管治療", icon: "🔬", description: "根管治療（神経の治療）", sortOrder: 11 },
    { name: "親知らず", icon: "🦷", description: "親知らずの抜歯・相談", sortOrder: 12 },
    { name: "その他", icon: "📋", description: "その他の相談・治療", sortOrder: 13 },
  ];

  for (const complaint of chiefComplaints) {
    await prisma.chiefComplaintMaster.upsert({
      where: { name: complaint.name },
      update: complaint,
      create: complaint,
    });
  }
  console.log("✅ Chief complaint masters created");

  // Create Service Masters
  const services = [
    { name: "リスティング広告", category: "広告", description: "Google/Yahoo広告の運用代行", price: "月額5万円〜", sortOrder: 1 },
    { name: "SNS広告", category: "広告", description: "Instagram/Facebook広告の運用代行", price: "月額3万円〜", sortOrder: 2 },
    { name: "SEO対策", category: "SEO", description: "検索エンジン最適化サービス", price: "月額10万円〜", sortOrder: 3 },
    { name: "MEO対策", category: "SEO", description: "Googleマップ最適化サービス", price: "月額3万円〜", sortOrder: 4 },
    { name: "ポスティング", category: "オフライン", description: "チラシ配布サービス", price: "1万枚5万円〜", sortOrder: 5 },
    { name: "HP制作・改善", category: "Web", description: "ホームページ制作・リニューアル", price: "30万円〜", sortOrder: 6 },
    { name: "口コミ促進サービス", category: "その他", description: "口コミ獲得支援", price: "月額2万円〜", sortOrder: 7 },
    { name: "LP制作", category: "Web", description: "ランディングページ制作", price: "15万円〜", sortOrder: 8 },
    { name: "動画制作", category: "コンテンツ", description: "医院紹介動画制作", price: "20万円〜", sortOrder: 9 },
    { name: "写真撮影", category: "コンテンツ", description: "院内・スタッフ写真撮影", price: "5万円〜", sortOrder: 10 },
  ];

  for (const service of services) {
    await prisma.serviceMaster.upsert({
      where: { id: service.name },
      update: service,
      create: service,
    });
  }
  console.log("✅ Service masters created");

  // Create Specialty Masters
  const specialties = [
    "一般歯科", "矯正歯科", "小児歯科", "口腔外科", "インプラント",
    "ホワイトニング", "審美歯科", "予防歯科", "歯周病治療", "入れ歯・義歯"
  ];

  for (let i = 0; i < specialties.length; i++) {
    await prisma.specialtyMaster.upsert({
      where: { name: specialties[i] },
      update: { sortOrder: i + 1 },
      create: { name: specialties[i], sortOrder: i + 1 },
    });
  }
  console.log("✅ Specialty masters created");

  // Create Analysis Rule Masters
  const analysisRules = [
    {
      name: "低流入検出",
      ruleType: "TRAFFIC",
      conditions: { metric: "totalSessions", operator: "<", value: 500 },
      issueType: "LOW_TRAFFIC",
      severity: "HIGH",
      message: "月間流入数が少なめです。広告やSEO対策で集客強化が必要です。",
    },
    {
      name: "低地域流入検出",
      ruleType: "TRAFFIC",
      conditions: { metric: "localTrafficRate", operator: "<", value: 30 },
      issueType: "LOW_LOCAL_TRAFFIC",
      severity: "HIGH",
      message: "地域からの流入が低く、全国向けSEOに偏っている可能性があります。",
    },
    {
      name: "口コミ数不足検出",
      ruleType: "REVIEW",
      conditions: { metric: "totalReviews", operator: "<", value: 30 },
      issueType: "LOW_REVIEW_COUNT",
      severity: "MEDIUM",
      message: "口コミ数が少ないため、比較検討時に不利になる可能性があります。",
    },
    {
      name: "低評価検出",
      ruleType: "REVIEW",
      conditions: { metric: "averageRating", operator: "<", value: 3.5 },
      issueType: "LOW_REVIEW_SCORE",
      severity: "HIGH",
      message: "口コミ評価が低めです。評価改善が必要です。",
    },
    {
      name: "低滞在時間検出",
      ruleType: "ENGAGEMENT",
      conditions: { metric: "avgSessionDuration", operator: "<", value: 60 },
      issueType: "LOW_ENGAGEMENT",
      severity: "MEDIUM",
      message: "平均滞在時間が短いため、HPに魅力が少ない可能性があります。",
    },
    {
      name: "広告効率低下検出",
      ruleType: "AD",
      conditions: { metric: "paidBounceRate", operator: ">", value: 70 },
      issueType: "AD_INEFFICIENCY",
      severity: "HIGH",
      message: "広告経由の直帰率が高く、広告がうまくいっていない可能性があります。",
    },
  ];

  for (const rule of analysisRules) {
    await prisma.analysisRuleMaster.create({
      data: rule,
    });
  }
  console.log("✅ Analysis rule masters created");

  // Create demo organization and user
  const hashedPassword = await bcrypt.hash("password123", 12);

  const organization = await prisma.organization.upsert({
    where: { id: "demo-org" },
    update: {},
    create: {
      id: "demo-org",
      name: "デモ組織",
      plan: "standard",
    },
  });

  await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: { hashedPassword },
    create: {
      email: "demo@example.com",
      hashedPassword,
      name: "デモユーザー",
      role: "ORG_ADMIN",
      organizationId: organization.id,
    },
  });
  console.log("✅ Demo user created (email: demo@example.com, password: password123)");

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

