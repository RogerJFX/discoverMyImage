import {checkLocalStorage, CheckOperations, checkSessionStorage, parseJWT, checkForm} from '../support/common/utils';
import {storageKeys, startPage, routes} from "../support/common/bridge";

describe('Example image', () => {

    const someTimeInThePast = 1580000000000; // 26.1.2020

    before(() => {
        window.sessionStorage.clear();
        window.localStorage.clear();
    });

    it('should be loaded with square dims and client side random task', () => {
        cy.visit(startPage);
        cy.noOverlays('.body-header > .nav-icon').click();
        cy.get('#exampleImageSelect').click();
        cy.server();
        cy.route({
            method: routes.task.method,
            url: routes.task.url,
            response: [],
            status: 500
        }).as('randomTask');

        cy.menuClickWhenVisible('#exampleImageButton1');

        cy.wait('@randomTask').then((xhr) => {
            cy.wrap(xhr).its('status').should('eq', 500);
            cy.get('#stage').find('.tile').should('have.length', 9);
        });
    });

    it('should be loaded with square dims and correct remote task', () => {
        cy.visit(startPage);
        cy.noOverlays('.body-header > .nav-icon').click();
        cy.get('#exampleImageSelect').click();
        cy.server();
        cy.route(routes.task.method, routes.task.url).as('task');

        cy.menuClickWhenVisible('#exampleImageButton1');

        cy.wait('@task').then((xhr) => {
            cy.wrap(xhr).its('status').should('eq', 200);
            cy.wrap(xhr).its('response.headers.jwt').then(jwt => {
                const jwtProps = parseJWT(jwt);
                expect(jwtProps['identity']).to.equal('Guest');
                expect(jwtProps['serverCapabilities']['ssl']).to.equal(256);
                expect(jwtProps['serverCapabilities']['ul']).to.equal(12);
            });
            cy.get('#stage').find('.tile').should('have.length', 9)
                .then(_ => {
                    checkSessionStorage([[storageKeys.KEY_JWT, null, CheckOperations.exist]]);
                    checkSessionStorage([[storageKeys.KEY_TOKEN_EXP, someTimeInThePast, CheckOperations.greaterThan]]);
                });
        });
        checkSaveTask();
        checkResolveTask();
        checkLoadTask();
    });

    it('should be sent to friend only if validation ok', () => {
        const wrongSendToFriendData = [
            {
                data: ['-', '-', 'wrongEmail'],
                check: 7
            },
            {
                data: ['Roger', '-', 'robert@crazything.de'],
                check: 2
            },
            {
                data: ['-', 'Roger', 'robert@crazything.de'],
                check: 1
            },
            {
                data: ['Roger', 'Joe', 'wrongEmail'],
                check: 4
            }
        ];
        cy.visit(startPage);
        cy.noOverlays('.body-header > .nav-icon').click();
        cy.get('#exampleImageSelect').click();
        cy.menuClickWhenVisible('#exampleImageButton1');
        cy.noOverlays('.body-header > .nav-icon').click();
        cy.menuClickWhenVisible('#puzzleButton');
        cy.menuClickWhenVisible('#uploadMenuButton');
        cy.menuVisible('#uploadModal');
        wrongSendToFriendData.forEach(dataset => {
            checkForm(dataset.data, dataset.check, '#uploadModal', '#uploadButton');
        })

        stubbingUpload(200, 'Das hat funktioniert');
    });

    it('Upload should fail due to servers HD to small', () => {
        stubbingUpload(507, 'nicht genug Speicher');
    });

    it('Upload should fail due to bad request', () => {
        stubbingUpload(400, 'wollte der Server die Daten nicht');
    });

    it('Upload should fail due to authentication problems', () => {
        stubbingUpload(403, 'Bitte versuche es später');
    });

    function stubbingUpload(status, expectedMsg) {
        cy.server();
        cy.route({
            method: routes.store.method,
            url: routes.store.url,
            response: [],
            status: status
        }).as('storeStub');

        cy.get('#sendMyName').clear().type('Karl');
        cy.get('#sendHisName').clear().type('Heinz');
        cy.get('#sendToEmail').clear().type('karl@heinz.de{Enter}');
        //cy.get('#uploadButton').click(); // Done by {Enter}
        cy.wait('@storeStub').then(xhr => {
            cy.wrap(xhr).its('status').should('eq', status);
            cy.get('#commonAlertModal').should('be.visible').should('contain', expectedMsg);
            cy.get('#alertOk').click();
        })
    }

    function checkSaveTask() {
        cy.noOverlays('.body-header > .nav-icon').click()
            .then(_ => {
                checkLocalStorage([[storageKeys.KEY_CURRENT_IMAGE, null, CheckOperations.beNull]]);
                checkLocalStorage([[storageKeys.KEY_CURRENT_TASK, null, CheckOperations.beNull]]);
            });
        cy.menuClickWhenVisible('#puzzleButton');
        cy.menuClickWhenVisible('#storeGameButton')
            .then(_ => {
                checkLocalStorage([[storageKeys.KEY_CURRENT_IMAGE, null, CheckOperations.exist]]);
                checkLocalStorage([[storageKeys.KEY_CURRENT_TASK, null, CheckOperations.exist]]);
            })
    }

    function checkLoadTask() {
        cy.visit(startPage);
        cy.get('#stage').find('.tile').should('have.length', 0);
        cy.noOverlays('.body-header > .nav-icon').click();
        cy.menuClickWhenVisible('#puzzleButton');
        cy.menuClickWhenVisible('#loadGameButton');
        cy.get('#stage').find('.tile').should('have.length', 9);
    }

    function checkResolveTask() {
        cy.server();
        cy.route(routes.resolve.method, routes.resolve.url).as('resolve');
        cy.noOverlays('.body-header > .nav-icon').click();
        cy.get('#solveButton').click();
        cy.menuClickWhenVisible('#promptOk');
        cy.wait('@resolve').then(xhr => {
            cy.wrap(xhr).its('response.body').then(body => {
                const steps = body['toWin'];
                const remaining = 256 - steps;
                cy.log(`Remaining steps to expect: ${remaining}`);
                return cy.wrap(remaining);
            }).then(remaining => {
                cy.wrap(xhr).its('response.headers.jwt').then(jwt => {
                    const jwtProps = parseJWT(jwt);
                    expect(jwtProps['identity']).to.equal('Guest');
                    expect(jwtProps['serverCapabilities']['ssl']).to.equal(remaining);
                    expect(jwtProps['serverCapabilities']['ul']).to.equal(12);
                });
            });
        }).then(_ => cy.menuClickWhenVisible('#alertOk'));
    }



});