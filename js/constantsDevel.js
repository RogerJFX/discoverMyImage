window.$disc = window.$disc || {};
(function Constants(self) {
    Element.prototype.addClass = Element.prototype.addClass || function (clazz) {
        const existing = this.getAttribute('class');
        this.setAttribute('class', existing ? existing + ' ' + clazz : clazz);
        return this;
    };

    Element.prototype.removeClass = Element.prototype.removeClass || function (clazz) {
        if(!this.hasClass(clazz)) {
            return this;
        }
        this.setAttribute('class',
            this.getAttribute('class').split(' ').filter(item => item !== clazz).join(' ')
        );
        return this;
    };

    Element.prototype.hasClass = Element.prototype.hasClass || function (clazz) {
        return this.getAttribute('class') && this.getAttribute('class').split(' ').find(item => item === clazz) === clazz;
    };

    String.prototype.hashCode = function(){
        let hash = 0;
        for (let i = 0; i < this.length; i++) {
            const character = this.charCodeAt(i);
            hash = ((hash<<5)-hash)+character;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };

    String.prototype.makeSingularOrPlural = function(n) {
        const rawTokens = this.split("'''");
        const tokens = rawTokens.map(token => token.substring(0, token.indexOf("''")));
        let result = this;
        if(n === 1) {
            tokens.forEach(token => {
                if(token.startsWith('!')) {
                    result = result.replace(`'''${token}''`, token.substring(1));
                } else {
                    result = result.replace(`'''${token}''`, '');
                }
            });
        } else {
            tokens.forEach(token => {
                if (token.startsWith('!')) {
                    result = result.replace(`'''${token}''`, '');
                } else {
                    result = result.replace(`'''${token}''`, token);
                }
            });
        }
        return result;
    };

    self.DEVICE_LIST_URL = './data/devices.json';
    self.EXAMPLE_LIST_URL = './data/examples.json';
    self.LANGUAGE_URL = './data/language.json';
    self.SETTINGS_URL = './data/settingsDevel.json';
    self.EXAMPLES_FOLDER_URL = './img/examples/';

    self.REFERENCE_IMAGE_MAX_EDGE = 1000;
    self.MAX_IMAGE_WIDTH = 840;
    self.MAX_IMAGE_HEIGHT = 720;

    self.DOUBLE_CLICK_TIMEOUT = 500;
    self.AUTO_PLAY_TIMEOUT = 250;

    self.ANI_STEPS_TRANSLATECARD = 5;
    self.ANI_STEPS_APPENDCARD = 3;
    self.ANI_APPENDCARD_RESOLVE_AFTER = 1;

    self.MILLIS_PER_STEP = 30;
    self.AUTOSOLVE_NEXT_STEP_MILLIS = 2666;

    self.SETTINGS_BUTTONS = ['settingLevelKidding', 'settingLevelEasy', 'settingLevelMedium', 'settingLevelHard', 'settingLevelExtreme'];


})(window.$disc.constants = window.$disc.constants || {});
