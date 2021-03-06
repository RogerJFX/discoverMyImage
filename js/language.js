window.$disc = window.$disc || {};
(function Language(self) {

    let props = null;
    let currLang = 'latin';
    const supported = ['en', 'de'];

    self.isLangSupported = (language) => {
        return supported.includes(language);
    };

    self.getCurrLang = () => {
        return supported.includes(currLang) ? currLang : supported[0];
    };

    self.switchLanguage = (lang) => {
        lang = supported.includes(lang) ? lang : supported[0];
        if (props && lang === currLang) {
            return;
        }
        currLang = lang;
        $disc.storage.setLanguage(lang);
        if (props) {
            callObservers(props, lang);
        } else {
            fetchLangProps((obj) => callObservers(obj, lang));
        }
    };

    self.getTranslation = (id) => {
        const lang = props ? currLang : supported[0];
        return new Promise((resolve, reject) => {
            function findTranslation() {
                const entry = props.find(p => p.id === id);
                if (entry) {
                    resolve(entry.lang[lang]);
                } else {
                    reject('No translation found');
                }
            }
            if (props) {
                findTranslation();
            } else {
                fetchLangProps(() => findTranslation());
            }
        });
    };

    function fetchLangProps(cb) {
        $disc.xhrHandler.loadJsonProperties($disc.constants.LANGUAGE_URL, true).then(obj => {
            props = obj;
            cb(obj);
        });
    }

    function callObservers(props, lang) {
        function handleCandidate(candidate, prop) {
            if (candidate) {
                if (candidate.getAttribute('placeholder')) {
                    candidate.setAttribute('placeholder', prop.lang[lang]);
                } else {
                    candidate.innerHTML = prop.lang[lang];
                }
            }
        }
        props.forEach(prop => {
            const candidate = document.getElementById(prop.id);
            handleCandidate(candidate, prop);
            const headerCandidate = document.getElementById('_' + prop.id);
            handleCandidate(headerCandidate, prop);
        });

    }

})(window.$disc.lang = window.$disc.lang || {});