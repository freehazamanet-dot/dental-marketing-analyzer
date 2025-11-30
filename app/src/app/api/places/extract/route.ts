import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// POST /api/places/extract - 埋め込みコードやURLからPlace IDを抽出
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { input } = await request.json();

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "入力が必要です" },
        { status: 400 }
      );
    }

    // 1. 既にPlace ID形式の場合（ChIJ...で始まる）
    const placeIdMatch = input.match(/ChIJ[a-zA-Z0-9_-]+/);
    if (placeIdMatch) {
      return NextResponse.json({ placeId: placeIdMatch[0] });
    }

    // 2. Google MapsのURLから抽出
    // 例: data=...!1sChIJ...
    const urlMatch = input.match(/!1s(ChIJ[a-zA-Z0-9_-]+)/);
    if (urlMatch) {
      return NextResponse.json({ placeId: urlMatch[1] });
    }

    // 3. 埋め込みコードから場所名を抽出してAPIで検索
    // pb= パラメータから場所名を取得
    let searchQuery = "";

    // iframeのsrcからURLを抽出
    const srcMatch = input.match(/src="([^"]+)"/);
    const url = srcMatch ? srcMatch[1] : input;

    // URLから場所名を抽出（%で始まるエンコードされた文字列をデコード）
    try {
      const decodedUrl = decodeURIComponent(url);
      
      // "place/場所名/@" のパターン
      const placeNameMatch = decodedUrl.match(/place\/([^/@]+)/);
      if (placeNameMatch) {
        searchQuery = placeNameMatch[1].replace(/\+/g, " ");
      }
      
      // pb= の中から場所名を抽出（!2s の後）
      const pbMatch = decodedUrl.match(/!2s([^!]+)/);
      if (pbMatch && !searchQuery) {
        searchQuery = pbMatch[1].replace(/\+/g, " ");
      }
    } catch {
      // デコード失敗は無視
    }

    // 場所名が見つからない場合
    if (!searchQuery) {
      // 16進数形式のIDがある場合（!1s0x...）
      const hexMatch = input.match(/!1s(0x[a-f0-9]+:0x[a-f0-9]+)/i);
      if (hexMatch) {
        // 緯度経度と場所名を取得して正確に検索
        const coordMatch = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        
        if (coordMatch && apiKey) {
          const lat = coordMatch[1];
          const lng = coordMatch[2];
          
          // iframeのsrc内に場所名がある場合は取得（!2s...または/place/...）
          let placeName = "";
          try {
            const decodedInput = decodeURIComponent(input);
            const nameMatch = decodedInput.match(/!2s([^!]+)/) || decodedInput.match(/place\/([^/@]+)/);
            if (nameMatch) {
              placeName = nameMatch[1].replace(/\+/g, " ");
            }
          } catch {
            // デコード失敗
          }
          
          // 緯度経度の周辺で歯科医院を検索
          const nearbyRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=100&type=dentist&key=${apiKey}&language=ja`
          );
          const nearbyData = await nearbyRes.json();
          
          if (nearbyData.status === "OK" && nearbyData.results?.length > 0) {
            // 場所名がある場合は名前でマッチング
            if (placeName) {
              const matched = nearbyData.results.find((r: { name: string }) => 
                r.name.includes(placeName) || placeName.includes(r.name)
              );
              if (matched) {
                return NextResponse.json({ 
                  placeId: matched.place_id,
                  name: matched.name,
                  address: matched.vicinity
                });
              }
            }
            
            // マッチしない場合は最も近い歯科医院を返す
            const closest = nearbyData.results[0];
            return NextResponse.json({ 
              placeId: closest.place_id,
              name: closest.name,
              address: closest.vicinity,
              warning: "複数の歯科医院が見つかりました。正しい医院か確認してください。"
            });
          }
          
          // 歯科医院が見つからない場合は通常のジオコーディング
          const geocodeRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=ja`
          );
          const geocodeData = await geocodeRes.json();
          
          if (geocodeData.results?.[0]?.place_id) {
            return NextResponse.json({ 
              placeId: geocodeData.results[0].place_id,
              warning: "歯科医院が見つからなかったため、住所のPlace IDを使用しています。正しいPlace IDを入力してください。"
            });
          }
        }
      }

      return NextResponse.json(
        { error: "Place IDを抽出できませんでした。Place IDを直接入力してください。" },
        { status: 400 }
      );
    }

    // Places APIで検索
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Places API キーが設定されていません" },
        { status: 500 }
      );
    }

    const searchUrl = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    searchUrl.searchParams.set("query", searchQuery);
    searchUrl.searchParams.set("key", apiKey);
    searchUrl.searchParams.set("language", "ja");

    const response = await fetch(searchUrl.toString());
    const data = await response.json();

    if (data.status === "OK" && data.results?.[0]?.place_id) {
      return NextResponse.json({
        placeId: data.results[0].place_id,
        name: data.results[0].name,
        address: data.results[0].formatted_address,
      });
    }

    return NextResponse.json(
      { error: "Place IDを抽出できませんでした" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error extracting place ID:", error);
    return NextResponse.json(
      { error: "Place IDの抽出に失敗しました" },
      { status: 500 }
    );
  }
}

