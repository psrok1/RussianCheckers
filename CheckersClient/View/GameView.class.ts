module View {
    export interface ModelObserver<T> {
        notify(sender: T);
    }

    export class GameView extends View {
        private transitionQueue: Transition[] = [];
        private onTransitionEndHandler: () => void = null;
        private currentTransition: Transition = null;
        // ...
        
        constructor() {
            super();
            // ...
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
            return true;
        }

        public addTransition(transition: Transition) {
            this.transitionQueue.push(transition);
        }

        public playTransition() {
            if (this.transitionQueue.length === 0) {
                this.currentTransition = null;
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

        public onTransitionEnd(handler: () => void) {
            this.onTransitionEndHandler = handler;
        }
    }
} 