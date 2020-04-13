import {routes, startPage} from "../support/common/bridge";

describe('Images from HD', () => {
    it('should be loaded: raw photograph should be rotated by us correctly', () => {
        const fixturePath = 'img_raw_rotated.jpg';
        const mimeType = 'image/jpg';
        const filename = 'img_raw_rotated.jpg';

        cy.visit(startPage);
        cy.noOverlays('.body-header > .nav-icon').click()
        cy.menuClickWhenVisible('#puzzleButton');
        cy.menuClickWhenVisible('#ownImageSelect');
        cy.get('input[type=file]')
            .eq(0)
            .then(subject => {
                cy.fixture(fixturePath, 'base64').then(front => {
                    Cypress.Blob.base64StringToBlob(front, mimeType).then(blob => {
                        const testFile = new File([blob], filename, {type: mimeType});
                        const dataTransfer = new DataTransfer();
                        const fileInput = subject[0];

                        dataTransfer.items.add(testFile);
                        fileInput.files = dataTransfer.files;
                        cy.wrap(subject).trigger('change', {force: true}); // ok, lets force this.
                    });
                });
            });
        cy.wait(3000); // Hm, how to get rid of this...
        cy.get('#stage').should('have.css', 'background-image');
        cy.get('#stage').then(node => {
           expect(node.height()).to.greaterThan(node.width());
        });
        checkResolveTask();
    });

    function checkResolveTask() {
        cy.server();
        cy.route(routes.resolve.method, routes.resolve.url).as('resolve');
        cy.noOverlays('.body-header > .nav-icon').click();
        cy.get('#solveButton').click();
        cy.menuClickWhenVisible('#promptOk');
        cy.wait('@resolve').then(xhr => {
            // Only for coverage at this moment.
            // just stub a method to have been called.
            console.log(xhr);
        }).then(_ => cy.menuClickWhenVisible('#alertOk'));
    }
});