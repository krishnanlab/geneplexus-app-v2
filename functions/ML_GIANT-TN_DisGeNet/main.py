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
        
    # set the gp object
    gp = geneplexus.GenePlexus(net_type="GIANT-TN", features="Embedding", gsc="DisGeNet",file_loc="data")
    
    # get info from the requests
    request_json = request.get_json(silent=True)
    request_args = request.args

    # gene ids must be comma separated in request
    if request_json and "geneids" in request_json:
        geneids = request_json["geneids"]
        input_genes = geneids
    elif request_args and "geneids" in request_args:
        geneids = request_args["geneids"]
        input_genes = geneids.strip().split(",")
    else:
        return f"No gene ids provided"
    # if there is geneids perform the following
    gp.load_genes(input_genes)
    gp.fit_and_predict()
    gp.make_sim_dfs()
    gp.make_small_edgelist()
    
    # save outputs in json format
    json_out = {}
    json_out["avgps"] = gp.avgps
    json_out["df_probs"] = gp.df_probs.to_json(orient="split")
    json_out["df_sim_GO"] = gp.df_sim_GO.to_json(orient="split")
    json_out["df_sim_Dis"] = gp.df_sim_Dis.to_json(orient="split")
    json_out["df_edge"] = gp.df_edge.to_json(orient="split")
    json_out["isolated_genes"] = gp.isolated_genes
    json_out["df_edge_sym"] = gp.df_edge_sym.to_json(orient="split")
    json_out["isolated_genes_sym"] = gp.isolated_genes_sym

    return (json_out, 200, headers)