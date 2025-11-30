/**
 * Google Analytics Data API連携
 * 
 * 必要な環境変数:
 * - GOOGLE_ANALYTICS_PROPERTY_ID: GA4プロパティID（例: 123456789）
 * - GOOGLE_CLIENT_EMAIL: サービスアカウントのメールアドレス
 * - GOOGLE_PRIVATE_KEY: サービスアカウントの秘密鍵
 */

import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/analytics.readonly'];

interface AnalyticsData {
  totalSessions: number;
  totalUsers: number;
  newUsers: number;
  avgSessionDuration: number;
  bounceRate: number;
  regionData: Record<string, number>;
  cityData: Record<string, number>;
  channelData: Record<string, number>;
  paidSessions?: number;
  paidBounceRate?: number;
}

/**
 * Google Analytics認証クライアントを取得
 */
async function getAnalyticsClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('Google Analytics認証情報が設定されていません。GOOGLE_CLIENT_EMAIL と GOOGLE_PRIVATE_KEY を設定してください。');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: SCOPES,
  });

  return google.analyticsdata({ version: 'v1beta', auth });
}

/**
 * GA4プロパティからデータを取得
 */
export async function fetchAnalyticsData(
  propertyId: string,
  startDate: string = '30daysAgo',
  endDate: string = 'today'
): Promise<AnalyticsData> {
  const analyticsData = await getAnalyticsClient();

  // 基本メトリクス取得
  const basicResponse = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'newUsers' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
    },
  });

  const basicMetrics = basicResponse.data.rows?.[0]?.metricValues || [];

  // 地域別データ取得
  const regionResponse = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'region' }],
      metrics: [{ name: 'sessions' }],
      limit: 20,
    },
  });

  const regionData: Record<string, number> = {};
  regionResponse.data.rows?.forEach((row) => {
    const region = row.dimensionValues?.[0]?.value || 'Unknown';
    const sessions = parseInt(row.metricValues?.[0]?.value || '0', 10);
    regionData[region] = sessions;
  });

  // 市区町村別データ取得
  const cityResponse = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'city' }],
      metrics: [{ name: 'sessions' }],
      limit: 20,
    },
  });

  const cityData: Record<string, number> = {};
  cityResponse.data.rows?.forEach((row) => {
    const city = row.dimensionValues?.[0]?.value || 'Unknown';
    const sessions = parseInt(row.metricValues?.[0]?.value || '0', 10);
    cityData[city] = sessions;
  });

  // チャネル別データ取得
  const channelResponse = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }],
    },
  });

  const channelData: Record<string, number> = {};
  channelResponse.data.rows?.forEach((row) => {
    const channel = row.dimensionValues?.[0]?.value || 'Unknown';
    const sessions = parseInt(row.metricValues?.[0]?.value || '0', 10);
    channelData[channel] = sessions;
  });

  // 広告データ取得（Paid Search）
  let paidSessions = 0;
  let paidBounceRate = 0;
  
  try {
    const paidResponse = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }, { name: 'bounceRate' }],
        dimensionFilter: {
          filter: {
            fieldName: 'sessionDefaultChannelGroup',
            stringFilter: {
              matchType: 'EXACT',
              value: 'Paid Search',
            },
          },
        },
      },
    });

    if (paidResponse.data.rows?.[0]) {
      paidSessions = parseInt(paidResponse.data.rows[0].metricValues?.[0]?.value || '0', 10);
      paidBounceRate = parseFloat(paidResponse.data.rows[0].metricValues?.[1]?.value || '0') * 100;
    }
  } catch (e) {
    console.log('Paid data not available:', e);
  }

  return {
    totalSessions: parseInt(basicMetrics[0]?.value || '0', 10),
    totalUsers: parseInt(basicMetrics[1]?.value || '0', 10),
    newUsers: parseInt(basicMetrics[2]?.value || '0', 10),
    avgSessionDuration: parseFloat(basicMetrics[3]?.value || '0'),
    bounceRate: parseFloat(basicMetrics[4]?.value || '0') * 100,
    regionData,
    cityData,
    channelData,
    paidSessions: paidSessions > 0 ? paidSessions : undefined,
    paidBounceRate: paidBounceRate > 0 ? paidBounceRate : undefined,
  };
}

/**
 * ページ別データを取得
 */
export async function fetchPageData(
  propertyId: string,
  startDate: string = '30daysAgo',
  endDate: string = 'today'
) {
  const analyticsData = await getAnalyticsClient();

  const response = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
      limit: 20,
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    },
  });

  return response.data.rows?.map((row) => ({
    page: row.dimensionValues?.[0]?.value || '',
    pageViews: parseInt(row.metricValues?.[0]?.value || '0', 10),
    avgDuration: parseFloat(row.metricValues?.[1]?.value || '0'),
    bounceRate: parseFloat(row.metricValues?.[2]?.value || '0') * 100,
  })) || [];
}

/**
 * デバイス別データを取得
 */
export async function fetchDeviceData(
  propertyId: string,
  startDate: string = '30daysAgo',
  endDate: string = 'today'
) {
  const analyticsData = await getAnalyticsClient();

  const response = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
    },
  });

  return response.data.rows?.map((row) => ({
    device: row.dimensionValues?.[0]?.value || '',
    sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
    users: parseInt(row.metricValues?.[1]?.value || '0', 10),
  })) || [];
}

