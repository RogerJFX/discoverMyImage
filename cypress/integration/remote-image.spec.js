import {parseJWT} from "../support/utils";

describe('A remote image', () => {

    const startPage = '/index.devel.html';

    const taskRequestUrl = '**/task.php**';
    const imageRequestUrl = '**/get.php**';
    const resolveRequestUrl = '**/resolve.php**';

    const correctUUID = '50194e6c-4dc7-4209-80af-b15488b5500c';

    before(() => {
        window.sessionStorage.clear();
        window.localStorage.clear();
    });


    it('should not be loaded from server by incorrect uuid', () => {
        cy.server();
        cy.route('GET', imageRequestUrl).as('image');

        cy.visit(`${startPage}?uuid=definitely_wrong_uuid`);
        cy.wait('@image').then((xhr) => {
            cy.wrap(xhr).its('status').should('eq', 404);
        });
    });

    it('should be loaded from server with correct task', () => {
        loadImageAndExamineTaskLevel(() => {
            cy.server();
            cy.route('GET', resolveRequestUrl).as('resolve');
            cy.menuClickWhenVisible('#promptOk');
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

    it('should be loaded from server with correct task though faked header', () => {
        loadExampleImage(() => {
            cy.server();
            cy.route('GET', resolveRequestUrl).as('resolve');
            cy.menuClickWhenVisible('#promptOk');
            cy.wait('@resolve').then(xhr => {
                cy.wrap(xhr).its('status').should('eq', 200);
                cy.wrap(xhr).its('request.headers.prp').should('not.exist');
                cy.wrap(xhr).its('response.body').then(body => {
                    const steps = body['toWin'];
                    expect(steps).to.below(25); // see intelligence.TaskHandler12.scala. First for level 4 is 26
                });
            });
        });
    });

    function loadExampleImage(assertFn) {
        cy.get('#alertOk').click();
        cy.get('.body-header > .nav-icon').click();
        cy.get('#exampleImageSelect').click();
        cy.server();
        cy.route('GET', taskRequestUrl).as('task');

        cy.menuClickWhenVisible('#exampleImageButton1');

        cy.wait('@task').then((xhr) => {
            cy.wrap(xhr).its('status').should('eq', 200);
            cy.get('#stage').find('.tile').should('have.length', 9);
        });
        // cy.get('#alertOk').click();
        cy.get('#commonAlertModal').should('not.be.visible');
        cy.get('.body-header > .nav-icon').click();
        cy.get('#solveButton').click();
        assertFn();
    }

    function loadImageAndExamineTaskLevel(assertFn) {

        cy.server();
        cy.route('GET', imageRequestUrl).as('image');
        cy.route('GET', taskRequestUrl).as('task');

        cy.visit(`${startPage}?uuid=${correctUUID}`);

        cy.wait('@image').then(xhr => {

            cy.wrap(xhr).its('status').should('eq', 200);
            cy.wrap(xhr).its('response.body').then(response => {
                expect(response['lvl']).to.equal(4); // hard level
            });

        });

        cy.wait('@task').then(xhr => {
            console.log(xhr);
            cy.wrap(xhr).its('status').should('eq', 200);
        });
        cy.get('#alertOk').click();
        cy.get('#commonAlertModal').should('not.be.visible');
        cy.get('.body-header > .nav-icon').click();
        cy.get('#solveButton').click();
        assertFn();
    }

});