module Controller {
    /*
     * Klasa kontrolera aplikacji
     */
    export class App {
        private rank: Model.Rank;
        private menuView: View.MenuView;

        private webClient: WebClient;
        private currentGame: Game;

        constructor(menuView: View.MenuView, gameView: View.GameView) {
            this.menuView = menuView;
            this.menuView.onStartGame(this.onStartGame.bind(this));
            
            this.rank = new Model.Rank();
            this.webClient = new WebClient();
            this.currentGame = new Game(gameView, this);
        }

        public getClientInstance(): WebClient {
            return this.webClient;
        }

        private onRankUpdate(times: number[]) {
            this.rank.updateTimes(times);
            this.menuView.updateRank(this.rank.getFormattedTimes());
        }

        private onStartGame(selectedColor: View.SelectedColor) {
            var desiredColor: Model.PieceColor = null;

            if (selectedColor == View.SelectedColor.White)
                desiredColor = Model.PieceColor.White;
            if (selectedColor == View.SelectedColor.Black)
                desiredColor = Model.PieceColor.Black;

            this.currentGame.startNewGame(desiredColor);
        }

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