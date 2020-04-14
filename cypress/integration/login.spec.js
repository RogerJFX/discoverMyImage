import {parseJWT, checkSessionStorage, CheckOperations, checkForm} from "../support/common/utils";
import {storageKeys, startPage, routes, UserCredentials} from "../support/common/bridge"

describe('Login', () => {

    it('should fail due to wrong password', () => {
        cy.server();
        cy.route(routes.login.method, routes.login.url).as('login');
        cy.login(UserCredentials.email, 'Hund123');
        cy.wait('@login').then(xhr => {
            cy.wrap(xhr).its('status').should('eq', 401);
            cy.get('#commonAlertModal').should('be.visible').should('contain', 'Keine Übereinstimmung');
       });
    });

    it('should refresh guest token', () => {
        let tokenExpStub, tokenGuardSpy, loginSpy;

        cy.visit(startPage, {
            onLoad(win) {
                tokenExpStub = cy.stub(win.$disc.storage, 'getTokenExp').returns(new Date().getTime() - 10000000);
                tokenGuardSpy = cy.spy(win.$disc.settingsHandler, 'guardToken');
                loginSpy = cy.spy(win.$disc.xhrHandler, 'login');
            }
        });
        cy.loadSquareExampleImageReal(_ => { // and get the token
            tokenGuardSpy.call();
            expect(tokenExpStub).to.be.called
            expect(loginSpy).to.be.calledWith({email: 'John', pass: 'Doe'});
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

    it('should request user to login again after session expired', () => {
        let tokenExpStub, tokenGuardSpy;

        cy.visit(startPage, {
            onLoad(win) {
                tokenExpStub = cy.stub(win.$disc.storage, 'getTokenExp').returns(new Date().getTime() - 1000000);
                tokenGuardSpy = cy.spy(win.$disc.settingsHandler, 'guardToken');
            }
        });
        cy.loadSquareExampleImageReal(_ => { // not really needed
            tokenGuardSpy.call();
            expect(tokenExpStub).to.be.called
            cy.get('#commonAlertModal')
                .should('have.css', 'opacity', '1')
                .should('be.visible')
                .should('contain', 'Deine Sitzung ist abgelaufen');
            cy.get('#alertOk').click();
            cy.get('#loginModal')
                .should('have.css', 'opacity', '1')
                .should('be.visible');
        });
    });

});

describe('Forgot password', () => {
    const wrongMail = 'this is not an mail address';
    const notKnownMail = 'frankenstein@crazything.de';
    const okMail = 'superman@crazything.de';

    it('form should validate wrong mail address away', () => {
        navigateToResetPassword();
        cy.menuVisible('#resetPassModal').should('contain', 'Passwort vergessen');
        cy.get('#resetPassModal').find('input').should('have.length', 1);
        cy.get('#resetEmail').clear().type(`${wrongMail}{Enter}`);
        cy.get('#resetEmail').should('have.class', 'wrongInput');
    });

    it('Email not found on real server', () => {
        cy.server();
        cy.route(routes.resetPassword.method, routes.resetPassword.url).as('resetPass');
        navigateToResetPassword();
        cy.get('#resetEmail').clear().type(`${notKnownMail}{Enter}`);
        cy.wait('@resetPass').then(xhr => {
            cy.wrap(xhr).its('status').should('eq', 400); // Why not 404?
        })
    });

    it('Email correct, passes (stubbed)', () => {
        cy.server();
        cy.route({
            method: routes.resetPassword.method,
            url:  routes.resetPassword.url,
            response: [],
            status: 200
        }).as('resetPassStub');
        navigateToResetPassword();
        cy.get('#resetEmail').clear().type(`${okMail}{Enter}`);
        cy.wait('@resetPassStub').then(xhr => {
            cy.wrap(xhr).its('status').should('eq', 200);
            cy.get('#commonAlertModal').should('contain', 'Eine Email ist unterwegs');
        })
    });

    function navigateToResetPassword() {
        window.sessionStorage.clear();
        window.localStorage.clear();
        cy.visit(startPage);
        cy.noOverlays('.body-header > .nav-icon').click();
        cy.get('#loginButton').click();
        cy.menuVisible('#loginModal').should('contain', 'Login');
        cy.menuClickWhenVisible('#resetPassButton');
    }

});



describe('Registration', () => {

    const wrongRegisterData = [
        {
            data: ['wrongEmail', '-', '-'],
            check: 7
        },
        {
            data: ['robert@crazything.de', 'Roger', '-'],
            check: 4
        },
        {
            data: ['robert@crazything.de', '-', 'Katze123'],
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

        cy.get('#registerEmail').clear().type('robert@crazything.de');
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
        cy.menuClickWhenVisible('#registerButton');
    }


});