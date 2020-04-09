import {UserCredentials} from "./utils";

Cypress.Commands.add('login', (wrong) => {
    const startPage = '/index.devel.html';
    const email = UserCredentials.email;
    const pass = wrong ? 'Hund123' : UserCredentials.pass;
    window.sessionStorage.clear();
    window.localStorage.clear();
    cy.visit(startPage);
    cy.noOverlays('.body-header > .nav-icon').click();
    cy.get('#loginButton').click();
    // cy.get('#loginModal').should('be.visible').should('contain', 'Login');
    cy.menuVisible('#loginModal').should('contain', 'Login');
    cy.get('#loginEmail').type(email);
    cy.get('#loginPassword').type(pass);
    return cy.get('#loginSubmit').click();
});