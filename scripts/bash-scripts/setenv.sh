#!/bin/zsh
# setenv.sh

arg="$1"
env="${arg:-local}"

cp .env.$env .env
cp .env hasura/.env
cp .env apps/event-live-server/.env

echo environment set to $env

exit 0
