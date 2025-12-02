"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// 日本語フォントを登録
Font.register({
  family: "NotoSansJP",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75s.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFJEj75vN0g.ttf",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "NotoSansJP",
    fontSize: 10,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 20,
    borderBottom: "2px solid #0d9488",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#0d9488",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  clinicName: {
    fontSize: 16,
    fontWeight: 700,
    marginTop: 10,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: "1px solid #e2e8f0",
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    width: 120,
    color: "#64748b",
  },
  value: {
    flex: 1,
    color: "#1e293b",
  },
  scoreCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  scoreBox: {
    width: "23%",
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    textAlign: "center",
  },
  scoreLabel: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0d9488",
  },
  issueList: {
    marginTop: 10,
  },
  issueItem: {
    flexDirection: "row",
    marginBottom: 6,
    paddingLeft: 10,
  },
  issueSeverity: {
    width: 50,
    fontSize: 9,
    fontWeight: 700,
  },
  issueText: {
    flex: 1,
    color: "#1e293b",
  },
  aiAnalysis: {
    backgroundColor: "#f0fdfa",
    padding: 15,
    borderRadius: 4,
    marginTop: 10,
  },
  aiText: {
    fontSize: 10,
    color: "#1e293b",
    lineHeight: 1.8,
  },
  serviceCard: {
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 11,
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: 3,
  },
  serviceDescription: {
    fontSize: 9,
    color: "#64748b",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 8,
    borderTop: "1px solid #e2e8f0",
    paddingTop: 10,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 8,
    fontWeight: 700,
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1px solid #e2e8f0",
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
  },
  competitorRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1px solid #e2e8f0",
  },
  competitorName: {
    flex: 2,
    fontSize: 9,
  },
  competitorValue: {
    flex: 1,
    fontSize: 9,
    textAlign: "center",
  },
});

interface Issue {
  type: string;
  severity: string;
  message: string;
}

interface ProposedService {
  name: string;
  description: string;
  priority: string;
  estimatedCost: string;
  expectedEffect: string;
  reason: string;
}

interface AIAnalysis {
  currentAnalysis?: string;
  mainIssues?: string[];
  competitorAnalysis?: string;
  webAnalysis?: string;
  reviewAnalysis?: string;
  recommendations?: string[];
  proposedServices?: ProposedService[];
  expectedEffects?: string;
}

interface Competitor {
  name: string;
  reviewData: {
    averageRating: number;
    totalReviews: number;
  }[];
}

interface AnalysisReportData {
  clinic: {
    name: string;
    prefecture: string;
    city: string;
    address: string | null;
    websiteUrl: string | null;
  };
  analysis: {
    analyzedAt: string;
    overallScore: number | null;
    trafficScore: number | null;
    engagementScore: number | null;
    reviewScore: number | null;
    issues: Issue[];
    aiAnalysis: string | null;
  };
  review: {
    averageRating: number;
    totalReviews: number;
  } | null;
  competitors: Competitor[];
}

