#!/bin/bash

# serves a function via functions-framework on a given port,
# wrapped in watchmedo to restart it in case it's changed
# takes the following positional arguments:
# 1. the directory containing the function
# 2. the entrypoint of the function
# 3. the port on which to serve the function (must match the caddyfile)
function launch_and_watch() {
    cd $1
    watchmedo auto-restart \
        --directory . --pattern="*.py" --recursive -- \
        functions-framework --target="$2" --port="$3"
}

# launch each function in a separate process and background it
( launch_and_watch /app/functions/convert_ids/convert_ids_deploy convert_ids 8080)  &
( launch_and_watch /app/functions/ml/ml_deploy run_pipeline 8081 ) &

# run caddy to serve the functions we're watching from a single origin
/usr/bin/caddy run --environ --config /etc/caddy/Caddyfile
