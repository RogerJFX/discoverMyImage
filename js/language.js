window.$disc = window.$disc || {};
(function Language(self) {

    let props = null;
    let currLang = 'latin';
    const supported = ['en', 'de'];

    self.getCurrLang = () => {
        return supported.includes(currLang) ? currLang : supported[0];
    };

    self.switchLanguage = (lang) => {
        lang = supported.includes(lang) ? lang : supported[0];
        if(lang === currLang) {
            return;
        }
        currLang = lang;
        if(props) {
            callObservers(props, lang);
            return;
        }
        // lazy, but not really.
        $disc.xhrHandler.loadJsonProperties($disc.constants.LANGUAGE_URL).then(obj => {
            props = obj;
            callObservers(obj, lang);
        })
    };

    self.getTranslation = (id) => {
        const lang = props ? currLang : supported[0];
        return new Promise((resolve, reject) => {
            function findTranslation() {
                const entry = props.find(p => p.id === id);
                if(entry) {
                    resolve(entry.lang[lang]);
                } else {
                    reject('No translation found');
                }
            }
            if(props) {
                findTranslation();
            } else {
                $disc.xhrHandler.loadJsonProperties($disc.constants.LANGUAGE_URL).then(obj => {
                    props = obj;
                    findTranslation();
                })
            }
        });
    };

    function callObservers(props, lang) {
        props.forEach(prop => {
            const candidate = document.getElementById(prop.id);
            if(candidate) {
                if(candidate.getAttribute('placeholder')) {
                    candidate.setAttribute('placeholder', prop.lang[lang]);
                } else {
                    candidate.innerHTML = prop.lang[lang];
                }
            }
        });

    }

})(window.$disc.lang = window.$disc.lang || {});