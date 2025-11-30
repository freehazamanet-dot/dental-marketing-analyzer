-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SYSTEM_ADMIN', 'ORG_ADMIN', 'SALES');

-- CreateEnum
CREATE TYPE "ClinicStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "MeasureCategory" AS ENUM ('LISTING_AD', 'SNS_AD', 'SEO', 'MEO', 'POSTING', 'REFERRAL', 'REVIEW_CAMPAIGN', 'HP_RENEWAL', 'OTHER');

-- CreateEnum
CREATE TYPE "CostType" AS ENUM ('ONE_TIME', 'MONTHLY');

-- CreateEnum
CREATE TYPE "MeasureStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EffectPeriodType" AS ENUM ('ONE_MONTH', 'THREE_MONTH', 'SIX_MONTH');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'standard',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "hashedPassword" TEXT,
    "name" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'SALES',
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "dental_clinics" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "assignedUserId" TEXT,
    "name" TEXT NOT NULL,
    "postalCode" TEXT,
    "prefecture" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "phoneNumber" TEXT,
    "websiteUrl" TEXT,
    "googlePlaceId" TEXT,
    "gaPropertyId" TEXT,
    "gscSiteUrl" TEXT,
    "googleOAuthToken" JSONB,
    "googleTokenExpiry" TIMESTAMP(3),
    "specialties" TEXT[],
    "status" "ClinicStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "dental_clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialty_masters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialty_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_data" (
    "id" TEXT NOT NULL,
    "dentalClinicId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalSessions" INTEGER NOT NULL,
    "totalUsers" INTEGER NOT NULL,
    "newUsers" INTEGER NOT NULL,
    "avgSessionDuration" DOUBLE PRECISION NOT NULL,
    "bounceRate" DOUBLE PRECISION NOT NULL,
    "regionData" JSONB NOT NULL,
    "cityData" JSONB NOT NULL,
    "channelData" JSONB NOT NULL,
    "paidSessions" INTEGER,
    "paidAvgDuration" DOUBLE PRECISION,
    "paidBounceRate" DOUBLE PRECISION,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawData" JSONB,

    CONSTRAINT "analytics_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_console_data" (
    "id" TEXT NOT NULL,
    "dentalClinicId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalClicks" INTEGER NOT NULL,
    "totalImpressions" INTEGER NOT NULL,
    "avgCtr" DOUBLE PRECISION NOT NULL,
    "avgPosition" DOUBLE PRECISION NOT NULL,
    "queryData" JSONB NOT NULL,
    "pageData" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawData" JSONB,

    CONSTRAINT "search_console_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_data" (
    "id" TEXT NOT NULL,
    "dentalClinicId" TEXT NOT NULL,
    "totalReviews" INTEGER NOT NULL,
    "averageRating" DOUBLE PRECISION NOT NULL,
    "rating5Count" INTEGER NOT NULL,
    "rating4Count" INTEGER NOT NULL,
    "rating3Count" INTEGER NOT NULL,
    "rating2Count" INTEGER NOT NULL,
    "rating1Count" INTEGER NOT NULL,
    "latestReviews" JSONB,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawData" JSONB,

    CONSTRAINT "review_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitors" (
    "id" TEXT NOT NULL,
    "dentalClinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "googlePlaceId" TEXT NOT NULL,
    "prefecture" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "distanceMeters" INTEGER,
    "specialties" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitor_review_data" (
    "id" TEXT NOT NULL,
    "competitorId" TEXT NOT NULL,
    "totalReviews" INTEGER NOT NULL,
    "averageRating" DOUBLE PRECISION NOT NULL,
    "rating5Count" INTEGER NOT NULL,
    "rating4Count" INTEGER NOT NULL,
    "rating3Count" INTEGER NOT NULL,
    "rating2Count" INTEGER NOT NULL,
    "rating1Count" INTEGER NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawData" JSONB,

    CONSTRAINT "competitor_review_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chief_complaint_masters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chief_complaint_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_patient_data" (
    "id" TEXT NOT NULL,
    "dentalClinicId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalNewPatients" INTEGER NOT NULL,
    "memo" TEXT,
    "inputById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_patient_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients_by_complaint" (
    "id" TEXT NOT NULL,
    "monthlyPatientDataId" TEXT NOT NULL,
    "chiefComplaintId" TEXT NOT NULL,
    "patientCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_by_complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measures" (
    "id" TEXT NOT NULL,
    "dentalClinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "MeasureCategory" NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "cost" INTEGER,
    "costType" "CostType" NOT NULL DEFAULT 'ONE_TIME',
    "targetComplaint" TEXT[],
    "targetArea" TEXT,
    "targetAudience" TEXT,
    "status" "MeasureStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "measures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measure_effects" (
    "id" TEXT NOT NULL,
    "measureId" TEXT NOT NULL,
    "periodType" "EffectPeriodType" NOT NULL,
    "beforePeriodStart" TIMESTAMP(3) NOT NULL,
    "beforePeriodEnd" TIMESTAMP(3) NOT NULL,
    "beforeSessions" INTEGER,
    "beforeNewPatients" INTEGER,
    "beforeReviews" INTEGER,
    "beforeAvgDuration" DOUBLE PRECISION,
    "afterPeriodStart" TIMESTAMP(3) NOT NULL,
    "afterPeriodEnd" TIMESTAMP(3) NOT NULL,
    "afterSessions" INTEGER,
    "afterNewPatients" INTEGER,
    "afterReviews" INTEGER,
    "afterAvgDuration" DOUBLE PRECISION,
    "complaintEffects" JSONB,
    "estimatedRevenue" INTEGER,
    "roi" DOUBLE PRECISION,
    "costPerAcquisition" DOUBLE PRECISION,
    "aiAnalysis" TEXT,
    "aiAnalyzedAt" TIMESTAMP(3),
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "measure_effects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_results" (
    "id" TEXT NOT NULL,
    "dentalClinicId" TEXT NOT NULL,
    "analyzedById" TEXT NOT NULL,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "trafficScore" INTEGER,
    "localTrafficRate" DOUBLE PRECISION,
    "engagementScore" INTEGER,
    "reviewScore" INTEGER,
    "adEfficiencyScore" INTEGER,
    "overallScore" INTEGER,
    "issues" JSONB NOT NULL,
    "aiAnalysis" TEXT,
    "aiAnalyzedAt" TIMESTAMP(3),
    "status" "AnalysisStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposed_services" (
    "id" TEXT NOT NULL,
    "analysisResultId" TEXT NOT NULL,
    "serviceMasterId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,
    "isAccepted" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposed_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_masters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "price" TEXT,
    "triggerConditions" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_rule_masters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ruleType" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "issueType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_rule_masters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "dental_clinics_googlePlaceId_key" ON "dental_clinics"("googlePlaceId");

-- CreateIndex
CREATE UNIQUE INDEX "specialty_masters_name_key" ON "specialty_masters"("name");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_data_dentalClinicId_periodStart_periodEnd_key" ON "analytics_data"("dentalClinicId", "periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "search_console_data_dentalClinicId_periodStart_periodEnd_key" ON "search_console_data"("dentalClinicId", "periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "competitors_dentalClinicId_googlePlaceId_key" ON "competitors"("dentalClinicId", "googlePlaceId");

-- CreateIndex
CREATE UNIQUE INDEX "chief_complaint_masters_name_key" ON "chief_complaint_masters"("name");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_patient_data_dentalClinicId_year_month_key" ON "monthly_patient_data"("dentalClinicId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "patients_by_complaint_monthlyPatientDataId_chiefComplaintId_key" ON "patients_by_complaint"("monthlyPatientDataId", "chiefComplaintId");

-- CreateIndex
CREATE UNIQUE INDEX "proposed_services_analysisResultId_serviceMasterId_key" ON "proposed_services"("analysisResultId", "serviceMasterId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dental_clinics" ADD CONSTRAINT "dental_clinics_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dental_clinics" ADD CONSTRAINT "dental_clinics_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_data" ADD CONSTRAINT "analytics_data_dentalClinicId_fkey" FOREIGN KEY ("dentalClinicId") REFERENCES "dental_clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_console_data" ADD CONSTRAINT "search_console_data_dentalClinicId_fkey" FOREIGN KEY ("dentalClinicId") REFERENCES "dental_clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_data" ADD CONSTRAINT "review_data_dentalClinicId_fkey" FOREIGN KEY ("dentalClinicId") REFERENCES "dental_clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_dentalClinicId_fkey" FOREIGN KEY ("dentalClinicId") REFERENCES "dental_clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitor_review_data" ADD CONSTRAINT "competitor_review_data_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "competitors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_patient_data" ADD CONSTRAINT "monthly_patient_data_dentalClinicId_fkey" FOREIGN KEY ("dentalClinicId") REFERENCES "dental_clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients_by_complaint" ADD CONSTRAINT "patients_by_complaint_monthlyPatientDataId_fkey" FOREIGN KEY ("monthlyPatientDataId") REFERENCES "monthly_patient_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients_by_complaint" ADD CONSTRAINT "patients_by_complaint_chiefComplaintId_fkey" FOREIGN KEY ("chiefComplaintId") REFERENCES "chief_complaint_masters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measures" ADD CONSTRAINT "measures_dentalClinicId_fkey" FOREIGN KEY ("dentalClinicId") REFERENCES "dental_clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measure_effects" ADD CONSTRAINT "measure_effects_measureId_fkey" FOREIGN KEY ("measureId") REFERENCES "measures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_results" ADD CONSTRAINT "analysis_results_dentalClinicId_fkey" FOREIGN KEY ("dentalClinicId") REFERENCES "dental_clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_results" ADD CONSTRAINT "analysis_results_analyzedById_fkey" FOREIGN KEY ("analyzedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposed_services" ADD CONSTRAINT "proposed_services_analysisResultId_fkey" FOREIGN KEY ("analysisResultId") REFERENCES "analysis_results"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposed_services" ADD CONSTRAINT "proposed_services_serviceMasterId_fkey" FOREIGN KEY ("serviceMasterId") REFERENCES "service_masters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
