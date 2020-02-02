window.$disc = window.$disc || {};
(function StageActions(self) {

    let stage, outerStage;
    let originalImage, stageImage;

    // Workhorse. This will be called for any image.
    self.processFile = (promise, settings, tileStates) => {
        const {convert2BW, modifyImage, simpleDarken, resizeToStage} = window.$disc.imageHandler;
        promise.then(image => {
            originalImage = image;
            return image;
        }).catch(_ => {
            return Promise.reject('wrongImageFormat');
        }).then(image => {
            return resizeToStage(image).then(stImage => {
                stageImage = stImage;
                return stImage;
            });
        }).then(image => {
            // Background
            modifyImage(image, [convert2BW, simpleDarken])
                .then(bgImg => {
                    stage.style.backgroundImage = `URL(${bgImg.src})`;
                });
            // Tiles
            self.buildTiles(settings, tileStates ? () => window.$disc.tileManager
                .fromStoredArray(image, settings[0], settings[1], tileStates, winAction) : null);
        }).catch(err => {
            console.error(err);
            $disc.lang.getTranslation(err).then(t => {
                $disc.menuHandler.alert(t);
            }).catch(err => console.error(`No translation for "${err}"`));
        });
    };

    self.buildTiles = (settings, initFn) => {
        initFn = initFn || function () {
            return window.$disc.tileManager.buildTiles(stageImage, settings[0], settings[1], winAction);
        };
        if(stageImage) {
            outerStage.innerHTML = '';
            const tiles = initFn();
            stage.innerHTML = '';
            const tD = tiles[0].getDimensions();
            const stageWidth = tD[0] * settings[0];
            const stageHeight = tD[1] * settings[1];
            stage.style.height = `${stageHeight}px`;
            stage.style.width = `${stageWidth}px`;
            outerStage.style.height = `${stageHeight + 24}px`;
            outerStage.style.width = `${stageWidth + 24}px`;
            tiles.forEach(tile => {
                stage.appendChild(tile.toNode());
            });
            createLegend(settings, tD);
            outerStage.appendChild(stage);
        }
    };

    function createLegend(settings, tD) {

        for (let i = settings[0] - 1; i >= 0; i--) {
            const node = document.createElement('DIV');
            node.addClass('board-letter');
            node.innerHTML = String.fromCharCode(65 + i);
            node.style.width=`${tD[0]}px`;
            node.style.right = `${(settings[0] - i -1) * tD[0]}px`;
            outerStage.appendChild(node);
        }
        for (let i = 0; i < settings[1]; i++) {
            const node = document.createElement('DIV');
            const inode = document.createElement('DIV');
            node.appendChild(inode);
            node.addClass('board-num');
            inode.innerHTML = `${i+1}`;
            node.style.height=`${tD[1]}px`;
            node.style.top = `${i * tD[1]}px`;
            outerStage.appendChild(node);
        }
    }

    self.getCurrentImage = () => {
      return originalImage;
    };

    self.hasCurrentImage = () => {
        return !!originalImage;
    };

    self.init = (_stage, _outerStage) => {
        stage = _stage;
        outerStage = _outerStage;
    };

    function winAction () {
        stage.innerHTML = '';
        stage.style.backgroundImage=`URL(${originalImage.src})`;
    }

})(window.$disc.stageActions = window.$disc.stageActions || {});