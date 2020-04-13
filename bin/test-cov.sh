#!/bin/bash

# if you don't have bash or awk, setup some unix box, dude.

cat index.devel.html | awk '{sub(/"js\//,"\"instrumented/")}1' > index.test.html

rm -rf instrumented

npx nyc instrument --compact=false js instrumented && npx cypress open --env startPage=/index.test.html?lang=de
