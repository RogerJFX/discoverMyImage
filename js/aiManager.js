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

    function str2Data(str) {
        const arr = str.split('');
        const result = [];
        for (let i = 0; i < arr.length; i+=2) {
            result.push(Number(arr[i]) + Number(arr[i + 1]) * 3);
        }
        return result;
    }

    function tiles2Task(tiles) { // Tile object from TileManager
        let result = '';
        tiles.forEach(tile => {
            const coords = tile.getCoords();
            result += coords[0];
            result += coords[1];
        });
        return result;
    }

    self.getTask = (numW, numH, level) => {
        return new Promise((resolve, reject) => {
            if(numW !== 3 || numH !== 3) {
                resolve(randomShuffle(numW * numH));
            } else {
                level = level || 1; // random on ai server
                fetchDataAndDo((settings) => {
                    $disc.xhrHandler.loadJsonProperties(`${settings['aiServer']}${settings['taskURL'].replace('__LEVEL__', level)}`).then(data => {
                        resolve(str2Data(data.response));
                    }).catch(err => {
                        console.error(`Error ${err}, now shuffling randomly`);
                        resolve(randomShuffle(numW, numH));
                    });
                });
            }
        });
    };

    self.resolveTask = (tiles, onSuccessFn, onErrorFn) => {
        fetchDataAndDo((settings) => {
            $disc.xhrHandler.loadJsonProperties(`${settings['aiServer']}${settings['resolveURL'].replace('__TASK__', tiles2Task(tiles))}`).then(data => {
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
                $disc.xhrHandler.loadJsonProperties(`${settings['aiServer']}${settings['checkURL'].replace('__TASK__', task)}`).then(data => {
                    resolve(data);
                }).catch(err => reject(err));
            })
        });
    };
})(window.$disc.ai = window.$disc.ai || {});