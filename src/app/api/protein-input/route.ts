import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.json();
    const ids = (body?.uniprot_ids ?? []).filter((x: string) => !!x);

    // バリデーション
    if (!ids.length) {
      return NextResponse.json(
        { ok: false, error: "No UniProt IDs provided" },
        { status: 400 }
      );
    }

    // 環境変数チェック
    if (!process.env.N8N_WEBHOOK_URL) {
      console.error("N8N_WEBHOOK_URL is not configured");
      return NextResponse.json(
        { ok: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // n8nへリクエスト送信
    const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.N8N_SECRET || "",
      },
      body: JSON.stringify({
        uniprot_ids: ids, // タイポを修正: uniplot_ids → uniprot_ids
      }),
    });

    // レスポンスを返す
    if (n8nResponse.ok) {
      return NextResponse.json(
        { ok: true, message: `${ids.length} IDs processed successfully` },
        { status: 200 }
      );
    } else {
      console.error("n8n webhook failed:", n8nResponse.status);
      return NextResponse.json(
        { ok: false, error: "Failed to process request" },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
