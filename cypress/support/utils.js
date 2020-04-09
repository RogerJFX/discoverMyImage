export function parseJWT(jwt) {
    try {
        const base64 = jwt.split('.')[1];
        const entity = JSON.parse(atob(base64));
        return {
            identity: entity['jti'],
            serverCapabilities: JSON.parse(entity['sub'])
        }
    } catch (err) {
        console.error(err);
    }
}

export function checkStorage(keyValuePairArray, storage) {
    keyValuePairArray.forEach(kV => {
        switch(kV[2]) {
            case CheckOperations.equals:
                expect(storage.getItem(kV[0]), 'storage').to.equal(kV[1]);
                break;
            case CheckOperations.greaterThan:
                expect(Number(storage.getItem(kV[0])), 'storage').to.greaterThan(kV[1]);
                break;
            case CheckOperations.lessThen:
                expect(Number(storage.getItem(kV[0])), 'storage').to.lessThan(kV[1]);
                break;
            case CheckOperations.exist:
                expect(storage.getItem(kV[0]), 'storage').to.exist;
                break;
            case CheckOperations.beNull:
                expect(storage.getItem(kV[0]), 'storage').to.be.null;
                break;
        }
    })
}

export function checkLocalStorage(keyValuePairArray) {
    checkStorage(keyValuePairArray, window.localStorage);
}

export function checkSessionStorage(keyValuePairArray) {
    checkStorage(keyValuePairArray, window.sessionStorage);
}

export const CheckOperations = {
    equals: 'eq',
    greaterThan: 'gt',
    lessThen: 'lt',
    exist: 'ex',
    beNull: 'nu'
};

export const UserCredentials = {
    email: 'roger.hoesl@gmail.com',
    pass: 'Katze123',
    nickname: 'Sugar Ray Shumway'
};
