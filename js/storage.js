window.$disc = window.$disc || {};
(function Storage(self) {

    const storage = localStorage;

    const KEY_LAST_LOADED = '__last_loaded__';
    const KEY_LANG = '__lang__';
    const KEY_CURRENT_TASK = '__task__';
    const KEY_CURRENT_IMAGE = '__task_img__';
    const KEY_PLAY_LEVEL = '__lvl__';
    const KEY_JWT = '__jwt__';
    const KEY_NICK = '__nick__';

    self.setLevel = level => storage.setItem(KEY_PLAY_LEVEL, '' + level);

    self.getLevel = () => {
        const str = storage.getItem(KEY_PLAY_LEVEL);
        return str ? Number(str) : null;
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

    self.getJWT = () => {
        return sessionStorage.getItem(KEY_JWT);
    };

    self.storeJWT = (jwt) => {
        sessionStorage.setItem(KEY_JWT, jwt);
    };

    self.getNick = () => {
        return sessionStorage.getItem(KEY_NICK);
    };

    self.storeNick = (nick) => {
        sessionStorage.setItem(KEY_NICK, nick);
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