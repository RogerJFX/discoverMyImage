import '../../js/storage';

const keys = $disc.storage.getKeys();

export const storageKeys = {
    KEY_LAST_LOADED: keys['KEY_LAST_LOADED'],
    KEY_LANG: keys['KEY_LANG'],
    KEY_CURRENT_TASK: keys['KEY_CURRENT_TASK'],
    KEY_CURRENT_IMAGE: keys['KEY_CURRENT_IMAGE'],
    KEY_PLAY_LEVEL: keys['KEY_PLAY_LEVEL'],
    KEY_JWT: keys['KEY_JWT'],
    KEY_NICK: keys['KEY_NICK'],
    KEY_TOKEN_EXP: keys['KEY_TOKEN_EXP'],
    KEY_REMOTE_UUID_LOADED: keys['KEY_REMOTE_UUID_LOADED']
};

export const startPage = Cypress.env('startPage') || '/index.devel.html?lang=de';