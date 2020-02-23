window.$disc = window.$disc || {};
(function SettingsHandler(self) {

    //const supported = [3, 4, 5];

    let currSettings = [3, 3, 2];

    let grid = [3, 3];

    let level = 2;

    let softSettings;

    // self.getSettings = () => {
    //     const storedSetting = $disc.storage.getSettings();
    //     return storedSetting ? [storedSetting.wh, storedSetting.wh, storedSetting.level] : currSettings;
    // };

    self.getTileSettings = () => {
        //const storedSetting = $disc.storage.getSettings();
        const lvl = $disc.storage.getLevel() || level;
        return [grid[0], grid[1], lvl];
        // return storedSetting ? [storedSetting.wh, storedSetting.wh, storedSetting.level] : currSettings;
    };

    // self.setSettings = (wh, level) => {
    //     $disc.storage.setSettings(wh, level);
    //     currSettings = [wh, wh, level];
    // };

    self.setLevel = (_level) => {
        level = _level;
    };

    self.setGrid = (w, h) => {
        grid = [w, h];
    };

    self.getGrid = () => grid;

    self.getLevel = () => level;

    self.getSoftSettings = () => {
        return new Promise((resolve, reject) => {
            if(softSettings) {
                resolve(softSettings);
            }
            $disc.xhrHandler.loadJsonProperties($disc.constants.SETTINGS_URL, true).then(settings => {
                softSettings = settings;
                resolve(settings);
            }).catch(err => reject(err));
        })
    };

})(window.$disc.settingsHandler = window.$disc.settingsHandler || {});
