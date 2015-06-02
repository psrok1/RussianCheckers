/**
 * Moduł dla klas widoku
 * @preferred
 */
module View {
    /**
     * Abstrakcyjna klasa stanowiąca bazę dla klas widoków
     */
    export /*abstract*/ class View {
        /** Czy widok jest wstrzymany? */
        private paused: boolean = true;
        /** Scena renderera dla danego widoku */
        protected stage: PIXI.Stage;

        /**
         * Konstruktor widoku
         */
        constructor() {
            this.stage = new PIXI.Stage(0);
        }
        /**
         * Metoda wyzwalana przez menedżer widoków przy rysowaniu kolejnej klatki
         */
        public update() { }
        /**
         * Metoda wyzwalana przez menedżer przy wstrzymaniu widoku (po przełączeniu na inny widok)
         */
        public pause(): boolean {
            if (!this.paused) {
                this.paused = true;
                return true;
            } else
                return false;
        }
        /**
         * Metoda wyzwalana przez menedżer przy aktywacji widoku (po przełączeniu na ten widok)
         */
        public resume(): boolean {
            if (this.paused) {
                this.paused = false;
                // PIXI: Lost interactivity fix
                (<any>this.stage)._interactiveEventsAdded = false;
                return true;
            } else
                return false;
        }
        /**
         * Metoda zwracająca, czy widok jest wstrzymany
         * @param Zwraca true, jeśli jest wstrzymany
         */
        public isPaused(): boolean {
            return this.paused;
        }

        /**
         * Metoda zwracająca powiązaną z widokiem scenę renderera
         * @param Obiekt sceny
         */
        public getStage(): PIXI.Stage {
            return this.stage;
        }
    }
} 