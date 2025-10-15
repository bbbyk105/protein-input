// app/page.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, CheckCircle2, XCircle, Info } from "lucide-react";

export default function Home() {
  const [ids, setIds] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [idCount, setIdCount] = useState(0);

  const handleIdsChange = (value: string) => {
    setIds(value);
    const count = value.split(/[\s,]+/).filter(Boolean).length;
    setIdCount(count);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const idList = ids.split(/[\s,]+/).filter(Boolean);

    if (idList.length === 0) {
      setStatus("error");
      setMessage("少なくとも1つのUniProt IDを入力してください");
      return;
    }

    setStatus("loading");
    setMessage("n8nワークフローに送信中...");

    try {
      const res = await fetch("/api/protein-input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uniprot_ids: idList,
        }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage(`${idList.length}件のUniProt IDをn8nに送信しました`);
      } else {
        setStatus("error");
        setMessage("送信に失敗しました。もう一度お試しください");
      }
    } catch {
      setStatus("error");
      setMessage("ネットワークエラーが発生しました");
    }
  }

  const handleReset = () => {
    setIds("");
    setStatus("idle");
    setMessage("");
    setIdCount(0);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* ページタイトル */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              タンパク質解析ワークフロー
            </h2>
            <p className="text-slate-600">
              UniProt IDを入力して自動解析を開始します
            </p>
          </div>

          {/* メインカード */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                UniProt ID入力
              </CardTitle>
              <CardDescription>
                解析したいタンパク質のUniProt IDを入力してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 入力エリア */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="protein-ids">UniProt IDs</Label>
                    {idCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700"
                      >
                        {idCount} IDs
                      </Badge>
                    )}
                  </div>
                  <Textarea
                    id="protein-ids"
                    value={ids}
                    onChange={(e) => handleIdsChange(e.target.value)}
                    placeholder="例: P12345, Q67890&#10;または&#10;P12345&#10;Q67890"
                    className="min-h-[150px] font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500"
                    disabled={status === "loading"}
                  />
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    カンマ区切り、スペース区切り、または改行区切りで複数入力可能
                  </p>
                </div>

                {/* ステータス表示 */}
                {status !== "idle" && (
                  <div
                    className={`
                    relative w-full rounded-lg border p-4 
                    ${
                      status === "success" ? "border-green-200 bg-green-50" : ""
                    }
                    ${status === "error" ? "border-red-200 bg-red-50" : ""}
                    ${status === "loading" ? "border-blue-200 bg-blue-50" : ""}
                  `}
                  >
                    <div className="flex items-center gap-3">
                      {status === "loading" && (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600 flex-shrink-0" />
                      )}
                      {status === "success" && (
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                      {status === "error" && (
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      )}
                      <p
                        className={`
                        text-sm font-medium
                        ${status === "success" ? "text-green-800" : ""}
                        ${status === "error" ? "text-red-800" : ""}
                        ${status === "loading" ? "text-blue-800" : ""}
                      `}
                      >
                        {message}
                      </p>
                    </div>
                  </div>
                )}

                {/* ボタン */}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={status === "loading" || ids.trim() === ""}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        送信中...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        解析を開始
                      </>
                    )}
                  </Button>
                  {status !== "idle" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      className="border-gray-300"
                    >
                      リセット
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 情報カード */}
          <Card className="mt-6 border-0 bg-white/60 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-4 w-4" />
                使い方
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                <p>UniProt IDを入力欄に貼り付けてください</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                <p>
                  複数のIDを一度に処理できます（カンマ、スペース、改行区切り）
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                <p>「解析を開始」ボタンをクリックしてn8nワークフローを実行</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
