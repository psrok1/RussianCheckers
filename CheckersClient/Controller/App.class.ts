/**
 * Moduł kontrolera aplikacji
 * @preferred
 */
module Controller {
    /**
     * Klasa kontrolera aplikacji
     */
    export class App {
        /** Odnośnik do modelu rankingu */
        private rank: Model.Rank;
        /** Odnośnik do widoku menu */
        private menuView: View.MenuView;

        /** Klient WebSocket */
        private webClient: WebClient;
        /** Kontroler aktualnej gry */
        private currentGame: Game;

        /**
         * Konstruktor kontrolera aplikacji
         * @param menuView Widok głównego menu gry
         * @param gameView Widok trwającej gry
         */
        constructor(menuView: View.MenuView, gameView: View.GameView) {
            this.menuView = menuView;
            this.menuView.onStartGame(this.onStartGame.bind(this));
            
            this.rank = new Model.Rank();
            this.webClient = new WebClient();
            this.currentGame = new Game(gameView, this);
        }

        /**
         * Zwraca obiekt klienta powiązanego z tym kontrolerem
         */
        public getClientInstance(): WebClient {
            return this.webClient;
        }

        /**
         * Metoda wykonywana po otrzymaniu aktualizacji rankingu od serwera
         * @param times Najlepsze czasy otrzymane od serwera
         */
        private onRankUpdate(times: number[]) {
            this.rank.updateTimes(times);
            this.menuView.updateRank(this.rank.getFormattedTimes());
        }

        /**
         * Metoda wykonywana po żądaniu rozpoczęcia gry od użytkownika
         * @param selectedColor Wybrany kolor przez użytkownika
         */
        private onStartGame(selectedColor: View.SelectedColor) {
            var desiredColor: Model.PieceColor = null;

            if (selectedColor == View.SelectedColor.White)
                desiredColor = Model.PieceColor.White;
            if (selectedColor == View.SelectedColor.Black)
                desiredColor = Model.PieceColor.Black;

            this.currentGame.startNewGame(desiredColor);
        }

        /**
         * Metoda przejścia do głównego menu gry
         */
        public showMenu() {
            View.MessageView.showMessage("Łączenie z serwerem...");
            this.webClient.onServerRank(function (times: number[]) {
                var that: App = this;
                that.onRankUpdate(times);
                that.webClient.close();
                View.ViewManager.getInstance().switchView("menu");
            }.bind(this));
            this.webClient.onConnect(function () {
                var that: App = this;
                that.webClient.requestRank();
            }.bind(this));
            this.webClient.open();
        }
    }
} 