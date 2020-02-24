window.$disc = window.$disc || {};
(function AiManager(self) {

    let softSettings;

    function fetchDataAndDo(fn) {
        if (softSettings) {
            fn(softSettings)
        } else {
            $disc.settingsHandler.getSoftSettings().then(settings => {
                softSettings = settings;
                fn(settings);
            });
        }
    }

    function randomShuffle(indices) {
        const arr = [];

        function shuffle() {
            const candidate = Math.floor(Math.random() * indices);
            if (arr.includes(candidate)) {
                return shuffle();
            }
            return candidate;
        }

        for (let i = 0; i < indices; i++) {
            arr.push(shuffle());
            //arr.push(i); // Testing
        }
        return arr;
    }

    // Protocols differ
    function turnArray(arr) {
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            result[arr[i]] = i;
        }
        return result;
    }

    function findEmptyIndex(arr) {
        for (let i = 0; i < arr.length; i++) {
            if (!arr.includes(i)) {
                return i;
            }
        }
    }

    function resolveString2Array(str) {
        const arr = str.split('');
        if (arr[arr.length - 1] === '0' && arr[arr.length - 2] === '0') {
            arr.pop();
        }
        const result = [];
        for (let i = 0; i < arr.length; i += 2) {
            result.push([Number(arr[i]), Number(arr[i + 1])]);
        }
        if (result[result.length - 1][0] === 0 && result[result.length - 1][1] === 0) {
            result.pop();
        }
        return result;
    }

    function str2Data(str, w) {
        if (str.length === 20) { // 3 x 3, wie need 18 (9 tiles)
            str = str.substring(0, str.length - 2);
        }
        const arr = str.split('');
        const result = [];
        for (let i = 0; i < arr.length; i += 2) {
            result.push(Number(arr[i]) + Number(arr[i + 1]) * w);
        }
        return turnArray(result);
    }

    function tiles2Task(tiles, radix) { // Tile object from TileManager
        radix = radix || 3;
        const factor = tiles.length / radix;
        const indexArray = [];
        tiles.forEach(tile => {
            const coords = tile.getCoords();
            indexArray.push(coords[0] + coords[1] * factor);
        });
        /*
            TileManager does not record the position of the omitted tile.
            We have to find it here, before we turn the array.
         */
        const emptyIndex = findEmptyIndex(indexArray); // if at least one move was done manually
        if (emptyIndex) {
            indexArray[tiles.indexOf(tiles.find(tile => tile.isOmitted()))] = emptyIndex;
        }
        let result = '';
        turnArray(indexArray).forEach(entry => {
            result += entry % factor;
            result += Math.floor(entry / factor) % radix;
        });
        return radix === 4 ? testTransString4Landscape2Portrait(result, 3) : result;
    }

    function listToMatrix(list, elementsPerSubArray) {
        const matrix = [];
        let i, k;
        for (i = 0, k = -1; i < list.length; i++) {
            if (i % elementsPerSubArray === 0) {
                matrix[++k] = [];
            }
            matrix[k].push(list[i]);
        }
        return matrix;
    }

    function simpleConvertCoords(str) {
        const arr = str.split('');
        const tmp = [];
        for (let i = 0; i < arr.length; i += 2) {
            tmp.push(arr[i+1] + '' + arr[i]);
        }
        return tmp.join('');
    }

    function testTransString4Landscape2Portrait(str, radix) {
        radix = radix || 4;
        const arr = str.split('');
        const tmp = [];
        const result = [];
        // Turn numbers, e.g. 32 => 23
        for (let i = 0; i < arr.length; i += 2) {
            tmp.push(arr[i+1] + '' + arr[i]);
        }
        const matrix = listToMatrix(tmp, radix);

        for(let i = 0; i < matrix[0].length; i++) {
            for(let j = 0; j < matrix.length; j++) {
                result.push(matrix[j][i]);
            }
        }
        return result.join('');
    }

    self.getTask = (numW, numH, level) => {
        $disc.settingsHandler.setLastGrid(numW, numH);
        return new Promise((resolve, reject) => {
            level = level || $disc.settingsHandler.getLevel() || 4; // random on ai server
            fetchDataAndDo((settings) => {
                $disc.xhrHandler.loadJsonProperties(`${settings['aiServer']}${settings['taskURL'].replace('__LEVEL__', level).replace('__GRID__', numW + '' + numH)}`, false).then(data => {
                    const res = data.response;
                    if(numH > numW) {
                        resolve(str2Data(testTransString4Landscape2Portrait(res), numW));
                    } else {
                        resolve(str2Data(res, numW));
                    }
                }).catch(err => {
                    console.error(`Error ${err}, now shuffling randomly`);
                    resolve(randomShuffle(numW * numH));
                });
            });

        });
    };

    self.resolveTask = (tiles, onSuccessFn, onErrorFn) => {
        const grid = $disc.settingsHandler.getLastGrid();
        const gridString = `${grid[0] * 10 + grid[1]}`;
        const taskString = tiles2Task(tiles, grid[1]);
        const portrait = grid[1] === 4;
        fetchDataAndDo((settings) => {
            $disc.xhrHandler.loadJsonProperties(`${settings['aiServer']}${settings['resolveURL'].replace('__TASK__', taskString).replace('__GRID__', gridString)}`, false).then(data => {
                if(portrait) {
                    onSuccessFn(resolveString2Array(simpleConvertCoords(data.response)));
                } else {
                    onSuccessFn(resolveString2Array(data.response));
                }
            }).catch(err => {
                console.error(err);
                onErrorFn();
            });
        })
    };

    self.checkTask = (task) => {
        return new Promise((resolve, reject) => {
            fetchDataAndDo((settings) => {
                $disc.xhrHandler.loadJsonProperties(`${settings['aiServer']}${settings['checkURL'].replace('__TASK__', task)}`, false).then(data => {
                    resolve(data);
                }).catch(err => reject(err));
            })
        });
    };

})(window.$disc.ai = window.$disc.ai || {});