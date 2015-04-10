module View {
    /*
     * Klasa reprezentująca widok menu gry
     */
    export class MenuView extends View {
        // ...
        
        constructor() {
            super();
            // ...
        }

        public update() {
            // ...
        }

        public pause(): boolean {
            if (!super.pause())
                return false;
            // ...
            return true;
        }

        public resume() {
            if (!super.resume())
                return false;
            // ...
            return true;
        }
    }
} 