window.$disc = window.$disc || {};
(function Language(self) {

    let props = null;
    let currLang = 'latin';
    const supported = ['en', 'de'];

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
        $disc.xhrHandler.loadJsonProperties('./language.json').then(obj => {
            props = obj;
            callObservers(obj, lang);
        })
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