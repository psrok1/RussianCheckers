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
        // ...
        
        constructor() {
            super();
            // Test GameView & Transition -----
            for (var i = 0; i < 20; i++) {
                var circle = new PIXI.Graphics();
                circle.beginFill(0x808080 + (Math.random() * 0x7F7F7F));
                circle.drawCircle(0, 0, 32);
                circle.endFill();
                circle.position.set(384, 284);
                this.stage.addChild(circle);

                this.addTransition(new MovementTransition(
                    this,
                    circle,
                    new PIXI.Point(
                        Math.random() * 700 + 32,
                        Math.random() * 500 + 32
                        ), 10));
                this.addTransition(new RemoveTransition(this, circle));
            }
        }

        public update() {
            if (this.currentTransition)
                this.currentTransition.update();
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
            // Test GameView & Transition
            this.playTransition();
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