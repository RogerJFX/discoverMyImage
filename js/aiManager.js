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

    function str2Data(str) {
        const arr = str.split('');
        const result = [];
        for (let i = 0; i < arr.length; i+=2) {
            result.push(Number(arr[i]) + Number(arr[i + 1]) * 3);
        }
        return turnArray(result);
    }

    function tiles2Task(tiles) { // Tile object from TileManager
        const indexArray = [];
        tiles.forEach(tile => {
            const coords = tile.getCoords();
            indexArray.push(coords[0] + coords[1] * 3);
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
            result += entry % 3; // arr[i] % numW
            result += Math.floor(entry / 3) % 3; // Math.floor(arr[i] / numW) % numH)
        });
        return result;
    }

    self.getTask = (numW, numH, level) => {
        return new Promise((resolve, reject) => {
            if(numW !== 3 || numH !== 3) {
                resolve(randomShuffle(numW * numH));
            } else {
                level = level || $disc.settingsHandler.getTileSettings()[2] || 4; // random on ai server
                fetchDataAndDo((settings) => {
                    $disc.xhrHandler.loadJsonProperties(`${settings['aiServer']}${settings['taskURL'].replace('__LEVEL__', level)}`, false).then(data => {
                        resolve(str2Data(data.response));
                    }).catch(err => {
                        console.error(`Error ${err}, now shuffling randomly`);
                        resolve(randomShuffle(numW * numH));
                    });
                });
            }
        });
    };

    self.resolveTask = (tiles, onSuccessFn, onErrorFn) => {
        if(tiles.length !== 9) {
            onErrorFn();
            return;
        }
        fetchDataAndDo((settings) => {
            $disc.xhrHandler.loadJsonProperties(`${settings['aiServer']}${settings['resolveURL'].replace('__TASK__', tiles2Task(tiles))}`, false).then(data => {
                onSuccessFn(data.response);
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