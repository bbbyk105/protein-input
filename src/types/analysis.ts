// types/analysis.ts

/**
 * FastAPI /analyze エンドポイントのリクエスト型
 */
export interface AnalysisRequest {
  uniprot_ids: string[];
  methods: ("X-ray" | "NMR" | "EM")[]; // 複数選択可能
  seq_ratio: number;
}

/**
 * KPI（主要指標）
 */
export interface KPI {
  cis_count: number; // Pro限定ユニークcis数（主指標）
  cis_count_all: number; // 全残基ベース
  midrange_dist_fraction: number | null;
  mean_cis_distance: number | null;
  std_cis_distance: number | null;
  total_structures: number;
  total_residues: number;
}

/**
 * 成果物のパス
 */
export interface Artifacts {
  results_json: string;
  cis_csv: string;
  distance_csv: string;
  heatmap_png: string;
}

/**
 * 単一タンパク質の解析結果
 */
export interface ProteinAnalysisResult {
  uniprot_id: string;
  pdb_ids: string[];
  analysis: {
    kpi: KPI;
    artifacts: Artifacts;
    note: string;
  };
  status: "ok" | "error";
}

/**
 * FastAPI /analyze エンドポイントのレスポンス型
 */
export interface AnalysisResponse {
  results: ProteinAnalysisResult[];
  warnings: string[];
}
