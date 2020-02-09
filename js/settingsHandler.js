window.$disc = window.$disc || {};
(function SettingsHandler(self) {

    //const supported = [3, 4, 5];

    let currSettings = [4, 4, 0];

    let softSettings;

    // self.getSettings = () => {
    //     const storedSetting = $disc.storage.getSettings();
    //     return storedSetting ? [storedSetting.wh, storedSetting.wh, storedSetting.level] : currSettings;
    // };

    self.getTileSettings = () => {
        const storedSetting = $disc.storage.getSettings();
        return storedSetting ? [storedSetting.wh, storedSetting.wh, storedSetting.level] : currSettings;
    };

    self.setSettings = (wh, level) => {
        $disc.storage.setSettings(wh, level);
        currSettings = [wh, wh, level];
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
