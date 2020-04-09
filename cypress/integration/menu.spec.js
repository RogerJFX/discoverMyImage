import {storageKeys} from '../support/bridge';
import {checkLocalStorage,CheckOperations} from "../support/utils";

describe('Menu', () => {

    const startPage = '/index.devel.html?lang=de';

    it('successfully switches language', () => {
        cy.visit(startPage);
        cy.noOverlays('.body-header > .nav-icon').click();
        cy.get('#puzzleButton').click();
        cy.menuVisible('#puzzleModal')
            .should('contain', 'Mein Puzzle')
            .then(_ => checkLocalStorage([[storageKeys.KEY_LANG, 'de', CheckOperations.equals]]));
        cy.closeMenuView('#puzzleModal');
        cy.menuClickWhenVisible('#switchLangButton');
        cy.menuClickWhenVisible('#langEn');
        cy.get('.body-header > .nav-icon').should('be.visible').click();
        cy.menuClickWhenVisible('#puzzleButton');
        cy.get('#modalLayer').should('have.css', 'opacity', '1')
            .should('contain', 'My puzzle')
            .then(_ => checkLocalStorage([[storageKeys.KEY_LANG, 'en', CheckOperations.equals]]));
    });

});