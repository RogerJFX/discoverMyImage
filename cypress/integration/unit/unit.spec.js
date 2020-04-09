import '../../../js/constants';

// Hm, unit tests using Cypress... Should work.

describe('Unit-Tests', () => {

    it('should simply work', () => {
        expect($disc.constants.DEVICE_LIST_URL, 'simple assertion').to.equal('./data/devices.json');
    });

});