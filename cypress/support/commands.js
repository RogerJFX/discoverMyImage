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
