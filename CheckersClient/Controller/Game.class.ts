module Controller {
    /**
     * Klasa kontrolera gry
     */
    export class Game {
        /** Główny kontroler aplikacji (rodzic) */
        private app: App;
        /** Klient WebSocket */
        private webClient: WebClient;
        /** Widok gry */
        private view: View.GameView;
        
        /*
         * Zmienne powiązane ze stanem gry
         */

        /** Model gry */
        private model: Model.GameModel = null;
        /** Wybrany pionek */
        private choosedPiece: View.Piece = null;
        /** Pionek na którym widok jest zablokowany (wykonuje wielokrotne bicie) */
        private lockedOnPiece: View.Piece = null;
        /** Bufor dla ruchów otrzymanych od serwera */
        private serverMoveCache: Model.Field[] = null;
        /** Opóźnienie ruchu serwera */
        private serverMoveTimer: number = null;
        /** Timer gry */
        private gameTimer: number = null;

        /**
         * Konstruktor kontrolera.
         * Wiąże kontroler z widokiem gry
         * @param view Widok gry
         * @param app Główny kontroler aplikacji
         */
        constructor(view: View.GameView, app: App) {
            this.view = view;
            this.app = app;
            // Powiaz kontroler z widokiem
            this.view.getBoard().onPieceClick(this.onPieceClick.bind(this));
            this.view.getBoard().onSelectedFieldClick(this.onSelectedFieldClick.bind(this));
            this.view.onGameEnd(function () {
                var that: Game = this;
                that.app.showMenu();
            }.bind(this));
            // Pobierz z głównego kontrolera instancję Websocket
            this.webClient = this.app.getClientInstance();
        }

        /**
         * Handler odpowiedzi serwera na żądanie stworzenia nowej gry
         * @param localPieces Wybrane przez serwer pionki dla naszego gracza
         */
        private onServerHello(localPieces: Model.PieceColor) {
            // Inicjalizuj grę
            this.model = new Model.GameModel(localPieces);
            this.choosedPiece = null;
            this.lockedOnPiece = null;
            this.serverMoveCache = null;
            // Powiąż model z widokiem
            this.view.getBoard().initialize(this.model.getBoard(), localPieces);
            // Przełącz na widok gry
            View.ViewManager.getInstance().switchView("game");
            // Po zakończeniu przygotowań widoku...
            this.view.onTransitionEnd(function () {
                var that = <Game>this;
                that.startTimer();
                that.updateTurn();
                that.webClient.sayReady();
            }.bind(this));
            // Show must go on!
            this.view.playTransition();
        }

        /**
         * Handler ruchu serwera
         * @param from Współrzędne pionka, który wykonuje ruch
         * @param to Seria współrzędnych będących ścieżką tego ruchu
         */
        private onServerMove(from: Model.Field, to: Model.Field[]) {
            this.serverMoveCache = [];
            this.serverMoveCache.push(from);
            this.serverMoveCache = this.serverMoveCache.concat(to);
        }

        /**
         * Handler zakończenia gry
         * @param time Czas trwania gry (wg. serwera)
         * @param win Ustawione na true, jeśli wygrał gracz
         */
        private onServerEnd(time: number, win: boolean) {
            // Usuń timer oczekiwania
            if(this.serverMoveTimer != null)
                clearInterval(this.serverMoveTimer);
            // Zawieś timer gry
            this.stopTimer();
            // Aktualizuj dane dotyczące czasu
            this.model.syncClockTicks(time);
            // Aktualizuj widok
            this.view.updateTimer(this.model.getFormattedClockTicks());
            this.view.setEndGameMessage(win, this.model.getFormattedClockTicks());
            this.view.setInteractive(false);
            // Dodaj przejście
            this.view.addTransition(new View.GameEndTransition(this.view));
            // Odpal przejście
            this.view.playTransition();
        }

        /**
         * Metoda, która wykonuje ruchy otrzymane od serwera (jeśli istnieją)
         * a następnie przełącza kolejkę.
         * Wykonywana cyklicznie przez timer oczekujący na ruch od serwera.
         * Wprowadza opóźnienie dla ruchu otrzymanego od serwera.
         */
        private doServerMove() {
            // Jeśli nie otrzymano jeszcze ruchu: czekaj dalej
            if (!this.serverMoveCache)
                return;
            // Zrealizuj ruch
            var piece = this.model.getBoard().getPiece(this.serverMoveCache[0]);
            for (var i = 1; i < this.serverMoveCache.length; i++)
                piece.move(this.serverMoveCache[i]);
            this.serverMoveCache = null;
            // Gdy widok zakończy realizację ruchu: przełącz kolejkę
            this.view.onTransitionEnd(function () {
                var that: Game = this;
                that.model.switchTurn();
                that.updateTurn();
            }.bind(this));
            // Zleć widokowi wykonanie operacji
            this.view.playTransition();
            // Usuń timer
            clearInterval(this.serverMoveTimer);
            this.serverMoveTimer = null;
        }

        /**
         * Dostosowuje zachowania widoku i kontrolera po uzgodnieniu z modelem
         * czy teraz czas na ruch gracza czy serwera
         */
        private updateTurn() {
            if (this.model.isLocalTurn())
            {
                this.view.updateTurn(this.model.getLocalPieces() == Model.PieceColor.White);
                this.view.setInteractive(true);
            }
            else {
                this.view.updateTurn(this.model.getLocalPieces() != Model.PieceColor.White);
                this.view.setInteractive(false);
                this.serverMoveTimer = setInterval(this.doServerMove.bind(this), 1000);
            }
        }

        /**
         * Uruchamia timer gry
         */
        private startTimer() {
            if (this.gameTimer != null)
                clearInterval(this.gameTimer);
            this.gameTimer = setInterval(function () {
                var that: Game = this;
                that.model.nextClockTick();
                that.view.updateTimer(that.model.getFormattedClockTicks());
            }.bind(this), 1000)
        }

        /**
         * Zatrzymuje timer gry
         */
        private stopTimer() {
            if(this.gameTimer != null)
                clearInterval(this.gameTimer);
            this.gameTimer = null;
        }

        /**
         * Wyzwalacz stworzenia nowej gry przez kontroler
         * @param desiredColor Żądany przez gracza kolor
         */
        public startNewGame(desiredColor: Model.PieceColor) {
            View.MessageView.showMessage("Łączenie z serwerem...");
            // Po nawiązaniu połączenia
            this.webClient.onConnect(function () {
                // Przywitaj się...
                var that: Game = this.that;
                that.webClient.sayHello(this.desiredColor);
            }.bind({
                that: this,
                desiredColor: desiredColor
                }));
            // Po otrzymaniu hello...
            this.webClient.onServerHello(this.onServerHello.bind(this));
            // Po otrzymaniu ruchu
            this.webClient.onServerMove(this.onServerMove.bind(this));
            // Po zakończeniu gry
            this.webClient.onServerEnd(this.onServerEnd.bind(this));
            // Rozpoczęcie połączenia
            this.webClient.open();
        }
        
        /*
         * Zdarzenie wywoływane po wybraniu pionka
         * @param piece Wybrany pionek
         */
        private onPieceClick(piece: View.Piece) {
            // Jeśli wielokrotne bicie (kontroler zablokowany na pionku)
            if (this.lockedOnPiece)
                return;
            var pieceModel = piece.getPieceModel(this.model);
            // Jeśli pionek nie należy do nas
            if (pieceModel.getColor() != this.model.getLocalPieces())
                return;
            // Pobierz możliwe ruchy dla tego pionka
            var moves = pieceModel.getPossibilities(this.model.getBoard().anyCaptures(pieceModel.getColor()));
            this.view.getBoard().unselectAllFields();
            if (moves.length > 0)
                this.choosedPiece = piece;
            for (var p in moves)
                this.view.getBoard().getField(moves[p]).select();
        }

        /*
         * Metoda ponownego oznaczenia pionka, który wykonuje wielokrotne bicie
         */
        private selectLockedPiece() {
            this.choosedPiece = this.lockedOnPiece;
            var pieceModel = this.lockedOnPiece.getPieceModel(this.model);
            var moves = pieceModel.getPossibilities(true);
            this.view.getBoard().unselectAllFields();
            for (var p in moves)
                this.view.getBoard().getField(moves[p]).select();
        }

        /*
         * Zdarzenie wywoływane po wybraniu pola
         * @field Wybrane pole
         */
        private onSelectedFieldClick(field: View.Field) {
            // Pobierz model dla wybranego pionka
            var pieceModel = this.choosedPiece.getPieceModel(this.model);
            // Zrealizuj ruch w modelu i sprawdź czy jest to dalsze bicie
            var multiCapture = pieceModel.move(field.getModelField().clone());
            // Jeśli tak: zablokuj kontroler na tym pionku
            this.lockedOnPiece = (multiCapture ? this.choosedPiece : null);
            // Odznacz wszystkie pola
            this.view.getBoard().unselectAllFields();
            if (this.lockedOnPiece)
                /*
                 * Jeśli jest kolejne bicie, po zrealizowaniu ruchu w widoku
                 * wybierz znowu ten pionek.
                 */
                this.view.onTransitionEnd(function () {
                    var that: Game = this;
                    that.view.setInteractive(true);
                    that.selectLockedPiece();
                }.bind(this));
            else
                /*
                 * Jeśli nie ma wiecej bic, po zrealizowaniu ruchu w widoku
                 * wyślij go na serwer
                 */
                this.view.onTransitionEnd(function () {
                    var that: Game = this;
                    // Pobierz sekwencje ruchow pionka
                    var pieceModel = that.choosedPiece.getPieceModel(that.model);
                    var moveSequence = pieceModel.popFromCache();
                    moveSequence.push(pieceModel.getPosition().clone());
                    // Wyslij ja na serwer
                    that.webClient.sendMoves(moveSequence);
                    // Anuluj wybor pionka
                    that.choosedPiece = null;
                    // Nadeszla kolej serwera
                    that.model.switchTurn();
                    that.updateTurn();             
                }.bind(this));
            this.view.setInteractive(false);
            this.view.playTransition();
        }
    }
} 