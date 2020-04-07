describe('Menu', () => {

    const startPage = '/index.devel.html?lang=de';

    it('successfully switches language', () => {
        cy.visit(startPage);
        cy.noOverlays('.body-header > .nav-icon').click();
        cy.get('#puzzleButton').click();
        // cy.menuVisible('#modalLayer').should('contain', 'Mein Puzzle');
        cy.menuVisible('#puzzleModal').should('contain', 'Mein Puzzle');
        //cy.get('#puzzleModal').should('be.visible');
        // cy.get('#puzzleModal > .header > div > .close > div').should('be.visible').click();
        cy.closeMenuView('#puzzleModal');
        // cy.wait(299);
        cy.menuClickWhenVisible('#switchLangButton');
        cy.menuClickWhenVisible('#langEn');
        cy.get('.body-header > .nav-icon').should('be.visible').click();
        cy.menuClickWhenVisible('#puzzleButton');
        cy.get('#modalLayer').should('have.css', 'opacity', '1').should('contain', 'My puzzle');
    });

});