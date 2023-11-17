from flask import escape

import functions_framework
import geneplexus


@functions_framework.http
def convert_ids(request):
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
    # here net type, features and gsc are never used for gene conversion
    gp = geneplexus.GenePlexus(net_type="BioGRID", features="Embedding", gsc="GO",file_loc="data")
    
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
    gp._load_genes(input_genes)
    gp._convert_to_entrez()
    # # convert to strings for ease of display
    # display_genes = [str(item) for item in gp.convert_ids]
    # display_genes = "-".join(display_genes)
    # # right now only pull out the list of genes
    # # but really need a datframe, I just have no
    # # idea how to display on a web page
    # return (f"{display_genes}", 200, headers)
    json_out = {}
    json_out["convert_ids"] = gp.convert_ids
    json_out["table_summary"] = gp.table_summary[:-1]
    json_out["input_count"] = gp.input_count
    json_out["df_convert_out"] = gp.df_convert_out.drop("In STRING-EXP?", axis=1).to_json(orient="split")
    return (json_out, 200, headers)