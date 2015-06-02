module View {
    /**
     * Generyczny interfejs obserwatora modelu
     */
    export interface ModelObserver<T> {
        notify(sender: T);
    }

    /**
     * Klasa reprezentująca widok gry
     */
    export class GameView extends View {
        /*
         * Stan przejść synchronicznych
         */

        /** Kolejka przejść synchronicznych */
        private transitionQueue: Transition[] = [];
        /** Handler zdarzenia zakończenia przejść */
        private onTransitionEndHandler: () => void = null;
        /** Aktualnie wykonywane przejście */
        private currentTransition: Transition = null;
        /** Czy przejścia są aktualnie wykonywane? */
        private transitionPlayed: boolean = false;
        
        /*
         * Obiekty widoku
         */

        /** Obiekt planszy */
        private board: Board;
        /** Obiekt tła */
        private background: PIXI.Sprite;
        /** Pole tekstowe pokazujące stan timera gry */
        private timer: PIXI.Text;
        /** Strzałka zapalająca się, gdy kolej białych pionków */
        private leftTurn: PIXI.Sprite;
        /** Strzałka zapalająca się, gdy kolej czarnych pionków */
        private rightTurn: PIXI.Sprite;
        
        /** Panel informujący o końcu gry */
        private gameEndMessage: GameEndMessage;
        /** Filtr szarości */
        private grayFilter: PIXI.GrayFilter;

        /**
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

        /**
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

        /**
         * Aktualizuje wskazanie czyja jest teraz kolej
         * @param whiteTurn Powinien być ustawiony na true, jeśli kolej białych pionków
         */
        public updateTurn(whiteTurn: boolean) {
            this.leftTurn.setTexture(
                TextureManager.getInstance().getTexture(
                    whiteTurn ? "turnWhite" : "turnWhiteDisabled"));
            this.rightTurn.setTexture(
                TextureManager.getInstance().getTexture(
                    !whiteTurn ? "turnBlack" : "turnBlackDisabled"));
        }

        /**
         * Aktualizuje timer
         * @param timer Stan timera
         */
        public updateTimer(timer: string) {
            this.timer.setText(timer);
        }

        /**
         * Ustawia panel końca gry
         * Ustawia komunikat kto wygrał i czas gry
         * Informuje renderer, że panel powinien być rysowany na wierzchu
         * @param winClient True, jeśli wygrał klient
         * @param time Czas gry
         */
        public setEndGameMessage(winClient: boolean, time: string) {
            this.gameEndMessage.setMessage(winClient, time);
            this.getStage().setChildIndex(this.gameEndMessage, this.getStage().children.length - 1);
        }

        /**
         * Wyświetla panel końca gry
         */
        public showEndGameMessage() {
            this.gameEndMessage.show();
        }

        /**
         * Modyfikuje wyszarzenie widoku
         * @param Poziom wyszarzenia widoku
         */
        public setGrayness(grayness: number) {
            this.grayFilter.gray = grayness;
        }

        /**
         * Metoda zwracająca obiekt widoku reprezentujący planszę gry
         */
        public getBoard(): Board {
            return this.board;
        }

        /**
         * Metoda zmieniająca interaktywność widoku
         * @param interactive Czy widok powinien reagować na zdarzenia myszy?
         */
        public setInteractive(interactive: boolean) {
            this.stage.interactive = interactive;
            this.board.setInteractive(interactive);
        }

        /**
         * Metoda wywoływana przy rysowaniu kolejnej klatki
         */
        public update() {
            if (this.currentTransition)
                this.currentTransition.update();
        }

        // Pozostawione na ew. przyszłość
        //public pause(): boolean {
        //    if (!super.pause())
        //        return false;
        //    // ...
        //    return true;
        //}

        /**
         * Metoda wywoływana przez menedżer widoków przy aktywacji tego widoku
         */
        public resume() {
            if (!super.resume())
                return false;
            
            this.setGrayness(0);
            this.gameEndMessage.hide();
            return true;
        }

        /**
         * Rejestracja przejścia synchronicznego
         * @param transition Przejście synchroniczne do zrealizowania
         */
        public addTransition(transition: Transition) {
            this.transitionQueue.push(transition);
        }

        /**
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

        /**
         * Uruchomienie kolejki przejść
         */
        public playTransition() {
            if (!this.transitionPlayed) {
                this.transitionPlayed = true;
                this.nextTransition();
            }
        }

        /**
         * Rejestracja handlera, który wykona się, gdy kolejka przejść stanie się pusta
         * @param handler Funkcja obsługi zdarzenia
         */
        public onTransitionEnd(handler: () => void) {
            this.onTransitionEndHandler = handler;
        }

        /**
         * Rejestracja handlera, który wykona się, gdy zostanie potwierdzone zakończenie gry
         * przez użytkownika
         * @param handler Funkcja obsługi zdarzenia
         */
        public onGameEnd(handler: () => void) {
            this.gameEndMessage.onClose(handler);
        }
    }

    /**
     * Panel informujący o zakończeniu gry
     */
    class GameEndMessage extends PIXI.Graphics {
        /** Obiekt treści wiadomości o zakończeniu */
        private endGameMessage: PIXI.Text;
        /** Przycisk przejścia do menu */
        private endGameButton: PIXI.Text;
        /** Zdarzenie wyzwalane przy wciśnięciu "Przejdź do menu"*/
        private onCloseHandler: () => void = null;

        /**
         * Konstruktor panelu
         */
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

        /**
         * Modyfikacja komunikatu o zakończeniu gry
         * @param winClient Czy informować o zwycięstwie czy przegranej?
         * @param time Czas gry
         */
        public setMessage(winClient: boolean, time: string) {
            this.endGameMessage.setText(winClient
                ? "Wygrałeś!\nTwój czas to " + time
                : "Przegrałeś...\nTwój czas to " + time);
        }

        /**
         * Rejestracja zdarzenia kliknięcia na "Przejdź do menu"
         * @param handler Funkcja obsługi zdarzenia
         */
        public onClose(handler: () => void) {
            this.onCloseHandler = handler;
        }

        /**
         * Wyświetlenie panelu
         */
        public show() {
            this.endGameButton.interactive = true;
            this.visible = true;
        }

        /**
         * Ukrycie panelu
         */
        public hide() {
            this.endGameButton.interactive = false;
            this.visible = false;
        }
    }
} 