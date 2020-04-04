describe('Menu', () => {

    const startPage = '/index.devel.html?lang=de';

    it('successfully switches language', () => {
        cy.visit(startPage);
        cy.get('.body-header > .nav-icon').click();
        cy.get('#puzzleButton').click();
        cy.get('#modalLayer').should('be.visible').should('contain', 'Mein Puzzle');
        cy.menuVisible('#puzzleModal');
        cy.get('#puzzleModal').should('be.visible');
        cy.get('#puzzleModal > .header > div > .close > div').should('be.visible').click();
        cy.menuClickWhenVisible('#switchLangButton');
        cy.menuClickWhenVisible('#langEn');
        cy.get('.body-header > .nav-icon').should('be.visible').click();
        cy.menuClickWhenVisible('#puzzleButton');
        cy.get('#modalLayer').should('have.css', 'opacity', '1').should('contain', 'My puzzle');
    });

});