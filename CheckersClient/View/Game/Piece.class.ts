module View {
    export class Piece implements ModelObserver<Model.Piece> {
        private view: GameView;
        private sprite: PIXI.Sprite;

        private position: Model.Field;
        private color: Model.PieceColor;
        private isKing: boolean;
        private captured: boolean;

        constructor(view: GameView, piece: Model.Piece) {

        }

        public notify(sender: Model.Piece) {
            
        }

        public initialize(position: Model.Field) {

        }

        public onClick(handler: (piece: Piece) => void) {

        }
    }
} 