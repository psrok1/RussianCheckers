module View {
    /*
     * Abstrakcyjna klasa reprezentujaca akcje widoku, ktore zostaną wykonane sekwencyjnie
     */
    export /*abstract*/ class Transition {
        protected view: GameView;

        constructor(view: GameView) {
            this.view = view;
        }

        public update() { }
        public play() { }
    }
    
    /*
     * Akcja przemieszczenia obiektu widoku do danego punktu
     */
    export class MovementTransition extends Transition {
        private object: PIXI.DisplayObject;
        private target: PIXI.Point;
        private speed: number;

        private xi: number;
        private yi: number;
        private dx: number;
        private dy: number;
        private d:  number;
        private ai: number;
        private bi: number;

        constructor(view: GameView, object: PIXI.DisplayObject, target: PIXI.Point, speed: number) {
            super(view);
            this.object = object;
            this.target = target;
            this.speed = speed;

            this.dx = target.x - object.position.x;
            this.dy = target.y - object.position.y;
            this.xi = (this.dx < 0 ? -1 : 1);
            this.yi = (this.dy < 0 ? -1 : 1);
            this.dx = Math.abs(this.dx);
            this.dy = Math.abs(this.dy);

            this.ai = -Math.abs(this.dy - this.dx) * 2;
            this.bi = Math.min(this.dx, this.dy) * 2;
            this.d = this.bi - Math.max(this.dx, this.dy);
        }

        private endCondition(): boolean {
            if (this.dx > this.dy)
                return Math.floor(this.object.position.x) == Math.floor(this.target.x);
            else
                return Math.floor(this.object.position.y) == Math.floor(this.target.y);
        }

        public update() {
            for (var i = 0; i < this.speed; i++) {
                if (this.d >= 0) {
                    this.object.position.x += this.xi;
                    this.object.position.y += this.yi;
                    this.d += this.ai;
                } else {
                    if (this.dx > this.dy)
                        this.object.position.x += this.xi;
                    else
                        this.object.position.y += this.yi;
                    this.d += this.bi;
                }
                if (this.endCondition()) {
                    this.view.nextTransition();
                    break;
                }
            }
        }
    }

    /*
     * Klasa reprezentująca sekwencyjne akcje natychmiastowe
     */
    export class ImmediateTransition extends Transition {
        private method: any;

        constructor(view: GameView, method: any) {
            super(view);
            this.method = method;
        }

        public play() {
            this.method();
            this.view.nextTransition();
        }
    }

    /*
     * Natychmiastowa akcja zmiany tekstury
     */
    export class SetTextureTransition extends ImmediateTransition {
        constructor(view: GameView, object: PIXI.Sprite, texture: PIXI.Texture) {
            super(view, object.setTexture.bind(object, texture));
        }
    }

    /*
     * Natychmiastowa akcja usunięcia obiektu z widoku
     */
    export class RemoveTransition extends ImmediateTransition {
        constructor(view: GameView, object: PIXI.DisplayObject) {
            super(view, view.getStage().removeChild.bind(view.getStage(), object));
        }
    }
} 