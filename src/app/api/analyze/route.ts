// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AnalysisRequest, AnalysisResponse } from "@/types/analysis";

export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body: AnalysisRequest = await request.json();

    // バリデーション
    if (!body.uniprot_ids || body.uniprot_ids.length === 0) {
      return NextResponse.json(
        { error: "UniProt IDsが指定されていません" },
        { status: 400 }
      );
    }

    if (!body.methods || body.methods.length === 0) {
      return NextResponse.json(
        { error: "実験手法が指定されていません" },
        { status: 400 }
      );
    }

    // 有効な手法かチェック
    const validMethods = ["X-ray", "NMR", "EM"];
    const invalidMethods = body.methods.filter(
      (m) => !validMethods.includes(m)
    );
    if (invalidMethods.length > 0) {
      return NextResponse.json(
        {
          error: `無効な実験手法です: ${invalidMethods.join(", ")}`,
          valid_methods: validMethods,
        },
        { status: 400 }
      );
    }

    // FastAPI URLを環境変数から取得（デフォルトはlocalhost）
    const fastapiUrl = process.env.FASTAPI_URL || "http://localhost:8000";

    console.log(`[API] Sending request to FastAPI: ${fastapiUrl}/analyze`);
    console.log(`[API] UniProt IDs: ${body.uniprot_ids.join(", ")}`);
    console.log(`[API] Methods: ${body.methods.join(", ")}`);

    // FastAPIへリクエスト送信
    const fastapiResponse = await fetch(`${fastapiUrl}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data: AnalysisResponse = await fastapiResponse.json();

    if (!fastapiResponse.ok) {
      console.error(`[API] FastAPI error: ${fastapiResponse.status}`, data);
      return NextResponse.json(
        { error: "FastAPIでエラーが発生しました", details: data },
        { status: fastapiResponse.status }
      );
    }

    console.log(`[API] Success: ${data.results.length} results returned`);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[API] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "予期しないエラーが発生しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GETリクエストは不可
export async function GET() {
  return NextResponse.json(
    { error: "このエンドポイントはPOSTリクエストのみ対応しています" },
    { status: 405 }
  );
}
