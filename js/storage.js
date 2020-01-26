window.$disc = window.$disc || {};
(function Storage(self) {

    const storage = localStorage;

    function createImageItem (imageData, sender, storeDate, settings, tilePositions) {
        return {
            imageData: imageData,
            sender: sender,
            storeDate: storeDate,
            settings: settings,
            tilePositions: tilePositions
        }
    }

    function createSettings() {

    }



})(window.$disc.storage = window.$disc.storage || {});