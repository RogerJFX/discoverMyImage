import {parseJWT, checkSessionStorage, CheckOperations, checkForm} from "../support/common/utils";
import {storageKeys, startPage, routes, UserCredentials} from "../support/common/bridge"

describe('Login', () => {

    it('should fail', () => {
        cy.server();
        cy.route(routes.login.method, routes.login.url).as('login');
        cy.login(UserCredentials.email, 'Hund123');
        cy.wait('@login').then(xhr => {
            cy.wrap(xhr).its('status').should('eq', 401);
            cy.get('#commonAlertModal').should('be.visible').should('contain', 'Keine Übereinstimmung');
       });
    });

    it('should succeed', () => {
        cy.get('body')
            .then(_ => checkSessionStorage([[storageKeys.KEY_NICK, null, CheckOperations.beNull]]));
        cy.server();
        cy.route(routes.login.method, routes.login.url).as('login');
        cy.login(UserCredentials.email, UserCredentials.pass);
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



describe('Registration', () => {

    const wrongRegisterData = [
        {
            data: ['wrongEmail', '-', '-'],
            check: 7
        },
        {
            data: ['roger@crazything.de', 'Roger', '-'],
            check: 4
        },
        {
            data: ['roger@crazything.de', '-', 'Katze123'],
            check: 2
        },
        {
            data: ['wrongEmail', 'Roger', 'Katze123'],
            check: 1
        }
    ];

    it('should fail with incorrect input data', () => {
        navigateToRegistration();

        cy.menuVisible('#registerModal').should('contain', 'Registrieren');
        cy.get('#registerModal').find('input').should('have.length', 3);
        wrongRegisterData.forEach(data => {
            checkForm(data.data, data.check, '#registerModal', '#registerSubmit');
        })
    });

    it('should work with correct input data', () => {
        cy.server();
        cy.route({
            method: routes.register.method,
            url: routes.register.url,
            response: []
        }).as('registerStub');

        navigateToRegistration();

        cy.get('#registerEmail').clear().type('roger@crazything.de');
        cy.get('#registerNickname').clear().type('Roger');
        cy.get('#registerPassword').clear().type('Hustensaft123');
        cy.get('#registerSubmit').click();
        cy.wait('@registerStub').then(xhr => {
            cy.wrap(xhr).its('status').should('eq', 200);
            cy.get('#commonAlertModal').should('be.visible').should('contain', 'Erfolg!');
        })
    });

    function navigateToRegistration() {
        window.sessionStorage.clear();
        window.localStorage.clear();
        cy.visit(startPage);
        cy.noOverlays('.body-header > .nav-icon').click();
        cy.get('#loginButton').click();
        cy.menuVisible('#loginModal').should('contain', 'Login');
        cy.menuClickWhenVisible('#registerButton').click();
    }


});