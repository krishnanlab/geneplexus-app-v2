# Local GCP Function Runner

This folder contains a Docker Compose stack that uses GCP's
[functions-framework](https://github.com/GoogleCloudPlatform/functions-framework-python),
specifically the CLI for running a function locally on a specific port, to run
our cloud functions locally for development and testing. The functions are
aggregated into a single backend using [Caddy](https://caddyserver.com/), which
is served at http://localhost:9035. As a convenience, the stack also launches
the frontend at http://localhost:5175 and configures it to query our local
functions rather than the production URL.

This stack requires the following to be installed on your machine:
- [Docker](https://docs.docker.com/get-docker/)
- `Docker Compose`, but this comes bundles in contemporary versions of Docker
- an environment that can run bash scripts, i.e. Linux, Mac OS X or Windows with
  WSL

## How to Use it

In the project root, execute `./run_local.sh`; this will take a little bit of
time the first time as it installs dependencies as part of building the images,
but subsequent runs should be quick thanks to the Docker layer cache.

The script launches the stack, then tails the logs for each container; pressing
`Ctrl-C` will quit tailing the logs, but it won't bring down the stack.
Re-running `./run_local.sh` will restart the stack if there are configuration
changes that require it, so you typically don't need to bring it down. If you
really need to bring down the stack, you can `cd ./local_runner` and run `docker
compose down` to bring it down.

Whenever you modify your functions' `requirements.txt` or the frontend's
`package.json`, you'll want to re-run `run_local.sh`, as it'll have to rebuild
the images.


## Live Reloading

The stack was put together with live editing in mind: changes to the functions
and frontend will be immediately applied. In the frontend's case, this is
supported by vite's dev server, which reloads code changes by default. In the
local functions' case, this is accomplished by using
[watchdog](https://github.com/gorakhargosh/watchdog) to monitor changes to each
functions' source code and restart the `functions-framework` instance when
changes occur.


## Why Caddy? Reverse Proxy Details

The `functions-framework` CLI can only launch a single function on a given port.
This poses a problem for the frontend, which expects that all the functions are
served under a single origin (i.e., a protocol + domain name + port) with
different paths corresponding to different functions.

To work around this, we serve each function internally on a known port, then use
Caddy to map each function runner's port to a path on the proxy. For example,
the `gpz-convert-ids` function runs internally on port 8080 and `gpz-ml` runs on
port 8081. Caddy, running on port 9035 proxies requests to
`http//localhost:9035/gpz-convert-ids` to `http://localhost:8080` and requests
to `http//localhost:9035/gpz-ml` to `http://localhost:8081`.


### Adding Functions to Caddy

To add additional functions, you'll first need to modify
`./local_runner/backend/Dockerfile`.

```Dockerfile
COPY ./functions/<path_to_requirements.txt> /tmp/_requirements.txt
RUN pip install -r /tmp/_requirements.txt
```

Then, you'll need to modify `./local_runner/backend/entrypoint.sh`. You'll then
need to add a line like the following under the existing `launch_and_watch`
lines:
```bash
( launch_and_watch /app/functions/<function_src_folder> <entrypoint> <ununsed_port> ) &
```

Where:
- `<function_src_folder>` is the path to function's code below `./functions`,
- `<entrypoint>` is the name of the Python function in your source code that's
invoked when someone queries the function, and
- `<unused_port>` is any port that's unused; note that these ports are not
exposed on the host, just within the backend container

Second, in `./local_runner/backend/Caddyfile`, you'll need to add a line like
the following under the existing `reverse_proxy` lines:
```
reverse_proxy /<path_to_func> localhost:<unused_port>
```

Where:
- `<path_to_func>` is the path you want to use to call the function under
  `http://localhost:9035`, and
- `<unused_port>` is the port you chose in the previous step.

