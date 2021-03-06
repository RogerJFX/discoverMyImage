import {startPage} from "../support/common/bridge";
/*
    This is a bit odd. We use screen sizes in production code, not window size.

    Cypress cannot simulate screen of course. So testing CSS media queries does not work here. And we have to
    stub method "getScreenDimensions".
 */
describe('Devices with different screens', () => {

    const taskResponse = '001110012220021221';
    before(() => {
        cy.viewport(1000, 800);
    });

    after(() => {
        cy.viewport(1000, 800);
    });

    // not perfectly working. See comment on top.
    it('proper mobile detection first (user rotating his device)', () => {
        let recommendedDimensionsStub;
        function doCheck() {
            recommendedDimensionsStub.call().then(result => {
                expect(result['rotatable']).to.true
            })
        }
        cy.viewport('ipad-2');
        cy.visit(startPage, {
            onLoad(win) {
                cy.stub(win.$disc.deviceDetection, 'getScreenDimensions').returns([1024, 768]);
                recommendedDimensionsStub = cy.spy(win.$disc.deviceDetection, 'getRecommendedDimensions');
            }
        }).then(_ => {
            cy.wait(400); // There is a timeout in prod (mobiles are a bit slow when rotating)
            doCheck();
            cy.viewport('ipad-2', 'landscape');
            cy.wait(400); // ...
            doCheck();
            cy.viewport('ipad-2', 'portrait');
            cy.wait(400); // ...
            doCheck();
        });
    });

    it('desktop', () => {
        cy.viewport(1000, 800);
        cy.visit(startPage);
        cy.loadSquareExampleImageStub(taskResponse, _ => check(240));
    });

    it('iPad portrait', () => {
        cy.viewport('ipad-2');
        loadWithDims([768, 1024]).then(_ => {
            cy.loadSquareExampleImageStub(taskResponse, _ => check(196));
        });
    });

    it('iPad landscape', () => {
        cy.viewport('ipad-2', 'landscape');
        loadWithDims([1024, 768]).then(_ => {
            cy.loadSquareExampleImageStub(taskResponse, _ => check(196));
        });
    });

    it('iPhone6p portrait', () => {
        cy.viewport('iphone-6+');
        loadWithDims([414, 736]).then(_ => {
            cy.loadSquareExampleImageStub(taskResponse, _ => check(126));
        });
    });

    it('iPhone6p landscape', () => {
        cy.viewport('iphone-6+', 'landscape');
        loadWithDims([736, 414]).then(_ => {
            cy.loadSquareExampleImageStub(taskResponse, _ => check(126));
        });
    });

    it('360x640 portrait', () => {
        cy.viewport(360, 640);
        loadWithDims([360, 640]).then(_ => {
            cy.loadSquareExampleImageStub(taskResponse, _ => check(107));
        });
    });

    it('360x640 landscape (640x360)', () => {
        cy.viewport(640, 360);
        loadWithDims([640, 360]).then(_ => {
            cy.loadSquareExampleImageStub(taskResponse, _ => check(107));
        });
    });

    function loadWithDims(dims) {
        return cy.visit(startPage, {
            onLoad(win) {
                const stub = cy.stub(win.$disc.deviceDetection, 'getScreenDimensions').returns(dims);
                win.$disc.deviceDetection.estimate(() => {}, true);
                expect(stub).to.be.callCount(1)
            }
        })
    }

    function check(expTileDim) {
        cy.get('#stage').find('.tile').then(tiles => {
            const tile = [...tiles][0];
            expect(tile.offsetWidth).to.equal(expTileDim);
        });
    }
});