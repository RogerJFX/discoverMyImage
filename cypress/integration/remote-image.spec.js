import {parseJWT} from "../support/utils";

describe('A remote image', () => {

    const startPage = '/index.devel.html';

    const taskRequestUrl = '**/task.php**';
    const imageRequestUrl = '**/get.php**';
    const resolveRequestUrl = '**/resolve.php**';

    before(() => {
        window.sessionStorage.clear();
        window.localStorage.clear();
    });


    it('should not be loaded from server', () => {
        cy.server();
        cy.route('GET', imageRequestUrl).as('image');

        cy.visit(`${startPage}?uuid=definitely_wrong_uuid`);
        cy.wait('@image').then((xhr) => {
            cy.wrap(xhr).its('status').should('eq', 404);
        });
    });

    it('should be loaded from server with correct task', () => {
        cy.server();
        cy.route('GET', imageRequestUrl).as('image');
        cy.route('GET', taskRequestUrl).as('task');
        cy.route('GET', resolveRequestUrl).as('resolve');

        cy.visit(`${startPage}?uuid=50194e6c-4dc7-4209-80af-b15488b5500c`);
        cy.wait('@image').then((xhr) => {
            cy.wrap(xhr).its('status').should('eq', 200);
            cy.wrap(xhr).its('response.body').then(response => {
                expect(response['lvl']).to.equal(4); // hard level
            });
        });
        cy.wait('@task').then((xhr) => {
            cy.wrap(xhr).its('status').should('eq', 200);
        });
        cy.get('#alertOk').click();
        cy.get('#commonAlertModal').should('not.be.visible');
        /*
            Lets test, that although level 2 is being send to task.php, the server will respond a level 4 (hard)
         */
        cy.get('.body-header > .nav-icon').click();
        cy.get('#solveButton').click();
        cy.menuClickWhenVisible('#promptOk');
        cy.wait('@resolve').then(xhr => {
            cy.wrap(xhr).its('response.body').then(body => {
                const steps = body['toWin'];
                expect(steps).to.greaterThan(25); // see intelligence.TaskHandler12.scala. First for level 4 is 26
            });
        });
    });

});