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
        private timer: PIXI.Text;
        private leftTurn: PIXI.Sprite;
        private rightTurn: PIXI.Sprite;
        
        private gameEndMessage: GameEndMessage;
        private grayFilter: PIXI.GrayFilter;

        /*
         * Konstruktor widoku gry
         */
        constructor() {
            super();
            this.grayFilter = new PIXI.GrayFilter();
            this.background = new PIXI.Sprite(
                TextureManager.getInstance().getTexture("gameBackground"));
            this.background.position = new PIXI.Point(0, 0);
            this.getStage().addChild(this.background);
            this.board = new Board(this);

            this.drawGameInformation();

            this.gameEndMessage = new GameEndMessage();
            this.gameEndMessage.position = new PIXI.Point(200, 180);
            this.gameEndMessage.hide();
            this.getStage().addChild(this.gameEndMessage);

            this.board.getSprite().filters = [this.grayFilter];
            this.background.filters = [this.grayFilter];
        }

        /*
         * Konstruktor panelu informacji o stanie gry
         */
        private drawGameInformation() {
            this.timer = new PIXI.Text("0:00", {
                font: "24px monospace",
                fill: "#efe4b0",
                align: "center"
            });
            this.timer.anchor = new PIXI.Point(0.5, 0.5);
            this.timer.position = new PIXI.Point(400, 50);
            this.timer.filters = [this.grayFilter];
            this.getStage().addChild(this.timer);

            this.leftTurn = new PIXI.Sprite(
                TextureManager.getInstance().getTexture("turnWhite"));
            this.leftTurn.anchor = new PIXI.Point(0.5, 0.5);
            this.leftTurn.position = new PIXI.Point(330, 50);
            this.leftTurn.filters = [this.grayFilter];
            this.getStage().addChild(this.leftTurn);

            this.rightTurn = new PIXI.Sprite(
                TextureManager.getInstance().getTexture("turnBlack"));
            this.rightTurn.anchor = new PIXI.Point(0.5, 0.5);
            this.rightTurn.position = new PIXI.Point(470, 50);
            this.rightTurn.filters = [this.grayFilter];
            this.getStage().addChild(this.rightTurn);

            var whiteTurn = new PIXI.Sprite(
                TextureManager.getInstance().getTexture("pieceWhite"));
            whiteTurn.anchor = new PIXI.Point(0.5, 0.5);
            whiteTurn.position = new PIXI.Point(290, 50);
            whiteTurn.scale = new PIXI.Point(0.66, 0.66);
            whiteTurn.filters = [this.grayFilter];
            this.getStage().addChild(whiteTurn);

            var blackTurn = new PIXI.Sprite(
                TextureManager.getInstance().getTexture("pieceBlack"));
            blackTurn.anchor = new PIXI.Point(0.5, 0.5);
            blackTurn.position = new PIXI.Point(510, 50);
            blackTurn.scale = new PIXI.Point(0.66, 0.66);
            blackTurn.filters = [this.grayFilter];
            this.getStage().addChild(blackTurn);
        }

        /*
         * Aktualizuje wskazanie czyja jest teraz kolej
         */
        public updateTurn(whiteTurn: boolean) {
            this.leftTurn.setTexture(
                TextureManager.getInstance().getTexture(
                    whiteTurn ? "turnWhite" : "turnWhiteDisabled"));
            this.rightTurn.setTexture(
                TextureManager.getInstance().getTexture(
                    !whiteTurn ? "turnBlack" : "turnBlackDisabled"));
        }

        /*
         * Aktualizuje timer
         */
        public updateTimer(timer: string) {
            this.timer.setText(timer);
        }

        public setEndGameMessage(winClient: boolean, time: string) {
            this.gameEndMessage.setMessage(winClient, time);
            this.getStage().setChildIndex(this.gameEndMessage, this.getStage().children.length - 1);
        }

        public showEndGameMessage() {
            this.gameEndMessage.show();
        }

        public setGrayness(grayness: number) {
            this.grayFilter.gray = grayness;
        }

        /*
         * Metoda zwracająca obiekt widoku reprezentujący planszę gry
         */

        public getBoard(): Board {
            return this.board;
        }

        /*
         * Metoda zmieniająca interaktywność widoku
         */

        public setInteractive(interactive: boolean) {
            this.stage.interactive = interactive;
            this.board.setInteractive(interactive);
        }

        /*
         * Metoda wywoływana przy rysowaniu kolejnej klatki
         */
        public update() {
            if (this.currentTransition)
                this.currentTransition.update();
        }

        /*
         * Metoda wywoływana przy dezaktywacji tego widoku
         */
        //public pause(): boolean {
        //    if (!super.pause())
        //        return false;
        //    // ...
        //    return true;
        //}

        /*
         * Metoda wywoływana przy aktywacji tego widoku
         */
        public resume() {
            if (!super.resume())
                return false;
            
            this.setGrayness(0);
            this.gameEndMessage.hide();
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

        public onGameEnd(handler: () => void) {
            this.gameEndMessage.onClose(handler);
        }
    }

    class GameEndMessage extends PIXI.Graphics {
        private endGameMessage: PIXI.Text;
        private endGameButton: PIXI.Text;

        private onCloseHandler: () => void = null;

        constructor() {
            super();
            super.beginFill(0x202020, 0.8);
            super.lineStyle(1, 0x404040, 1);
            super.drawRect(0, 0, 400, 240);
            super.endFill();

            this.endGameMessage = new PIXI.Text("", {
                font: "32px monospace",
                fill: "#efe4b0",
                align: "center"
            });
            this.endGameMessage.anchor = new PIXI.Point(0.5, 0.5);
            this.endGameMessage.position = new PIXI.Point(200, 100);
            super.addChild(this.endGameMessage);

            this.endGameButton = new PIXI.Text("Przejdź do menu", {
                font: "20px monospace",
                fill: "#efe4b0",
                align: "center"
            });
            this.endGameButton.anchor = new PIXI.Point(0.5, 0.5);
            this.endGameButton.position = new PIXI.Point(200, 200);
            this.endGameButton.interactive = true;
            this.endGameButton.click = function () {
                document.body.style.cursor = "default";
                this.hide();
                if (this.onCloseHandler)
                    this.onCloseHandler();
            }.bind(this);
            this.endGameButton.mouseover = function () {
                document.body.style.cursor = "pointer";
            }.bind(this);
            this.endGameButton.mouseout = function () {
                document.body.style.cursor = "default";
            }.bind(this);
            super.addChild(this.endGameButton);
        }

        public setMessage(winClient: boolean, time: string) {
            this.endGameMessage.setText(winClient
                ? "Wygrałeś!\nTwój czas to " + time
                : "Przegrałeś...\nTwój czas to " + time);
        }

        public onClose(handler: () => void) {
            this.onCloseHandler = handler;
        }

        public show() {
            this.endGameButton.interactive = true;
            this.visible = true;
        }

        public hide() {
            this.endGameButton.interactive = false;
            this.visible = false;
        }
    }
} 