#!/bin/bash
for i in {1..5000}
do
  redis-cli PUBLISH "metric:counters" "{foo: $RANDOM , bar: $RANDOM,
  bazz: $i }"
  sleep 1
done
