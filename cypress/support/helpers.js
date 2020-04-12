import {routes, startPage} from "./common/bridge";

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

Cypress.Commands.add('loadSquareExampleImage', (taskResponse, innerFn) => {
    cy.noOverlays('.body-header > .nav-icon').click();
    cy.get('#exampleImageSelect').click();
    cy.server();
    cy.route({
        method: routes.task.method,
        url: routes.task.url,
        response: {response: taskResponse}
    }).as('taskStub');

    cy.menuClickWhenVisible('#exampleImageButton1');

    cy.wait('@taskStub').then((xhr) => {
        cy.get('#stage').find('.tile').should('have.length', 9)
            .then(_ => {
                innerFn();
            });
    });
});