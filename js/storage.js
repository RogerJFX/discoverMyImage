window.$disc = window.$disc || {};
(function Storage(self) {

    const storage = localStorage;

    const KEYS = {
        KEY_LAST_LOADED: '__last_loaded__',
        KEY_LANG: '__lang__',
        KEY_CURRENT_TASK: '__task__',
        KEY_CURRENT_IMAGE: '__task_img__',
        KEY_PLAY_LEVEL: '__lvl__',
        KEY_JWT: '__jwt__',
        KEY_NICK: '__nick__',
        KEY_TOKEN_EXP: '__texp__',
        KEY_REMOTE_UUID_LOADED: '__rud__'
    };

    self.getKeys = () => {
      return KEYS;
    };

    self.setLevel = level => storage.setItem(KEYS.KEY_PLAY_LEVEL, '' + level);

    self.getLevel = () => {
        const str = storage.getItem(KEYS.KEY_PLAY_LEVEL);
        return str ? Number(str) : null;
    };

    self.setLastLoadedImage = (imgData) => {
        storage.setItem(KEYS.KEY_LAST_LOADED, imgData);
    };

    self.setRemoteImageLoaded = (uuidLoaded) => {
        storage.setItem(KEYS.KEY_REMOTE_UUID_LOADED, uuidLoaded + '');
    };

    self.isRemoteImageLoaded = () => storage.getItem(KEYS.KEY_REMOTE_UUID_LOADED) === 'true';

    self.getLastLoadedImage = () => {
        return storage.getItem(KEYS.KEY_LAST_LOADED);
    };

    self.setLanguage = (language) => {
        storage.setItem(KEYS.KEY_LANG, language);
    };

    self.getLanguage = () => {
        return storage.getItem(KEYS.KEY_LANG);
    };

    self.getJWT = () => {
        return sessionStorage.getItem(KEYS.KEY_JWT);
    };

    self.storeJWT = (jwt) => {
        sessionStorage.setItem(KEYS.KEY_JWT, jwt);
    };

    self.getNick = () => {
        return sessionStorage.getItem(KEYS.KEY_NICK);
    };

    self.storeNick = (nick) => {
        sessionStorage.setItem(KEYS.KEY_NICK, nick);
    };

    self.storeTokenExp = (millis) => {
        sessionStorage.setItem(KEYS.KEY_TOKEN_EXP, millis + '');
    };

    self.getTokenExp = () => {
        return sessionStorage.getItem(KEYS.KEY_TOKEN_EXP);
    };

    self.clearSession = () => {
        sessionStorage.clear();
    };

    self.saveCurrentTask = (image, tileStates, settings) => {
        storage.setItem(KEYS.KEY_CURRENT_IMAGE, image.src);
        storage.setItem(KEYS.KEY_CURRENT_TASK, JSON.stringify({
            tileStates: tileStates,
            settings: settings
        }))
    };

    self.getCurrentTask = () => {
        const item = storage.getItem(KEYS.KEY_CURRENT_TASK);
        const image = storage.getItem(KEYS.KEY_CURRENT_IMAGE);
        if(item) {
            const result = JSON.parse(item);
            result.image = image;
            return result;
        }
        return null;
    };

    self.hasCurrentTaskStored = () => {
        return !!storage.getItem(KEYS.KEY_CURRENT_TASK);
    };

})(window.$disc.storage = window.$disc.storage || {});