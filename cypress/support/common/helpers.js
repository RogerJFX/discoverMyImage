import {startPage} from "./bridge";

Cypress.Commands.add('login', (email, pass) => {
    window.sessionStorage.clear();
    window.localStorage.clear();
    cy.visit(startPage);
    cy.noOverlays('.body-header > .nav-icon').click();
    cy.get('#loginButton').click();
    cy.menuVisible('#loginModal').should('contain', 'Login');
    cy.get('#loginEmail').type(email);
    cy.get('#loginPassword').type(pass);
    return cy.get('#loginSubmit').click();
});