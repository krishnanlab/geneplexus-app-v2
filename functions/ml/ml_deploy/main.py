import functions_framework
import geneplexus


@functions_framework.http
def run_pipeline(request):
    """HTTP Cloud Function.
    set function up for CORS headers so function can be called from js
    """
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }
        return ("", 204, headers)
    
    # Set CORS headers for the main request
    headers = {"Access-Control-Allow-Origin": "*"}
    
    try:
        # get info from the requests
        request_json = request.get_json(silent=True)
        request_args = request.args
        # gene ids must be comma separated in request
        if request_json:
            geneids = request_json["geneids"]
            input_genes = geneids
            gsc = request_json["gsc"]
            net_type = request_json["net_type"]
            sp_trn = request_json["sp_trn"]
            sp_tst = request_json["sp_tst"]
        elif request_args:
            geneids = request_args["geneids"]
            input_genes = geneids.strip().split(",")
            gsc = request_args["gsc"]
            net_type = request_args["net_type"]
            sp_trn = request_args["sp_trn"]
            sp_tst = request_args["sp_tst"]
    except:
        return "problem with input"

    try:
        # set the gp object
        gp = geneplexus.GenePlexus(file_loc = "data",
                                   gsc_trn = gsc,
                                   gsc_tst = gsc,
                                   features = "SixSpeciesN2V",
                                   net_type = net_type,
                                   sp_trn = sp_trn,
                                   sp_tst = sp_tst)
        gp.load_genes(input_genes)
        mdl_weights, df_probs, avgps = gp.fit_and_predict()
        df_sim, weights_dict = gp.make_sim_dfs()
        df_edge, isolated_genes, df_edge_sym, isolated_genes_sym = gp.make_small_edgelist()
        df_convert_out_subset, positive_genes = gp.alter_validation_df()
        # save outputs in json format
        json_out = {}
        json_out["avgps"] = gp.avgps
        json_out["df_probs"] = gp.df_probs.to_json(orient="split")
        json_out["df_sim"] = gp.df_sim.to_json(orient="split")
        json_out["df_edge"] = gp.df_edge.to_json(orient="split")
        json_out["isolated_genes"] = gp.isolated_genes
        json_out["df_edge_sym"] = gp.df_edge_sym.to_json(orient="split")
        json_out["isolated_genes_sym"] = gp.isolated_genes_sym
        json_out["df_convert_out_subset"] = gp.df_convert_out_subset.to_json(orient="split")
        json_out["positive_genes"] = gp.positive_genes
        return (json_out, 200, headers)
    except:
        "problem with geneplexus"