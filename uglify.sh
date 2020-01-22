#!/bin/bash

uglifyjs --compress --mangle --output game.min.js -- js/constants.js js/imageHandler.js js/tileManager.js js/animator.js

# python correctMin.py
