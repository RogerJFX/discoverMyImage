import {UserCredentials} from "./utils";

Cypress.Commands.add('menuVisible', (selector) => {
    return cy.get(selector).parent()
        .should('have.class', 'transitionable')
        .should('be.visible')
        .should('have.css', 'opacity', '1');
});

Cypress.Commands.add('menuClickWhenVisible', (selector) => {
    cy.get(selector).parent()
        .should('have.class', 'transitionable')
        .should('be.visible')
        .should('have.css', 'opacity', '1');
    return cy.get(selector).should('be.visible').click();
});

Cypress.Commands.add('login', (wrong) => {
    const startPage = '/index.devel.html';
    const email = UserCredentials.email;
    const pass = wrong ? 'Hund123' : UserCredentials.pass;
    window.sessionStorage.clear();
    window.localStorage.clear();
    cy.visit(startPage);
    cy.get('.body-header > .nav-icon').click();
    cy.get('#loginButton').click();
    cy.get('#loginModal').should('be.visible').should('contain', 'Login');
    cy.menuVisible('#loginModal');
    cy.get('#loginEmail').type(email);
    cy.get('#loginPassword').type(pass);
    return cy.get('#loginSubmit').click();
});