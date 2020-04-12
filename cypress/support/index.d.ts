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
         * @param email Email
         * @param pass Pass
         */
        login(email: string, pass: string): Chainable<Subject>;

        /**
         * Loads an example image with given task and calls a function afterwards.
         *
         * @param taskResponse Response, the stub service should deliver
         * @param innerFn Function to be called, when image and task are loaded.
         */
        loadSquareExampleImage(taskResponse: string, innerFn: Function): void;
    }
}