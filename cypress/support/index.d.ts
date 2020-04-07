/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable<Subject> {

        /**
         * Checks, if all spinners or other overlays have disappeared.
         *
         * @param selector DOM selector
         */
        noOverlays(selector: string): Chainable<Subject>;
        /**
         * Checks visibility including opacity.
         *
         * @param selector DOM selector
         */
        menuVisible(selector: string): Chainable<Subject>;

        /**
         * Waits for visibility (including parent) and clicks after the element appears.
         *
         * @param selector DOM selector
         */
        menuClickWhenVisible(selector: string): Chainable<Subject>;

        /**
         * Closes a menu view and waits until the view has disappeared.
         *
         * @param selector DOM selector
         */
        closeMenuView(selector: string): Chainable<Subject>;

        /**
         * Login.
         *
         * @param wrong Set to true, if the password should be wrong
         */
        login(wrong?: boolean): Chainable<Subject>;
    }
}