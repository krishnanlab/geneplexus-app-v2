FROM python:3.11

# install the following tools:
# - caddy, a reverse proxy that will serve the functions
# - inotify-tools to watch for file changes
RUN apt-get update && apt-get install -y \
    caddy inotify-tools \
    && rm -rf /var/lib/apt/lists/*

# install functions-framework, which will run each function, as well as the tool
# watchmedo (in package watchdog) to restart each functions-framework instance
# when there are code changes to the function
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install functions-framework watchdog

# copy the caddy config that will be used to proxy from functions-framework
# ports to a single origin
COPY ./local_runner/backend/Caddyfile /etc/caddy/Caddyfile

# copy in each functions' requirements.txt and install the dependencies
# (we're reusing /tmp/_requirements.txt so we don't litter the temp folder
# with near-identical requirements files, but you can name them whatever
# you want so long as you use the same name in the pip install step)
# 1. convert_ids requirements
COPY ./functions/convert_ids/convert_ids_deploy/requirements.txt /tmp/_requirements.txt
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r /tmp/_requirements.txt
# 2. ml requirements
COPY ./functions/ml/ml_deploy/requirements.txt /tmp/_requirements.txt
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r /tmp/_requirements.txt
# <NOTE: additional copy/run pairs for each function should be added here>

# copy the entrypoint script that will start the functions via
# functions-framework
COPY ./local_runner/backend/entrypoint.sh /opt/entrypoint.sh

WORKDIR /app

CMD ["/opt/entrypoint.sh"]
