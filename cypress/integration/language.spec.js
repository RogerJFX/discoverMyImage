describe('The Home Page', () => {
    it('successfully switches language', () => {
        cy.visit('/index.devel.html'); // change URL to match your dev URL
        cy.get('.body-header > .nav-icon').click();
        cy.get('#puzzleButton').click();
        cy.get('#modalLayer').should('contain', 'Mein Puzzle');
        cy.wait(300);
        cy.get('#puzzleModal > .header > div > .close > div').click();
        cy.wait(300);
        cy.get('#switchLangButton').click();
        cy.wait(300);
        cy.get('#langEn').click();
        cy.get('.body-header > .nav-icon').click();
        cy.get('#puzzleButton').click();
        cy.get('#modalLayer').should('contain', 'My puzzle');
    })
});