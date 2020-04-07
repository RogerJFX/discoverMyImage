import {parseJWT} from '../support/utils';

describe('Example image', () => {

    const startPage = '/index.devel.html';
    const taskRequestUrl = '**/task.php**';
    const resolveRequestUrl = '**/resolve.php**';

    before(() => {
        window.sessionStorage.clear();
        window.localStorage.clear();
    });

    it('should be loaded with square dims', () => {

        cy.visit(startPage);
        cy.noOverlays('.body-header > .nav-icon').click();
        cy.get('#exampleImageSelect').click();
        cy.server();
        cy.route('GET', taskRequestUrl).as('task');
        cy.route('GET', resolveRequestUrl).as('resolve');

        cy.menuClickWhenVisible('#exampleImageButton1');

        cy.wait('@task').then((xhr) => {
            cy.wrap(xhr).its('status').should('eq', 200);
            cy.wrap(xhr).its('response.headers.jwt').then(jwt => {
                const jwtProps = parseJWT(jwt);
                expect(jwtProps['identity']).to.equal('Guest');
                expect(jwtProps['serverCapabilities']['ssl']).to.equal(256);
                expect(jwtProps['serverCapabilities']['ul']).to.equal(12);
            });
            cy.get('#stage').find('.tile').should('have.length', 9);
        });

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
        });
    })
});