window.$disc = window.$disc || {};
(function SettingsHandler(self) {

    const grid = [3, 3];

    let level = 2;

    let softSettings;

    let jwt;

    let nick;

    let serverCapabilities = {}; // {solutionStepsLeft: 128, uploadsLeft: 20}

    let identity = null;

    self.setNickname = (_nick) => {
        nick = _nick;
        $disc.storage.storeNick(_nick);
    };

    self.getNickname = () => {
        return nick || $disc.storage.getNick();
    };

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

    self.setJwt = (_jwt) => {
        jwt = _jwt;
        parseJWT(_jwt);
        $disc.storage.storeJWT(_jwt);
    };

    self.getJwt = () => {
        return jwt || $disc.storage.getJWT();
    };

    self.isQualifiedLoggedIn = () => {
        const jwt = self.getJwt();
        if(jwt) {
            if(!identity) {
                parseJWT(jwt);
            }
            return isQualifiedUser();
        }
        return false;
    };

    self.getServerCapabilities = () => {
        return serverCapabilities;
    };

    self.getSoftSettings = () => {
        return new Promise((resolve, reject) => {
            if(softSettings) {
                resolve(softSettings);
                return;
            }
            $disc.xhrHandler.loadJsonProperties($disc.constants.SETTINGS_URL, true).then(settings => {
                softSettings = settings;
                resolve(settings);
            }).catch(err => reject(err));
        })
    };

    function isQualifiedUser() {
        return identity && identity.indexOf('@') !== -1;
    }

    function parseJWT(jwt) {
        try {
            const base64 = jwt.split('.')[1];
            const entity = JSON.parse(atob(base64));
            serverCapabilities = JSON.parse(entity['sub']);
            identity = entity['jti'];
        } catch (err) {
            console.error(err);
        }

    }

})(window.$disc.settingsHandler = window.$disc.settingsHandler || {});
