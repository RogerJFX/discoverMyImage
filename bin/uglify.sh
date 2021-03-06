#!/bin/bash

uglifyjs --compress --mangle --output game.min.js -- \
    js/constants.js \
    js/imageHandler.js \
    js/tileManager.js \
    js/animator.js \
    js/xhrHandler.js \
    js/language.js \
    js/menuHandler.js \
    js/settingsHandler.js \
    js/storage.js \
    js/stageActions.js \
    js/deviceDetection.js \
    js/history.js \
    js/aiManager.js

# python correctMin.py
