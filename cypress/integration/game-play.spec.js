import {startPage, routes} from "../support/common/bridge";

describe('Game play', () => {

    before(() => {
        window.sessionStorage.clear();
        window.localStorage.clear();
    });

    beforeEach(() => {
        cy.visit(startPage);
    });

    it('should drag tiles', () => {
        cy.loadSquareExampleImageStub('001110012220021221', drag);
    });

    it('should be done to the end by clicking tiles(0 rewardPoints, 2 freeSteps)', () => {
        cy.loadSquareExampleImageStub('001110012220021221', _ => play({
            rewardPoints: 0,
            freeSteps: 2,
            rewardPointMsg: '0 Punkte',
            freeStepsMsg: '2 freie Lösungsschritte'
        }));
    });

    it('should be done to the end by clicking tiles(2 rewardPoints, 0 freeSteps)', () => {
        cy.loadSquareExampleImageStub('001110012220021221', _ => play({
            rewardPoints: 2,
            freeSteps: 0,
            rewardPointMsg: '2 Punkte',
            freeStepsMsg: '0 freie Lösungsschritte'
        }));
    });

    it('should be done to the end by clicking tiles(1 rewardPoints, 1 freeSteps)', () => {
        cy.loadSquareExampleImageStub('001110012220021221', _ => play({
            rewardPoints: 1,
            freeSteps: 1,
            rewardPointMsg: '1 Punkt',
            freeStepsMsg: '1 freier Lösungsschritt'
        }));
    });

    function drag() {
        cy.get('#stage').find('.tile').then(tiles => {
            const tile = [...tiles][4];
            moveTileAndCheck(tile, (tile) => {
                cy.wrap(tile)
                    .trigger('mousedown', { which: 1 })
                    .trigger('mousemove',  { clientX: 250, clientY: 220 })
                    .trigger('mouseup', { force: true });
            }, false, true).then(_ => {
                moveTileAndCheck(tile, (tile) => {
                    cy.wrap(tile)
                        .trigger('mousedown', { which: 1 })
                        .trigger('mousemove',  { clientX: 250, clientY: 250 })
                        .trigger('mouseup', { force: true });
                }, true, true)
            }).then(_ => moveTileAndCheck(tile, userClickAction, true, true));
        });
    }

    function play(props) {
        cy.server();
        // Must be stubbed, because otherwise server will respond 'unauthorized' because no task in JWT
        cy.route({
            method: routes.success.method,
            url: routes.success.url,
            response: {res: 'Should not work', freeSteps: props.freeSteps, rewardPoints: props.rewardPoints}
        }).as('successStub');

        cy.get('#stage').find('.tile').then(tiles => {
            const tileSet = [...tiles];
            moveTileAndCheck(tileSet[0], userClickAction, false, false);
            moveTileAndCheck(tileSet[4], userClickAction, true, true).then(_ => {
                moveTileAndCheck(tileSet[1], userClickAction, true, false);
            }).then(_ => {
                moveTileAndCheck(tileSet[2], userClickAction, true, true);
            }).then(_ => {
                moveTileAndCheck(tileSet[5], userClickAction, true, true);
            });

            cy.wait('@successStub').then(xhr => {
                cy.wrap(xhr).its('response.body.res').should('equal', 'Should not work');
            })

            cy.get('#stage').should('be.empty');
            cy.get('#commonAlertModal').should('contain', props.rewardPointMsg).should('contain', props.freeStepsMsg)
        });
    }

    function moveTileAndCheck(tile, actionFn, moved, vertical) {
        const startX = tile.style.left;
        const startY = tile.style.top;
        actionFn(tile);
        if(moved) {
            return vertical ?
                cy.wrap(tile).should('have.css', 'left', startX).should('not.have.css', 'top', startY) :
                cy.wrap(tile).should('not.have.css', 'left', startX).should('have.css', 'top', startY);
        } else {
            return cy.wrap(tile).should('have.css', 'left', startX).should('have.css', 'top', startY);
        }
    }

    function userClickAction(tile) {
        return cy.wait(200).wrap(tile).click();
    }

});