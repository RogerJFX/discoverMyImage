window.$disc = window.$disc || {};
(function SettingsHandler(self) {

    const grid = [3, 3];

    let level = 2;

    let softSettings;

    self.setLevel = (_level) => {
        $disc.storage.setLevel(_level);
        level = _level;
    };

    self.setLastGrid = (w, h) => {
        grid[0] = w;
        grid[1] = h;
    };

    self.getLastGrid = () => {
        return grid;
    };

    self.getLevel = () => {
        return $disc.storage.getLevel() || level;
    };

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
