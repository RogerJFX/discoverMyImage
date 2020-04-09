import {parseJWT, UserCredentials, checkSessionStorage, CheckOperations} from "../support/utils";
import {storageKeys} from "../support/bridge"
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
        cy.get('body')
            .then(_ => checkSessionStorage([[storageKeys.KEY_NICK, null, CheckOperations.beNull]]));
        cy.server();
        cy.route('POST', '**/login.php**').as('login');
        cy.login();
        cy.wait('@login').then(xhr => {
            cy.wrap(xhr).its('status').should('eq', 200);
            cy.wrap(xhr).its('response.headers.jwt').then(jwt => {
                const jwtProps = parseJWT(jwt);
                expect(jwtProps['identity']).to.equal(UserCredentials.email);
            });
            cy.get('#commonAlertModal').should('be.visible').should('contain', UserCredentials.nickname)
                .then(_ => checkSessionStorage([[storageKeys.KEY_NICK, UserCredentials.nickname, CheckOperations.equals]]));
        });
    });

});