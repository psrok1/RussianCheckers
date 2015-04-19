module Controller {
    /*
     * Klasa kontrolera gry
     */
    export class Game {
        private webClient: WebClient;
        private view: View.GameView;
        
        /*
         * Zmienne powiązane ze stanem gry
         */
        private model: Model.GameModel = null;
        private choosedPiece: View.Piece = null;
        private lockedOnPiece: View.Piece = null;
        private serverMoveCache: Model.Field[] = null;
        private serverMoveTimer: number;

        /*
         * Konstruktor kontrolera.
         * Powiązuje kontroler z widokiem gry
         */
        constructor(view: View.GameView) {
            this.view = view;
            // Powiaz kontroler z widokiem
            this.view.getBoard().onPieceClick(this.onPieceClick.bind(this));
            this.view.getBoard().onSelectedFieldClick(this.onSelectedFieldClick.bind(this));
            // Stworz instancję klienta WebSocket
            this.webClient = new WebClient();
        }

        /*
         * Handler odpowiedzi serwera na żądanie stworzenia nowej gry
         */
        private onServerHello(localPieces: Model.PieceColor) {
            // Inicjalizuj grę
            this.model = new Model.GameModel(localPieces);
            this.choosedPiece = null;
            this.lockedOnPiece = null;
            this.serverMoveCache = null;
            // Powiaz model z widokiem
            this.view.getBoard().initialize(this.model.getBoard());
            // Przełącz na widok gry
            View.ViewManager.getInstance().switchView("game");
            // Po zakończeniu przygotowań widoku...
            this.view.onTransitionEnd(function () {
                var that = <Game>this;
                // TODO: Wystartuj timer
                that.updateTurn();
                that.webClient.sayReady();
            }.bind(this));
            // Show must go on!
            this.view.playTransition();
        }

        /*
         * Handler ruchu serwera
         */

        private onServerMove(from: Model.Field, to: Model.Field[]) {
            this.serverMoveCache = [];
            this.serverMoveCache.push(from);
            this.serverMoveCache = this.serverMoveCache.concat(to);
        }

        /*
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
        }

        /*
         * Dostosowuje zachowania widoku i kontrolera po uzgodnieniu z modelem
         * czy teraz czas na ruch gracza czy serwera
         */
        private updateTurn() {
            if (this.model.isLocalTurn())
                this.view.setInteractive(true);
            else {
                this.view.setInteractive(false);
                this.serverMoveTimer = setInterval(this.doServerMove.bind(this));
            }
        }

        /*
         * Wyzwalacz stworzenia nowej gry przez kontroler
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
                desiredColor: Model.PieceColor
                }));
            // Po otrzymaniu hello...
            this.webClient.onServerHello(this.onServerHello.bind(this));
            // Po otrzymaniu ruchu
            this.webClient.onServerMove(this.onServerMove.bind(this));
            // Rozpoczęcie połączenia
            this.webClient.open();
        }
        
        /*
         * Zdarzenie wywoływane po wybraniu pionka
         */
        private onPieceClick(piece: View.Piece) {
            // Jeśli wielokrotne bicie (kontroler zablokowany na pionku)
            if (this.lockedOnPiece)
                return;
            var pieceModel = piece.getPieceModel(this.model);
            // --- TODO LINE BELOW ---
            var moves = pieceModel.getPossibilities(false/*this.model.getBoard().anyCaptures()*/);
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