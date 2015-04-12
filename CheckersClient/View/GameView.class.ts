module View {
    /*
     * Generyczny interfejs obserwatora modelu
     */
    export interface ModelObserver<T> {
        notify(sender: T);
    }

    /*
     * Klasa reprezentująca widok gry
     */
    export class GameView extends View {
        /*
         * Stan przejść synchronicznych
         */
        private transitionQueue: Transition[] = [];         // kolejka przejść synchronicznych
        private onTransitionEndHandler: () => void = null;  // handler zdarzenia zakończenia przejść
        private currentTransition: Transition = null;       // aktualnie wykonywane przejście
        private transitionPlayed: boolean = false;          // czy przejścia są aktualnie wykonywane?
        /*
         * Obiekty widoku
         */
        private board: Board;
        private background: PIXI.Sprite;
        // ...
        
        /*
         * Konstruktor widoku gry
         */
        constructor() {
            super();
            this.background = new PIXI.Sprite(
                TextureManager.getInstance().getTexture("gameBackground"));
            this.background.position = new PIXI.Point(0, 0);
            this.getStage().addChild(this.background);
            this.board = new Board(this);
        }

        /*
         * Metoda wywoływana przy rysowaniu kolejnej klatki
         */
        public update() {
            if (this.currentTransition)
                this.currentTransition.update();
            this.board.getSprite().rotation += 0.01;
            // ...
        }

        /*
         * Metoda wywoływana przy dezaktywacji tego widoku
         */
        public pause(): boolean {
            if (!super.pause())
                return false;
            // ...
            return true;
        }

        /*
         * Metoda wywoływana przy aktywacji tego widoku
         */
        public resume() {
            if (!super.resume())
                return false;
            // ...
            return true;
        }

        /*
         * Rejestracja przejścia synchronicznego
         */
        public addTransition(transition: Transition) {
            this.transitionQueue.push(transition);
        }

        /*
         * Wykonanie następnego w kolejce przejścia
         */
        public nextTransition() {
            if (this.transitionQueue.length === 0) {
                this.currentTransition = null;
                this.transitionPlayed = false;
                if (this.onTransitionEndHandler) {
                    this.onTransitionEndHandler();
                    this.onTransitionEndHandler = null;
                }
            }
            else {
                this.currentTransition = this.transitionQueue.shift();
                this.currentTransition.play();
            }
        }

        /*
         * Uruchomienie kolejki przejść
         */
        public playTransition() {
            if (!this.transitionPlayed) {
                this.transitionPlayed = true;
                this.nextTransition();
            }
        }

        /*
         * Rejestracja handlera, który wykona się, gdy kolejka przejść stanie się pusta
         */
        public onTransitionEnd(handler: () => void) {
            this.onTransitionEndHandler = handler;
        }
    }
} 