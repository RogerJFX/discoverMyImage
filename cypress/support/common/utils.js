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
    console.log(keyValuePairArray);
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
    console.log('check local storage');
    checkStorage(keyValuePairArray, window.localStorage);
}

export function checkSessionStorage(keyValuePairArray) {
    checkStorage(keyValuePairArray, window.sessionStorage);
}

export function checkForm(data, checkNr, formSelector, submitButtonSelector) {
    cy.get(formSelector).find('input').then(inputs => {
        for (let i = 0; i < data.length; i++) {
            cy.wrap(inputs[i]).clear().type(data[i]);
        }
        cy.get(submitButtonSelector).click();
        for (let i = 0; i < data.length; i++) {
            if((checkNr & (1 << i)) !== 0) {
                cy.wrap(inputs[i]).should('have.class', 'wrongInput');
            } else {
                cy.wrap(inputs[i]).should('not.have.class', 'wrongInput');
            }
        }
    })
}

export const CheckOperations = {
    equals: 'eq',
    greaterThan: 'gt',
    lessThen: 'lt',
    exist: 'ex',
    beNull: 'nu'
};

