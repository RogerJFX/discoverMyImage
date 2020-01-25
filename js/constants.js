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
    // discover-my-image.com
    //
    // discovermy.photos

    self.IMAGE_STORE_URL = '../discCgi/store.php';
    self.IMAGE_GET_URL = '../discCgi/get.php';

    self.EXAMPLE_LIST_URL = './examples.json';
    self.LANGUAGE_URL = './language.json';
    self.EXAMPLES_FOLDER_URL = './img/examples/';

    self.MAX_IMAGE_WIDTH = 1000;
    self.MAX_IMAGE_HEIGHT = 800;

    self.DOUBLE_CLICK_TIMEOUT = 500;
    self.AUTO_PLAY_TIMEOUT = 250;

    self.ANI_STEPS_TRANSLATECARD = 5;
    self.ANI_STEPS_APPENDCARD = 3;
    self.ANI_APPENDCARD_RESOLVE_AFTER = 1;

    self.MILLIS_PER_STEP = 25;


})(window.$disc.constants = window.$disc.constants || {});
