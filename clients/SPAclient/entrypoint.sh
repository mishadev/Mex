#!/bin/bash
set -e

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
  NUM=1
  while true
  do
    echo "========================================================"
    echo "Starting build...   (attempt ${NUM})"
    echo "========================================================"
    npm start ${EXTRA_ARGS} || :
    sleep 3
    ((NUM=NUM+1))
  done
else
  exec "$@"
fi
