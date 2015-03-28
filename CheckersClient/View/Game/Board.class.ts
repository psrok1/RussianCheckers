module View {
    export class Board {
        private view:   GameView;
        private board:  PIXI.Sprite;
        private fields: Field[];
        private pieces: Piece[];

        constructor(view: GameView) {
            /*
             * Konstruuje planszę i obiekty planszy
             */
        }

        public initialize(boardModel: Model.Board) {
            /*
             * Ustawia pionki na startowych pozycjach
             * Obraca planszę do neutralnej pozycji
             * Rejestruje w widoku przejście obracające planszę w stronę gracza
             */
        }

        public onPieceClick(handler: (piece: Piece) => void) {
            /*
             * Ustawia handler dla wszystkich pionków
             */
        }

        public onSelectedFieldClick(handler: (field: Field) => void) {
            /*
             * Ustawia handler dla wszystkich pól
             */
        }

        public unselectAllFields() {
            /*
             * Anuluje podświetlenie dla wszystkich pól
             */
        }

        public getField(field: Model.Field): Field {
            /*
             * Pobiera obiekt pola widoku na podstawie obiektu pola modelu
             */
            return null;
        }
    }
} 