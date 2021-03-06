import {checkLocalStorage, CheckOperations, checkSessionStorage, parseJWT} from '../support/common/utils';
import {storageKeys, startPage, routes} from "../support/common/bridge";

describe('A remote image', () => {

    const correctUUID = '50194e6c-4dc7-4209-80af-b15488b5500c';

    before(() => {
        window.sessionStorage.clear();
        window.localStorage.clear();
    });


    it('should not be loaded from server by incorrect uuid', () => {
        cy.server();
        cy.route(routes.image.method, routes.image.url).as('image');
        const appendix = startPage.includes('?') ? '&uuid=definitely_wrong_uuid' : '?uuid=definitely_wrong_uuid';
        cy.visit(`${startPage}${appendix}`);
        cy.wait('@image').then((xhr) => {
            cy.wrap(xhr).its('status').should('eq', 404);
        });
    });

    it('should be loaded from server with bound level', () => {
        loadImageAndExamineTaskLevel(() => {
            cy.server();
            cy.route(routes.resolve.method, routes.resolve.url).as('resolve');
            checkSettingsRestrictions(2);
            requestSolve();
            cy.wait('@resolve').then(xhr => {
                cy.wrap(xhr).its('status').should('eq', 200);
                cy.wrap(xhr).its('request.headers.prp').then(header => {
                    expect(header).to.equal('3961827/126927'); // hashcode/length
                });
                cy.wrap(xhr).its('response.body').then(body => {
                    const steps = body['toWin'];
                    expect(steps).to.greaterThan(25); // see intelligence.TaskHandler12.scala. First for level 4 is 26
                });
            });
        });
    });

    it('should afterwards unbind level after loading example image', () => {
        loadExampleImage(() => {
            cy.server();
            cy.route(routes.resolve.method, routes.resolve.url).as('resolve');
            checkSettingsRestrictions(5);
            requestSolve();
            cy.wait('@resolve').then(xhr => {
                cy.wrap(xhr).its('status').should('eq', 200);
                cy.wrap(xhr).its('request.headers.prp').should('not.exist');
                cy.wrap(xhr).its('response.body').then(body => {
                    const steps = body['toWin'];
                    expect(steps).to.below(25); // see intelligence.TaskHandler12.scala. First for level 4 is 26
                });
            });
            cy.noOverlays('#alertOk').click();
        });
    });

    it('should load task at level "kidding"', () => {
        cy.server();
        cy.route(routes.resolve.method, routes.resolve.url).as('resolve');
        cy.get('#commonAlertModal').should('not.be.visible');
        cy.noOverlays('.body-header > .nav-icon').click();
        cy.menuClickWhenVisible('#changeSettingsButton');
        cy.menuVisible('#settingsModal')
            .children('button')
            .eq(0)
            .click();
        requestSolve();
        cy.wait('@resolve').then(xhr => {
            cy.wrap(xhr).its('response.body').then(body => {
                const steps = body['toWin'];
                expect(steps).to.below(5); // see intelligence.TaskHandler12.scala. Max steps for kidding is 4
            });
        });
    });

    function requestSolve() {
        cy.get('#commonAlertModal').should('not.be.visible');
        cy.noOverlays('.body-header > .nav-icon').click();
        cy.get('#solveButton').click();
        cy.menuClickWhenVisible('#promptOk');
    }

    function checkSettingsRestrictions(levels) {
        cy.get('#commonAlertModal').should('not.be.visible');
        cy.noOverlays('.body-header > .nav-icon').click();
        cy.menuClickWhenVisible('#changeSettingsButton');
        cy.menuVisible('#settingsModal')
            .children('button')
            .filter(':visible')
            .should('have.length', levels);
        cy.closeMenuView('#settingsModal');
        cy.closeMenuView('#mainMenu');
    }

    function loadExampleImage(assertFn) {
        cy.noOverlays('#alertOk').click();
        cy.noOverlays('.body-header > .nav-icon').click();
        cy.get('#exampleImageSelect').click();
        cy.server();
        cy.route(routes.task.method, routes.task.url).as('task');

        cy.menuClickWhenVisible('#exampleImageButton1');

        cy.wait('@task').then((xhr) => {
            cy.wrap(xhr).its('status').should('eq', 200);
            cy.get('#stage').find('.tile').should('have.length', 9);
        }).then(_ => {
            checkLocalStorage([[storageKeys.KEY_LAST_LOADED, null, CheckOperations.beNull]]);
            checkLocalStorage([[storageKeys.KEY_REMOTE_UUID_LOADED, 'false', CheckOperations.equals]]);
        });
        assertFn();
    }

    function loadImageAndExamineTaskLevel(assertFn) {

        cy.server();
        cy.route(routes.image.method, routes.image.url).as('image');
        cy.route(routes.task.method, routes.task.url).as('task');
        const appendix = startPage.includes('?') ? `&uuid=${correctUUID}` : `?uuid=${correctUUID}`;
        cy.visit(`${startPage}${appendix}`);

        cy.wait('@image').then(xhr => {

            cy.wrap(xhr).its('status').should('eq', 200);
            cy.wrap(xhr).its('response.body').then(response => {
                expect(response['lvl']).to.equal(4); // hard level
            });

        }).then(_ => {
            checkLocalStorage([[storageKeys.KEY_LAST_LOADED, null, CheckOperations.exist]]);
            checkLocalStorage([[storageKeys.KEY_REMOTE_UUID_LOADED, 'true', CheckOperations.equals]]);
        });

        cy.wait('@task').then(xhr => {
            cy.wrap(xhr).its('status').should('eq', 200);
        });
        cy.noOverlays('#alertOk').click();
        assertFn();
    }

});