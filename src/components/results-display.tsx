// components/results-display.tsx
"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  CheckCircle2,
  XCircle,
  Download,
  Image as ImageIcon,
  FileText,
  AlertCircle,
  Beaker,
} from "lucide-react";
import { AnalysisResponse } from "@/types/analysis";

interface ResultsDisplayProps {
  results: AnalysisResponse;
  methods: ("X-ray" | "NMR" | "EM")[];
}

export function ResultsDisplay({ results, methods }: ResultsDisplayProps) {
  const downloadFile = (path: string, filename: string) => {
    // FastAPIの静的ファイル配信エンドポイントを想定
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    }/${path}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  const methodLabels: Record<string, string> = {
    "X-ray": "X線結晶構造解析",
    NMR: "NMR",
    EM: "クライオ電子顕微鏡",
  };

  return (
    <div className="space-y-6 mb-6">
      {/* 選択した実験手法の表示 */}
      <Card className="border-0 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            選択した実験手法
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {methods.map((method) => (
              <Badge
                key={method}
                className="bg-white text-purple-700 border-purple-300 px-4 py-2 text-sm"
              >
                {methodLabels[method]}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 警告表示 */}
      {results.warnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              警告
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {results.warnings.map((warning, idx) => (
                <li key={idx} className="text-sm text-yellow-700">
                  • {warning}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 解析結果一覧 */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">解析結果</CardTitle>
          <CardDescription>
            {results.results.length}件のタンパク質の解析が完了しました
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {results.results.map((result) => (
              <Card
                key={result.uniprot_id}
                className="border-2 hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">
                        {result.uniprot_id}
                      </CardTitle>
                      {result.status === "ok" ? (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          成功
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border-red-300">
                          <XCircle className="h-3 w-3 mr-1" />
                          失敗
                        </Badge>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {result.pdb_ids.length} PDB構造
                    </Badge>
                  </div>
                  {result.analysis.note && result.analysis.note !== "-" && (
                    <p className="text-sm text-muted-foreground mt-2">
                      📝 {result.analysis.note}
                    </p>
                  )}
                </CardHeader>

                {result.status === "ok" && (
                  <CardContent className="space-y-6">
                    {/* KPI表示 */}
                    <div>
                      <h4 className="font-semibold mb-3 text-sm text-gray-700">
                        主要指標 (KPI)
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-xs text-blue-600 font-medium mb-1">
                            Cis-Pro数
                          </p>
                          <p className="text-2xl font-bold text-blue-900">
                            {result.analysis.kpi.cis_count}
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <p className="text-xs text-purple-600 font-medium mb-1">
                            全Cis数
                          </p>
                          <p className="text-2xl font-bold text-purple-900">
                            {result.analysis.kpi.cis_count_all}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <p className="text-xs text-green-600 font-medium mb-1">
                            構造数
                          </p>
                          <p className="text-2xl font-bold text-green-900">
                            {result.analysis.kpi.total_structures}
                          </p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                          <p className="text-xs text-amber-600 font-medium mb-1">
                            総残基数
                          </p>
                          <p className="text-2xl font-bold text-amber-900">
                            {result.analysis.kpi.total_residues}
                          </p>
                        </div>
                      </div>

                      {/* 詳細KPI */}
                      <div className="mt-4 bg-gray-50 rounded-lg p-4">
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">
                                中距離残基比率
                              </TableCell>
                              <TableCell className="text-right">
                                {result.analysis.kpi.midrange_dist_fraction !==
                                null
                                  ? result.analysis.kpi.midrange_dist_fraction.toFixed(
                                      4
                                    )
                                  : "N/A"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                平均Cis距離
                              </TableCell>
                              <TableCell className="text-right">
                                {result.analysis.kpi.mean_cis_distance !== null
                                  ? `${result.analysis.kpi.mean_cis_distance.toFixed(
                                      2
                                    )} Å`
                                  : "N/A"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Cis距離標準偏差
                              </TableCell>
                              <TableCell className="text-right">
                                {result.analysis.kpi.std_cis_distance !== null
                                  ? `${result.analysis.kpi.std_cis_distance.toFixed(
                                      3
                                    )} Å`
                                  : "N/A"}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* PDB IDs */}
                    <div>
                      <h4 className="font-semibold mb-2 text-sm text-gray-700">
                        PDB ID一覧
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.pdb_ids.map((pdbId) => (
                          <Badge
                            key={pdbId}
                            variant="outline"
                            className="font-mono"
                          >
                            {pdbId}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* 成果物ダウンロード */}
                    <div>
                      <h4 className="font-semibold mb-3 text-sm text-gray-700">
                        成果物
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="justify-start"
                          onClick={() =>
                            downloadFile(
                              result.analysis.artifacts.cis_csv,
                              `${result.uniprot_id}_cis.csv`
                            )
                          }
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Cis CSV
                          <Download className="h-3 w-3 ml-auto" />
                        </Button>

                        <Button
                          variant="outline"
                          className="justify-start"
                          onClick={() =>
                            downloadFile(
                              result.analysis.artifacts.distance_csv,
                              `${result.uniprot_id}_distance.csv`
                            )
                          }
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          距離CSV
                          <Download className="h-3 w-3 ml-auto" />
                        </Button>

                        <Button
                          variant="outline"
                          className="justify-start"
                          onClick={() =>
                            downloadFile(
                              result.analysis.artifacts.results_json,
                              `${result.uniprot_id}_results.json`
                            )
                          }
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          結果JSON
                          <Download className="h-3 w-3 ml-auto" />
                        </Button>

                        <Button
                          variant="outline"
                          className="justify-start"
                          onClick={() =>
                            downloadFile(
                              result.analysis.artifacts.heatmap_png,
                              `${result.uniprot_id}_heatmap.png`
                            )
                          }
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          ヒートマップPNG
                          <Download className="h-3 w-3 ml-auto" />
                        </Button>
                      </div>
                    </div>

                    {/* ヒートマッププレビュー */}
                    <div>
                      <h4 className="font-semibold mb-3 text-sm text-gray-700">
                        距離ヒートマップ
                      </h4>
                      <div className="border rounded-lg overflow-hidden bg-white relative w-full min-h-[400px]">
                        <Image
                          src={`${
                            process.env.NEXT_PUBLIC_API_URL ||
                            "http://localhost:8000"
                          }/${result.analysis.artifacts.heatmap_png}`}
                          alt={`${result.uniprot_id} ヒートマップ`}
                          width={800}
                          height={800}
                          className="w-full h-auto"
                          unoptimized
                        />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
