module View {
    /*
     * Klasa widoku pionka na planszy widoku gry
     * Obserwator pionka w modelu
     */
    export class Piece implements ModelObserver<Model.Piece> {
        private board: Board;               // Plansza na której leży pionek
        private sprite: PIXI.Sprite;        // Obiekt widoku pionka

        /*
         * Kopia informacji z modelu, która pozwoli na wychwycenie różnic przy aktualizacji
         */
        private position: Model.Field;      // Pozycja pionka
        private color: Model.PieceColor;    // Kolor pionka
        private isKing: boolean;            // Czy pionek jest damką?
        private captured: boolean;          // Czy pionek został zbity?

        /*
         * Handler obsługi zdarzenia wybrania pionka
         */
        private onClickHandler: (piece: Piece) => void = null;

        /*
         * Konstruktor tworzący pionek na danej planszy
         */
        constructor(board: Board) {
            /*
             * Tutaj stwórz sprite z odpowiednią teksturą
             */
            this.board = board;
            this.board.getSprite().addChild(this.sprite);
            this.sprite.click = function () {
                if(this.onClickHandler)
                    this.onClickHandler(this);
            }.bind(this);
        }

        /*
         * Metoda notify: interfejs komunikacji z modelem.
         * Model pionka wywołuje tą metodę, gdy zmieni swój stan.
         */
        public notify(sender: Model.Piece) {
            
        }

        /*
         * Sprzężenie obserwatora pionka z nowym modelem dla nowej gry
         */
        public initialize(piece: Model.Piece) {
            /*
             * Ustaw teksture i pozycje pionka zgodnie z modelem
             * Dodaj sie do listy obserwatorow danego pionka
             */
            piece.bindObserver(this);
        }

        /*
         * Rejestracja handlera zdarzenia wybrania pionka
         */
        public onClick(handler: (piece: Piece) => void) {
            this.onClickHandler = handler;
        }

        /*
         * Pobiera odpowiadający obiekt modelu
         */
        public getPieceModel(model: Model.GameModel): Model.Piece {
            return model.getBoard().getPiece(this.position);;
        }
    }
} 