window.$disc = window.$disc || {};
(function StageActions(self) {

    let stage, outerStage;
    let originalImage;

    self.processFile = (promise, settings) => {
        const ih = window.$disc.imageHandler;
        promise.then(image => {
            originalImage = image;
            ih.modifyImage(image, [ih.convert2BW, ih.simpleDarken])
                .then(bgImg => {
                    stage.style.backgroundImage = `URL(${bgImg.src})`;
                    // stage.style.height = `${bgImg.height}px`;
                    // stage.style.width = `${bgImg.width}px`;
                });
            return image;
        }).then(_ => {
            self.buildTiles(settings);
        });
        // .catch(() => {
        //     $disc.lang.getTranslation('wrongImageFormat').then(t => {
        //         $disc.menuHandler.alert(t);
        //     }).catch(err => $disc.menuHandler.alert(`No translation for "${err}"`));
        // });
    };

    self.buildTiles = (settings) => {
        if(originalImage) {
            const tiles = window.$disc.tileManager.buildTiles(originalImage, settings[0], settings[1], winAction);
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

    self.init = (_stage, _outerStage) => {
        stage = _stage;
        outerStage = _outerStage;
    };

    function winAction () {
        stage.innerHTML = '';
        stage.style.backgroundImage=`URL(${originalImage.src})`;
    }

})(window.$disc.stageActions = window.$disc.stageActions || {});