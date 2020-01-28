window.$disc = window.$disc || {};
(function SettingsHandler(self) {

    //const supported = [3, 4, 5];

    let currSettings = [4, 4];

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

})(window.$disc.settingsHandler = window.$disc.settingsHandler || {});
