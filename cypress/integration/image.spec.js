import {routes, startPage} from "../support/common/bridge";

// Can't help. We need some wait(millis) here, since these tests are beyond normal scope.
describe('Images from HD', () => {

    let _window;

    it('should not be loaded due to no image file at all', () => {
        loadImage('noImage.json', 'image/jpeg', 'someName');
        cy.wait(1000); // Hm, how to get rid of this...
        cy.get('#commonAlertModal').should('be.visible').should('contain', 'kein Bild');
    });

    it('should be loaded: raw photograph should be rotated by us correctly', () => {
        loadImage('img_raw_rotated.jpg', 'image/jpeg', 'someName');
        cy.wait(1000); // Hm, how to get rid of this...
        cy.get('#stage').should('have.css', 'background-image');
        cy.get('#stage').then(node => {
            expect(node.height()).to.greaterThan(node.width());
        });
        checkResolveTask().then(_ => {
            cy.wait(1000);
            checkSuccess();
        });

    });

    function loadImage(fixturePath, mimeType, filename) {
        cy.visit(startPage, {
            onLoad(win) {
                _window = win;
            }
        });
        cy.noOverlays('.body-header > .nav-icon').click()
        cy.menuClickWhenVisible('#puzzleButton');
        cy.menuClickWhenVisible('#ownImageSelect');
        cy.get('#files')
            .then(subject => {
                cy.fixture(fixturePath, 'base64').then(front => {
                    Cypress.Blob.base64StringToBlob(front, mimeType).then(blob => {
                        const testFile = new File([blob], filename, {type: mimeType});
                        const dataTransfer = new DataTransfer();
                        const fileInput = subject[0];

                        dataTransfer.items.add(testFile);
                        fileInput.files = dataTransfer.files;
                    });
                }).then(_ => {
                    cy.wait(300); // Firefox (and Electron) want's this. Don't ask me why. Maybe they are buffering.
                    cy.wrap(subject).trigger('change', {force: true}); // we should force here.
                });
            });
    }

    function checkResolveTask() {
        cy.server();
        cy.route(routes.resolve.method, routes.resolve.url).as('resolve');
        cy.noOverlays('.body-header > .nav-icon').click();
        cy.get('#solveButton').click();
        cy.menuClickWhenVisible('#promptOk');
        return cy.wait('@resolve').then(xhr => {
            // Only for coverage at this moment.
            // just stub a method to have been called.
            console.log(xhr);
        }).then(_ => cy.menuClickWhenVisible('#alertOk'));
    }

    function checkSuccess() {
        function doCheck(res) {
            expect(res['freeSteps']).to.equal(12);
            expect(res['rewardPoints']).to.equal(15);
        }
        function doFail(res) {
            throw new Error(`onErrorFunction was called passing ${res}`);
        }
        const historySpy = cy.spy(_window.$disc.history, 'add');
        historySpy.call(this, [1,3]);
        historySpy.call(this, [2,3]);
        const grid = cy.spy(_window.$disc.settingsHandler, 'getLastGrid').call();
        expect(grid[0]).to.equal(3);
        expect(grid[1]).to.equal(4);
        const xhrStub = cy.stub(_window.$disc.xhrHandler, 'postJsonProperties').resolves({res: 'Stubbed', freeSteps: 12, rewardPoints: 15});
        cy.spy(_window.$disc.ai, 'sendSuccess').call(this, doCheck, doFail);
        expect(xhrStub).to.be.callCount(1)
    }
});