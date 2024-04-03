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
        
    try:
        # get info from the requests
        request_json = request.get_json(silent=True)
        request_args = request.args
        # gene ids must be comma separated in request
        if request_json:
            geneids = request_json["geneids"]
            input_genes = geneids
            species = request_json["species"]
        elif request_args:
            geneids = request_args["geneids"]
            input_genes = geneids.strip().split(",")
            species = request_args["species"]
    except:
        return "problem with input"
    
    try:
        # set the gp object
        # here net type, features and gsc are never used for gene conversion
        gp = geneplexus.GenePlexus(file_loc="data", sp_trn=species)
        gp.load_genes(input_genes)
        json_out = {}
        json_out["convert_ids"] = gp.convert_ids
        json_out["table_summary"] = gp.table_summary
        json_out["input_count"] = gp.input_count
        json_out["df_convert_out"] = gp.df_convert_out.to_dict(orient="split")
        return (json_out, 200, headers)
    except:
        return "problem with geneplexus"