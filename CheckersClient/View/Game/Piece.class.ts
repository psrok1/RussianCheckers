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
            var textureManager = TextureManager.getInstance();
            this.sprite = new PIXI.Sprite(textureManager.getTexture("pieceWhite"));
            this.board = board;
            this.board.getSprite().addChild(this.sprite);
            this.sprite.click = function () {
                if(this.onClickHandler && !this.captured)
                    this.onClickHandler(this);
            }.bind(this);
        }

        /*
         * Wyznacza teksturę do użycia dla danego pionka
         */

        private getTexture(): PIXI.Texture {
            return TextureManager.getInstance().getTexture(
                (this.color == Model.PieceColor.White ? "pieceWhite" : "pieceBlack") +
                (this.isKing ? "King" : ""));
        }

        private switchOnTop() {
            var boardSprite = this.board.getSprite();
            boardSprite.setChildIndex(this.sprite, boardSprite.children.length - 1);
        }

        /*
         * Metoda notify: interfejs komunikacji z modelem.
         * Model pionka wywołuje tą metodę, gdy zmieni swój stan.
         */
        public notify(sender: Model.Piece) {
            var view: GameView = <GameView>ViewManager.getInstance().getView("game");
            if (!sender.getPosition().equals(this.position)) {
                this.position = sender.getPosition().clone();
                // Skoro zmieniła się jego pozycja, to pewnie zaraz będzie przesunięty
                // Skoro będzie przesunięty to najlepiej go rzucić od razu na samą górę
                this.switchOnTop();
                view.addTransition(
                    new MovementTransition(
                        view, this.sprite,
                        this.fieldToPosition(this.position),
                        10));
            }

            if (sender.isCaptured()) {
                this.captured = true;
                view.addTransition(new HideTransition(view, this.sprite));
            }

            if (!this.isKing && (sender instanceof Model.King)) {
                this.isKing = true;
                view.addTransition(new SetTextureTransition(
                    view, this.sprite, this.getTexture()));
            }
        }

        /*
         * Wyznacza współrzędne pola na widoku planszy
         */
        private fieldToPosition(field: Model.Field): PIXI.Point {
            return new PIXI.Point(
                field.x * 48 - 192,
                field.y * 48 - 192);
        }

        /*
         * Sprzężenie obserwatora pionka z nowym modelem dla nowej gry
         */
        public initialize(piece: Model.Piece, localPieces: Model.PieceColor) {
            // Aktualizacja kopii stanu
            this.position = piece.getPosition().clone();
            this.color = piece.getColor();
            this.isKing = (piece instanceof Model.King);
            this.captured = piece.isCaptured();
            // Zmiana widoku
            this.sprite.setTexture(this.getTexture());
            this.sprite.position = this.fieldToPosition(piece.getPosition());
            this.sprite.visible = true;
            // Korekta obrotu, aby poprawnie wyswietlala sie damka
            this.sprite.rotation = (localPieces === Model.PieceColor.Black ? Math.PI : 0);
            // Podpiecie sie do modelu jako obserwator
            piece.bindObserver(this);
        }

        /*
         * Zmiana interaktywności
         */
        public setInteractive(interactive: boolean) {
            this.sprite.interactive = interactive;
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
            return model.getBoard().getPiece(this.position);
        }
    }
} 