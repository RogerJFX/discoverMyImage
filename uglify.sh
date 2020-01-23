#!/bin/bash

uglifyjs --compress --mangle --output game.min.js -- js/constants.js js/imageHandler.js js/tileManager.js js/animator.js js/xhrHandler.js

# python correctMin.py
