window.$disc = window.$disc || {};
(function AiManager(self) {

    let softSettings;

    function fetchDataAndDo(fn) {
        if(softSettings) {
            fn(softSettings)
        } else {
            $disc.settingsHandler.getSoftSettings().then(settings => {
                softSettings = settings;
                fn(settings)
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
            if(!arr.includes(i)) {
                return i;
            }
        }
    }

    function resolveString2Array(str) {
        const arr = str.split('');
        if(arr[arr.length - 1] === '0' && arr[arr.length - 2] === '0') {
            arr.pop();
        }
        const result = [];
        for (let i = 0; i < arr.length; i+=2) {
            result.push([Number(arr[i]), Number(arr[i + 1])]);
        }
        if(result[result.length - 1][0] === 0 && result[result.length - 1][1] === 0) {
            result.pop();
        }
        return result;
    }

    //TODO: Das stimmt nicht. Mal 4 bei 12, mal 3 bei 9
    function str2Data(str) {
        if(str.length === 20) { // 3 x 3, wie need 18 (9 tiles)
            str = str.substring(0, str.length - 2);
        }
        const factor = str.length / 6;
        const arr = str.split('');
        const result = [];
        for (let i = 0; i < arr.length; i+=2) {
            result.push(Number(arr[i]) + Number(arr[i + 1]) * factor);
        }
        console.log(result);
        console.log(turnArray(result));
        return turnArray(result);
    }

    function tiles2Task(tiles) { // Tile object from TileManager
        const indexArray = [];
        tiles.forEach(tile => {
            const coords = tile.getCoords();
            indexArray.push(coords[0] + coords[1] * 4);
        });
        /*
            TileManager does not record the position of the omitted tile.
            We have to find it here, before we turn the array.
         */
        const emptyIndex = findEmptyIndex(indexArray); // if at least one move was done manually
        if(emptyIndex) {
            indexArray[tiles.indexOf(tiles.find(tile => tile.isOmitted()))] = emptyIndex;
        }
        let result = '';
        turnArray(indexArray).forEach(entry => {
            result += entry % 4; // arr[i] % numW
            result += Math.floor(entry / 4) % 3; // Math.floor(arr[i] / numW) % numH)
        });
        return result;
    }

    self.getTask = (numW, numH, level) => {
        return new Promise((resolve, reject) => {
            // if(numW !== 3 || numH !== 3) {
            //     resolve(randomShuffle(numW * numH));
            // } else {
            // const tileSettings =
                level = level || $disc.settingsHandler.getTileSettings()[2] || 4; // random on ai server
                fetchDataAndDo((settings) => {
                    $disc.xhrHandler.loadJsonProperties(`${settings['aiServer']}${settings['taskURL'].replace('__LEVEL__', level).replace('__GRID__', numW + '' + numH)}`, false).then(data => {
                        resolve(str2Data(data.response));
                        //resolve(str2Data("001020301132213101021222"));
                        //resolve(str2Data("001020300111213202122231"));
                    }).catch(err => {
                        console.error(`Error ${err}, now shuffling randomly`);
                        resolve(randomShuffle(numW * numH));
                    });
                });
           // }
        });
    };

    self.resolveTask = (tiles, onSuccessFn, onErrorFn) => {
        const settings = $disc.settingsHandler.getTileSettings();
        const gridString = 43; //`${settings[0]}${settings[1]}`;
        fetchDataAndDo((settings) => {
            $disc.xhrHandler.loadJsonProperties(`${settings['aiServer']}${settings['resolveURL'].replace('__TASK__', tiles2Task(tiles)).replace('__GRID__', gridString)}`, false).then(data => {
                onSuccessFn(resolveString2Array(data.response));
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