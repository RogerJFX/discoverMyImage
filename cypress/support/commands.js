import {UserCredentials} from "./utils";

Cypress.Commands.add('noOverlays', (selector) => {
    cy.get('#spinnerBG')
        .should('have.css', 'opacity', '0')
        .should('not.be.visible');
    return cy.get(selector);
});

Cypress.Commands.add('menuVisible', (selector) => {
    cy.noOverlays(selector).parent()
        .should('have.class', 'transitionable')
        .should('be.visible')
        .should('have.css', 'opacity', '1');
    return cy.get(selector).should('be.visible').should('have.css', 'opacity', '1');
});

Cypress.Commands.add('menuClickWhenVisible', (selector) => {
    cy.noOverlays(selector).parent()
        .should('have.class', 'transitionable')
        .should('be.visible')
        .should('have.css', 'opacity', '1');
    return cy.get(selector).should('be.visible').should('have.css', 'opacity', '1').click();
});

Cypress.Commands.add('closeMenuView', (selector) => {
    cy.noOverlays(`${selector} div.close > div`).click();
    return cy.get(selector)
        .should('have.class', 'transitionable')
        // .should('not.be.visible')
        .should('have.css', 'opacity', '0')
        .should('not.be.visible');
});

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