// app/page.tsx (seq_ratio入力最適化版)
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Loader2, Send, CheckCircle2, XCircle, Info } from "lucide-react";
import { AnalysisRequest, AnalysisResponse } from "@/types/analysis";
import { ResultsDisplay } from "@/components/results-display";

type Method = "X-ray" | "NMR" | "EM";

export default function Home() {
  const [ids, setIds] = useState("");
  const [methods, setMethods] = useState<Method[]>(["X-ray"]);
  const [seqRatio, setSeqRatio] = useState<number>(20);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [idCount, setIdCount] = useState(0);
  const [results, setResults] = useState<AnalysisResponse | null>(null);

  const handleIdsChange = (value: string) => {
    setIds(value);
    const count = value.split(/[\s,]+/).filter(Boolean).length;
    setIdCount(count);
  };

  const toggleMethod = (method: Method) => {
    setMethods((prev) => {
      if (prev.includes(method)) {
        return prev.length > 1 ? prev.filter((m) => m !== method) : prev;
      } else {
        return [...prev, method];
      }
    });
  };

  const handleSeqRatioChange = (value: string) => {
    if (value === "") {
      setSeqRatio(0);
      return;
    }
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1 && num <= 100) {
      setSeqRatio(num);
    }
  };

  const handleSeqRatioBlur = () => {
    if (seqRatio === 0 || seqRatio < 1) {
      setSeqRatio(20);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const idList = ids.split(/[\s,]+/).filter(Boolean);

    if (idList.length === 0) {
      setStatus("error");
      setMessage("少なくとも1つのUniProt IDを入力してください");
      return;
    }

    if (methods.length === 0) {
      setStatus("error");
      setMessage("少なくとも1つの実験手法を選択してください");
      return;
    }

    if (seqRatio < 1 || seqRatio > 100) {
      setStatus("error");
      setMessage("配列比率は1〜100の範囲で入力してください");
      return;
    }

    setStatus("loading");
    setMessage("解析を実行中...");
    setResults(null);

    try {
      const requestBody: AnalysisRequest = {
        uniprot_ids: idList,
        methods,
        seq_ratio: seqRatio,
      };

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data: AnalysisResponse = await res.json();

      if (res.ok) {
        setStatus("success");
        setResults(data);
        const successCount = data.results.filter(
          (r) => r.status === "ok"
        ).length;
        setMessage(`${successCount}/${idList.length}件の解析が完了しました`);
      } else {
        setStatus("error");
        setMessage("解析に失敗しました。もう一度お試しください");
      }
    } catch (error) {
      setStatus("error");
      setMessage("ネットワークエラーが発生しました");
      console.error("Analysis error:", error);
    }
  }

  const handleReset = () => {
    setIds("");
    setMethods(["X-ray"]);
    setSeqRatio(20);
    setStatus("idle");
    setMessage("");
    setIdCount(0);
    setResults(null);
  };

  const methodOptions: { value: Method; label: string; description: string }[] =
    [
      {
        value: "X-ray",
        label: "X線結晶構造解析",
        description: "高分解能、静的構造",
      },
      { value: "NMR", label: "NMR", description: "溶液中、動的情報" },
      {
        value: "EM",
        label: "クライオ電子顕微鏡",
        description: "大型複合体",
      },
    ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* ページタイトル */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            タンパク質構造解析システム
          </h1>
          <p className="text-slate-600">
            UniProt IDを入力してcis-Proペプチド結合の自動解析を実行
          </p>
        </div>

        {/* メインカード */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              解析パラメータ
            </CardTitle>
            <CardDescription>
              解析したいタンパク質のUniProt IDと実験手法を選択してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* UniProt IDs入力エリア */}
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
                  placeholder="例: P61823, P12345&#10;または&#10;P61823&#10;P12345"
                  className="min-h-[120px] font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500"
                  disabled={status === "loading"}
                />
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  カンマ区切り、スペース区切り、または改行区切りで複数入力可能
                </p>
              </div>

              {/* 実験手法選択（複数選択可） */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>実験手法（複数選択可）</Label>
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-700"
                  >
                    {methods.length}件選択中
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {methodOptions.map((option) => (
                    <label
                      key={option.value}
                      htmlFor={`method-${option.value}`}
                      className={`
                        relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer
                        transition-all duration-200
                        ${
                          methods.includes(option.value)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }
                        ${
                          status === "loading"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                      `}
                    >
                      <Checkbox
                        id={`method-${option.value}`}
                        checked={methods.includes(option.value)}
                        onCheckedChange={() => toggleMethod(option.value)}
                        disabled={status === "loading"}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-sm block">
                          {option.label}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {option.description}
                        </p>
                      </div>
                      {methods.includes(option.value) && (
                        <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      )}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  複数選択すると、各手法ごとに解析が実行されます
                </p>
              </div>

              {/* seq_ratio設定 */}
              <div className="space-y-2">
                <Label htmlFor="seq-ratio">配列比率 (seq_ratio)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="seq-ratio"
                    type="number"
                    value={seqRatio === 0 ? "" : seqRatio}
                    onChange={(e) => handleSeqRatioChange(e.target.value)}
                    onBlur={handleSeqRatioBlur}
                    min="1"
                    max="100"
                    step="1"
                    disabled={status === "loading"}
                    className="focus:ring-2 focus:ring-blue-500 max-w-[120px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="20"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSeqRatio(10)}
                      disabled={status === "loading"}
                      className="text-xs"
                    >
                      10
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSeqRatio(20)}
                      disabled={status === "loading"}
                      className="text-xs"
                    >
                      20
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSeqRatio(50)}
                      disabled={status === "loading"}
                      className="text-xs"
                    >
                      50
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  1〜100の数値を入力してください
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
                  disabled={
                    status === "loading" ||
                    ids.trim() === "" ||
                    methods.length === 0
                  }
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      解析中...
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

        {/* 解析結果表示 */}
        {results && <ResultsDisplay results={results} methods={methods} />}

        {/* 情報カード */}
        <Card className="border-0 bg-white/60 backdrop-blur shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-4 w-4" />
              使い方
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <p>
                UniProt ID（例:
                P61823）を入力してください。複数IDを一度に処理可能
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <p>
                実験手法を選択してください（複数選択可）。AlphaFoldは自動的にフォールバックとして使用されます
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <p>
                解析完了後、cis-Pro数やヒートマップなどの成果物が表示されます
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
