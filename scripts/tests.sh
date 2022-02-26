#! /usr/bin/env bash

if [ "${TEST_TASK}" = "Unit" ];
then
    TS_NODE_COMPILER_OPTIONS='{"module": "commonjs"}' \
        mocha -r ts-node/register "tests/unit/**/*.ts"
else
    ts-node ./tests/api/test.ts
fi