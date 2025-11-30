/**
 * Google Search Console API連携
 * 
 * 必要な環境変数:
 * - GOOGLE_CLIENT_EMAIL: サービスアカウントのメールアドレス
 * - GOOGLE_PRIVATE_KEY: サービスアカウントの秘密鍵
 */

import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];

interface SearchConsoleData {
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
  queryData: {
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }[];
  pageData: {
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }[];
}

/**
 * Google Search Console認証クライアントを取得
 */
async function getSearchConsoleClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('Google認証情報が設定されていません。GOOGLE_CLIENT_EMAIL と GOOGLE_PRIVATE_KEY を設定してください。');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: SCOPES,
  });

  return google.searchconsole({ version: 'v1', auth });
}

/**
 * Search Consoleからデータを取得
 */
export async function fetchSearchConsoleData(
  siteUrl: string,
  startDate: string,
  endDate: string
): Promise<SearchConsoleData> {
  const searchConsole = await getSearchConsoleClient();

  // 全体のパフォーマンスデータ
  const overallResponse = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: [],
    },
  });

  const overall = overallResponse.data.rows?.[0] || {
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0,
  };

  // クエリ別データ
  const queryResponse = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: 50,
    },
  });

  const queryData = queryResponse.data.rows?.map((row) => ({
    query: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: (row.ctr || 0) * 100,
    position: row.position || 0,
  })) || [];

  // ページ別データ
  const pageResponse = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit: 50,
    },
  });

  const pageData = pageResponse.data.rows?.map((row) => ({
    page: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: (row.ctr || 0) * 100,
    position: row.position || 0,
  })) || [];

  return {
    totalClicks: overall.clicks as number,
    totalImpressions: overall.impressions as number,
    avgCtr: ((overall.ctr as number) || 0) * 100,
    avgPosition: overall.position as number,
    queryData,
    pageData,
  };
}

/**
 * デバイス別データを取得
 */
export async function fetchDeviceData(
  siteUrl: string,
  startDate: string,
  endDate: string
) {
  const searchConsole = await getSearchConsoleClient();

  const response = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['device'],
    },
  });

  return response.data.rows?.map((row) => ({
    device: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: (row.ctr || 0) * 100,
    position: row.position || 0,
  })) || [];
}

/**
 * 国別データを取得
 */
export async function fetchCountryData(
  siteUrl: string,
  startDate: string,
  endDate: string
) {
  const searchConsole = await getSearchConsoleClient();

  const response = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['country'],
      rowLimit: 20,
    },
  });

  return response.data.rows?.map((row) => ({
    country: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: (row.ctr || 0) * 100,
    position: row.position || 0,
  })) || [];
}

/**
 * 日別トレンドを取得
 */
export async function fetchDailyTrend(
  siteUrl: string,
  startDate: string,
  endDate: string
) {
  const searchConsole = await getSearchConsoleClient();

  const response = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['date'],
    },
  });

  return response.data.rows?.map((row) => ({
    date: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: (row.ctr || 0) * 100,
    position: row.position || 0,
  })) || [];
}

