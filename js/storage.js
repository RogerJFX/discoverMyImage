window.$disc = window.$disc || {};
(function Storage(self) {

    const storage = localStorage;

    const KEY_LAST_LOADED = '__last_loaded__';
    const KEY_SETTINGS = '__settings__';

    // MAX 5 tasks
    function createTask (imageData, sender, storeDate, settings, tilePositions) {
        return {
            imageData: imageData,
            sender: sender,
            storeDate: new Date().getTime(),
            settings: settings,
            tilePositions: tilePositions
        }
    }

    function createSettings(wh, allowDynIncreaseWorH) {
        return {
            wh: wh,
            allowDynIncreaseWorH: allowDynIncreaseWorH || false
        }
    }

    self.setSettings = (wh, allowDynIncrease) => {
        storage.setItem(KEY_SETTINGS, JSON.stringify(createSettings(wh, allowDynIncrease)));
    };

    self.getSettings = () => {
        const str = storage.getItem(KEY_SETTINGS);
        return str ? JSON.parse(str) : null;
    };

    self.setLastLoadedImage = (imgData) => {
        storage.setItem(KEY_LAST_LOADED, imgData);
    };

    self.getLastLoadedImage = () => {
        return storage.getItem(KEY_LAST_LOADED);
    };



})(window.$disc.storage = window.$disc.storage || {});