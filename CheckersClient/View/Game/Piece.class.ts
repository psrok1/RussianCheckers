module View {
    /*
     * Klasa widoku pionka na planszy widoku gry
     * Obserwator pionka w modelu
     */
    export class Piece implements ModelObserver<Model.Piece> {
        private view: GameView;
        private sprite: PIXI.Sprite;

        private position: Model.Field;
        private color: Model.PieceColor;
        private isKing: boolean;
        private captured: boolean;

        constructor(view: GameView) {

        }

        public notify(sender: Model.Piece) {
            
        }

        public initialize(piece: Model.Piece) {
            /*
             * Ustaw teksture i pozycje pionka zgodnie z modelem
             * Dodaj sie do listy obserwatorow danego pionka
             */
        }

        public onClick(handler: (piece: Piece) => void) {

        }

        public getPieceModel(): Model.Piece {
            /*
             * Pobiera model na podstawie pozycji
             * Moglibysmy trzymac odnosnik do tego obiektu,
             * ale mozliwosc zmiany na damke komplikuje sprawe
             */
            return null;
        }
    }
} 