export function AnalysisReportPDF({ data }: { data: AnalysisReportData }) {
  const { clinic, analysis, review, competitors } = data;

  // AI分析結果をパース
  let parsedAI: AIAnalysis | null = null;
  if (analysis.aiAnalysis) {
    try {
      parsedAI = JSON.parse(analysis.aiAnalysis);
    } catch {
      // パース失敗時は無視
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return "#dc2626";
      case "MEDIUM":
        return "#f59e0b";
      case "LOW":
        return "#3b82f6";
      default:
        return "#64748b";
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return "重要";
      case "MEDIUM":
        return "注意";
      case "LOW":
        return "参考";
      default:
        return "情報";
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>マーケティング分析レポート</Text>
          <Text style={styles.subtitle}>
            分析日: {new Date(analysis.analyzedAt).toLocaleDateString("ja-JP")}
          </Text>
          <Text style={styles.clinicName}>{clinic.name}</Text>
          <Text style={styles.subtitle}>
            {clinic.prefecture}
            {clinic.city}
            {clinic.address || ""}
          </Text>
        </View>

        {/* Score Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 スコアサマリー</Text>
          <View style={styles.scoreCard}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>総合スコア</Text>
              <Text style={styles.scoreValue}>
                {analysis.overallScore ?? "-"}
              </Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>流入スコア</Text>
              <Text style={styles.scoreValue}>
                {analysis.trafficScore ?? "-"}
              </Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>エンゲージメント</Text>
              <Text style={styles.scoreValue}>
                {analysis.engagementScore ?? "-"}
              </Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>口コミスコア</Text>
              <Text style={styles.scoreValue}>
                {analysis.reviewScore ?? "-"}
              </Text>
            </View>
          </View>
        </View>

        {/* Review Data */}
        {review && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ 口コミデータ</Text>
            <View style={styles.row}>
              <Text style={styles.label}>平均評価:</Text>
              <Text style={styles.value}>{review.averageRating.toFixed(1)} / 5.0</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>口コミ件数:</Text>
              <Text style={styles.value}>{review.totalReviews}件</Text>
            </View>
          </View>
        )}

        {/* Competitors */}
        {competitors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏢 競合比較</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ flex: 2, fontSize: 9 }}>医院名</Text>
                <Text style={{ flex: 1, fontSize: 9, textAlign: "center" }}>
                  評価
                </Text>
                <Text style={{ flex: 1, fontSize: 9, textAlign: "center" }}>
                  口コミ数
                </Text>
              </View>
              {competitors.map((comp, index) => (
                <View key={index} style={styles.competitorRow}>
                  <Text style={styles.competitorName}>{comp.name}</Text>
                  <Text style={styles.competitorValue}>
                    {comp.reviewData[0]?.averageRating?.toFixed(1) ?? "-"}
                  </Text>
                  <Text style={styles.competitorValue}>
                    {comp.reviewData[0]?.totalReviews ?? "-"}件
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Issues */}
        {analysis.issues.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ 検出された課題</Text>
            <View style={styles.issueList}>
              {analysis.issues.map((issue, index) => (
                <View key={index} style={styles.issueItem}>
                  <Text
                    style={[
                      styles.issueSeverity,
                      { color: getSeverityColor(issue.severity) },
                    ]}
                  >
                    [{getSeverityLabel(issue.severity)}]
                  </Text>
                  <Text style={styles.issueText}>{issue.message}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          DentalMarketing Analyzer - Generated on{" "}
          {new Date().toLocaleDateString("ja-JP")}
        </Text>
      </Page>

      {/* AI Analysis Page */}
      {parsedAI && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>AI分析結果</Text>
            <Text style={styles.clinicName}>{clinic.name}</Text>
          </View>

          {/* Current Analysis */}
          {parsedAI.currentAnalysis && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 現状分析</Text>
              <View style={styles.aiAnalysis}>
                <Text style={styles.aiText}>{parsedAI.currentAnalysis}</Text>
              </View>
            </View>
          )}

          {/* Main Issues */}
          {parsedAI.mainIssues && parsedAI.mainIssues.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 主な課題</Text>
              {parsedAI.mainIssues.map((issue, index) => (
                <View key={index} style={styles.issueItem}>
                  <Text style={styles.issueText}>
                    {index + 1}. {issue}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Recommendations */}
          {parsedAI.recommendations && parsedAI.recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 推奨アクション</Text>
              {parsedAI.recommendations.map((rec, index) => (
                <View key={index} style={styles.issueItem}>
                  <Text style={styles.issueText}>• {rec}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Expected Effects */}
          {parsedAI.expectedEffects && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📈 期待効果</Text>
              <View style={styles.aiAnalysis}>
                <Text style={styles.aiText}>{parsedAI.expectedEffects}</Text>
              </View>
            </View>
          )}

          <Text style={styles.footer}>
            DentalMarketing Analyzer - AI Analysis Report
          </Text>
        </Page>
      )}

      {/* Proposed Services Page */}
      {parsedAI?.proposedServices && parsedAI.proposedServices.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>提案サービス</Text>
            <Text style={styles.clinicName}>{clinic.name}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚀 推奨サービス一覧</Text>
            {parsedAI.proposedServices.map((service, index) => (
              <View key={index} style={styles.serviceCard}>
                <Text style={styles.serviceName}>
                  {index + 1}. {service.name}
                </Text>
                <Text style={styles.serviceDescription}>
                  {service.description}
                </Text>
                <View style={styles.row}>
                  <Text style={styles.label}>概算費用:</Text>
                  <Text style={styles.value}>{service.estimatedCost}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>期待効果:</Text>
                  <Text style={styles.value}>{service.expectedEffect}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>提案理由:</Text>
                  <Text style={styles.value}>{service.reason}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.footer}>
            DentalMarketing Analyzer - Service Proposals
          </Text>
        </Page>
      )}
    </Document>
  );
}

