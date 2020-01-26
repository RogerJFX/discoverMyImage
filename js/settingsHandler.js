window.$disc = window.$disc || {};
(function SettingsHandler(self) {

    const supported = [3, 4, 5];

    let currSettings = [3, 3];

    self.getSettings = () => {
        return currSettings;
    };

    self.getTileSettings = () => {
        return currSettings
    };

    self.setSettings = (settings) => {
        currSettings = settings;
    };

})(window.$disc.settingsHandler = window.$disc.settingsHandler || {});
