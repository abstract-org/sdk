#!/usr/bin/env bash

SCRIPT_DIR_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
. ${SCRIPT_DIR_PATH}/../.env

export DB_URL="${1:-$DATABASE_URL}"
SCHEMA_NAME='public'
DUMPS_DIR=${SCRIPT_DIR_PATH}/dumps

[[ ! -d "${DUMPS_DIR}" ]] && mkdir -p ${DUMPS_DIR}

echo Started extracting schema [ $SCHEMA_NAME ] from [ $DB_URL ]
pg_dump --schema-only -d "${DB_URL}" -n "${SCHEMA_NAME}" > "${DUMPS_DIR}"/dump_"${SCHEMA_NAME}".sql
echo Schema saved in file [ $"${DUMPS_DIR}"/dump_"${SCHEMA_NAME}".sql ]