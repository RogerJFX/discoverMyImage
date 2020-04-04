import {parseJWT, UserCredentials} from "../support/utils";

describe('User should', () => {

    it('unsuccessfully login', () => {
        cy.server();
        cy.route('POST', '**/login.php**').as('login');
        cy.login(true);
        cy.wait('@login').then(xhr => {
            cy.wrap(xhr).its('status').should('eq', 401);
            cy.get('#commonAlertModal').should('be.visible').should('contain', 'Keine Übereinstimmung');
       });
    });

    it('successfully login', () => {
        cy.server();
        cy.route('POST', '**/login.php**').as('login');
        cy.login();
        cy.wait('@login').then(xhr => {
            cy.wrap(xhr).its('status').should('eq', 200);
            cy.wrap(xhr).its('response.headers.jwt').then(jwt => {
                const jwtProps = parseJWT(jwt);
                expect(jwtProps['identity']).to.equal(UserCredentials.email);
            });
            cy.get('#commonAlertModal').should('be.visible').should('contain', UserCredentials.nickname);
        });
    });

});