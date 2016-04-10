#!/bin/bash
set -e

eval `/populate_env.sh`

# allow arguments to be passed to npm
if [[ ${1:0:1} = '-' ]]; then
  EXTRA_ARGS="$@"
  set --
elif [[ ${1} == npm ]]; then
  EXTRA_ARGS="${@:2}"
  set --
fi

# default behaviour is to launch npm
if [[ -z ${1} ]]; then
  echo "Starting assets server..."
  exec npm start ${EXTRA_ARGS}
else
  exec "$@"
fi
