window.$disc = window.$disc || {};
(function SettingsHandler(self) {

    //const supported = [3, 4, 5];

    let currSettings = [4, 4];

    let softSettings;

    self.getSettings = () => {
        const storedSetting = $disc.storage.getSettings();
        return storedSetting ? [storedSetting.wh, storedSetting.wh] : currSettings;
    };

    self.getTileSettings = () => {
        const storedSetting = $disc.storage.getSettings();
        return storedSetting ? [storedSetting.wh, storedSetting.wh] : currSettings;
    };

    self.setSettings = (wh) => {
        $disc.storage.setSettings(wh);
        currSettings = [wh, wh];
    };

    self.getSoftSettings = () => {
        return new Promise((resolve, reject) => {
            $disc.xhrHandler.loadJsonProperties($disc.constants.SETTINGS_URL).then(settings => {
                softSettings = settings;
                resolve(settings);
            }).catch(err => reject(err));
        })
    };

})(window.$disc.settingsHandler = window.$disc.settingsHandler || {});
