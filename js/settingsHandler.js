window.$disc = window.$disc || {};
(function SettingsHandler(self) {

    const grid = [3, 3];

    let level = 2;

    let softSettings;

    let jwt;

    let nick;

    let serverCapabilities = {}; // {ssl: 128, ul: 20}

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

    self.getMinLevel = () => {
        if($disc.storage.isRemoteImageLoaded()) {
            const sub = parseJWT(self.getJwt());
            return sub['it']['lv'];
        } else {
            return 0;
        }

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

    self.guardToken = () => {
        const TEN_MINUTES = 1000 * 60 * 10;
        const ONE_HOUR = TEN_MINUTES * 6;
        function checkExpiration() {
            const exp = Number($disc.storage.getTokenExp());
            const diff = exp - new Date().getTime();
            if(diff < ONE_HOUR) {
                if(self.isQualifiedLoggedIn()) {
                    $disc.lang.getTranslation('sessionExpWarningAlert').then(t => {
                        $disc.menuHandler.alert(t, '!!!', null, () => {
                            $disc.menuHandler.handleMenuClick(['loginModal', 'modalLayer', 'modalBG'], []);
                        }, false);
                    });
                } else {
                    clearSession();
                    $disc.storage.clearSession();
                    $disc.xhrHandler.login({email: 'John', pass: 'Doe'}, () => {}, () => {});
                }
            }
        }
        function checkToken() {
            const token = self.getJwt();
            if(token) {
                checkExpiration();
            }
        }
        checkToken();
        window.setInterval(checkToken, TEN_MINUTES);
    };

    function clearSession() {
        jwt = null;
        nick = null;
        serverCapabilities = {};
        identity = null;
    }

    function isQualifiedUser() {
        return identity && identity.indexOf('@') !== -1;
    }

    function setTokenExpirationDate(iat, exp) {
        const localNow = new Date().getTime();
        const expireTimeMillis = localNow + (exp - iat) * 1000;
        $disc.storage.storeTokenExp(expireTimeMillis);
    }

    function parseJWT(jwt) {
        try {
            const base64 = jwt.split('.')[1];
            const entity = JSON.parse(atob(base64));
            serverCapabilities = JSON.parse(entity['sub']);
            identity = entity['jti'];
            setTokenExpirationDate(entity['iat'], entity['exp']);
            return serverCapabilities;
        } catch (err) {
            console.error(err);
        }
    }

})(window.$disc.settingsHandler = window.$disc.settingsHandler || {});
