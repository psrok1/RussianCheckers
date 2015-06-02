/** */
module View {
    /*
     * Niektóre akcje widoku muszą zostać wykonane synchronicznie np. przejście pionka, bicie
     * i zmiana na damkę. Ten mechanizm pozwala na wykonanie synchronicznie kilku akcji w
     * asynchronicznym środowisku JavaScript. 
     */
    
    /**
     * Abstrakcyjna klasa reprezentujaca akcje widoku, ktore zostaną wykonane sekwencyjnie
     */
    export /*abstract*/ class Transition {
        /** Widok, na którym ma zostać wykonane przejście */
        protected view: GameView;

        /**
         * Konstruktor akcji
         * @param view Widok docelowy
         */
        constructor(view: GameView) {
            this.view = view;
        }

        /** Aktualizacja stanu akcji */
        public update() { }
        /** Wyzwolenie akcji */
        public play() { }
    }
    
    /**
     * Akcja przemieszczenia obiektu widoku do danego punktu
     * z wykorzystaniem algorytmu Bresenhama
     */
    export class MovementTransition extends Transition {
        /** Obiekt do przesunięcia */
        private object: PIXI.DisplayObject;
        /** Współrzędne docelowe */
        private target: PIXI.Point;
        /** Prędkość w pikselach na klatkę */
        private speed: number;

        /**
         * Stan algorytmu Bresenhama
         */

        private xi: number;
        private yi: number;
        private dx: number;
        private dy: number;
        private d:  number;
        private ai: number;
        private bi: number;

        /**
         * Konstruktor obiektu akcji.
         * @param view Widok, do którego należy obiekt
         * @param object Obiekt, który ma zostać przemieszczony
         * @param target Punkt docelowy
         * @param speed Szybkość przemieszczenia
         */
        constructor(view: GameView, object: PIXI.DisplayObject, target: PIXI.Point, speed: number) {
            super(view);
            this.object = object;
            this.target = target;
            this.speed = speed;
        }

        /** Wyzwolenie akcji */
        public play() {
            this.dx = this.target.x - this.object.position.x;
            this.dy = this.target.y - this.object.position.y;
            this.xi = (this.dx < 0 ? -1 : 1);
            this.yi = (this.dy < 0 ? -1 : 1);
            this.dx = Math.abs(this.dx);
            this.dy = Math.abs(this.dy);

            this.ai = -Math.abs(this.dy - this.dx) * 2;
            this.bi = Math.min(this.dx, this.dy) * 2;
            this.d = this.bi - Math.max(this.dx, this.dy);
        }

        /**
         * Sprawdzenie czy spełniony jest warunek zakończenia przejścia
         */
        private endCondition(): boolean {
            if (this.dx > this.dy)
                return Math.floor(this.object.position.x) == Math.floor(this.target.x);
            else
                return Math.floor(this.object.position.y) == Math.floor(this.target.y);
        }

        /**
         * Aktualizacja stanu przejścia
         */
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

    /** 
     * Akcja obrotu obiektu widoku
     */
    export class RotateTransition extends Transition {
        /** Obiekt do obrócenia */
        private object: PIXI.DisplayObject;
        /** Liczba kroków do wykonania zadanego obrotu */
        private steps: number;
        /** Pojedyńczy krok obrotu */
        private rotationStep: number;
        /** Kierunek obrotu */
        private direction: RotateTransitionDirection;

        /**
         * Konstruktor akcji
         * @param view Widok, do którego należy obiekt
         * @param object Obracany obiekt
         * @param direction Kierunek obrotu
         */
        constructor(view: GameView, object: PIXI.DisplayObject, direction: RotateTransitionDirection) {
            super(view);
            this.object = object;
            this.direction = direction;

            this.steps = 40;
            this.rotationStep = (Math.PI / 2) / this.steps;
        }

        /** Kolejna klatka akcji */
        public update() {
            this.object.rotation += this.direction * this.rotationStep;
            if (--this.steps <= 0)
                this.view.nextTransition();
        }
    }

    /**
     * Enumeracja wyznaczająca kierunek obrotu dla akcji obrotu
     */
    export const enum RotateTransitionDirection {
        LEFT = -1,
        RIGHT = 1
    }

    /**
     * Akcja widoku dla końca gry
     */
    export class GameEndTransition extends Transition {
        /** Dotychczasowy poziom wyszarzenia */
        private grayness: number = 0;

        /**
         * Konstruktor akcji
         * @param view Obiekt widoku
         */
        constructor(view: GameView) {
            super(view);
        }

        /**
         * Aktualizacja stanu akcji dla kolejnej klatki
         */
        public update() {
            this.grayness += 0.01;
            this.view.setGrayness(this.grayness);
            if (this.grayness >= 1) {
                this.view.showEndGameMessage();
                this.view.nextTransition();
            }
        }
    }

    /**
     * Klasa reprezentująca sekwencyjne akcje natychmiastowe
     */
    export class ImmediateTransition extends Transition {
        /** Akcja do wykonania */
        private method: any;

        /**
         * Konstruktor akcji
         * @param view Powiązany widok
         * @param method Akcja do wykonania
         */
        constructor(view: GameView, method: any) {
            super(view);
            this.method = method;
        }

        /**
         * Wyzwolenie akcji
         */
        public play() {
            this.method();
            this.view.nextTransition();
        }
    }

    /**
     * Natychmiastowa akcja zmiany tekstury
     */
    export class SetTextureTransition extends ImmediateTransition {
        /**
         * Konstruktor akcji
         * @param view Powiązany widok gry
         * @param object Obiekt, który podlega zmianie struktury
         * @param texture Nowa tekstura dla obiektu
         */
        constructor(view: GameView, object: PIXI.Sprite, texture: PIXI.Texture) {
            super(view, object.setTexture.bind(object, texture));
        }
    }

    /**
     * Natychmiastowa akcja zniknięcia obiektu z widoku
     */
    export class HideTransition extends ImmediateTransition {
        /**
         * Konstruktor akcji
         * @param view Powiązany widok gry
         * @param object Obiekt do ukrycia
         */
        constructor(view: GameView, object: PIXI.DisplayObject) {
            super(view, function () { this.visible = false; }.bind(object));
        }
    }
} 