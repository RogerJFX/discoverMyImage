window.$disc = window.$disc || {};
(function Storage(self) {

    const storage = localStorage;

    const KEY_LAST_LOADED = '__last_loaded__';
    const KEY_SETTINGS = '__settings__';
    const KEY_LANG = '__lang__';
    const KEY_CURRENT_TASK = '__task__';
    const KEY_CURRENT_IMAGE = '__task_img__';

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

    self.setLanguage = (language) => {
        storage.setItem(KEY_LANG, language);
    };

    self.getLanguage = () => {
        return storage.getItem(KEY_LANG);
    };

    self.saveCurrentTask = (image, tileStates, settings) => {
        storage.setItem(KEY_CURRENT_IMAGE, image.src);
        storage.setItem(KEY_CURRENT_TASK, JSON.stringify({
            tileStates: tileStates,
            settings: settings
        }))
    };

    self.getCurrentTask = () => {
        const item = storage.getItem(KEY_CURRENT_TASK);
        const image = storage.getItem(KEY_CURRENT_IMAGE);
        if(item) {
            const result = JSON.parse(item);
            result.image = image;
            return result;
        }
        return null;
    };

    self.hasCurrentTaskStored = () => {
        return !!storage.getItem(KEY_CURRENT_TASK);
    };

})(window.$disc.storage = window.$disc.storage || {});