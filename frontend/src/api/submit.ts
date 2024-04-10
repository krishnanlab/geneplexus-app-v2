import { api, request } from "@/api";
import type { AnalysisResults, Input } from "@/api/types";

/** submit analysis */
export const submitAnalysis = async (input: Input) => {
  const params = {
    geneids: input.genes,
    sp_trn: input.species,
    sp_tst: input.species,
    net_type: input.network,
    gsc: input.negatives,
  };
  const response = await request<AnalysisResults>(`${api}/gpz-ml`, params);

  return response;
};
