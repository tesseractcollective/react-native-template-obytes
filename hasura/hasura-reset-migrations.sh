#!/bin/zsh
# hasura-init.sh

hasura migrate delete --all --database-name default

mkdir migrations/default/1_citext_pgcrypto
echo "CREATE EXTENSION IF NOT EXISTS pgcrypto;\nCREATE EXTENSION IF NOT EXISTS citext;" > migrations/default/1_citext_pgcrypto/up.sql
hasura migrate apply --skip-execution --version 1 --database-name default

hasura migrate create "init" --from-server --database-name default
init_dir=$(find migrations/default -name '*init*')
init_version=$(echo $init_dir | sed 's:.*/\([0-9][0-9]*\).*:\1:')
# echo ""
# echo $init_version
mkdir migrations/default/2_init
mv $init_dir/up.sql migrations/default/2_init/up.sql
rm -rf $init_dir
hasura migrate delete --version $init_version --database-name default
hasura migrate apply --skip-execution --version 2 --database-name default

git restore migrations/default/3_enums/up.sql
hasura migrate apply --skip-execution --version 3 --database-name default

hasura migrate status --database-name default

exit 0
