module Controller {
    /*
     * Klasa kontrolera gry
     */
    export class Game {
        private webClient: WebClient;
        private model: Model.GameModel;
        private choosedPiece: View.Piece;
        private view: View.GameView;

        constructor(view: View.GameView) {
            this.view = view;
        }

        /* Testy modelu i widoku */

        private onPieceClick(piece: View.Piece) {
            var pieceModel = piece.getPieceModel(this.model);
            var moves = pieceModel.getPossibilities(false);
            this.view.getBoard().unselectAllFields();
            if (moves.length > 0)
                this.choosedPiece = piece;
            for (var p in moves)
                this.view.getBoard().getField(moves[p]).select();
        }

        private onSelectedFieldClick(field: View.Field) {
            var pieceModel = this.choosedPiece.getPieceModel(this.model);
            pieceModel.move(field.getModelField().clone());
            this.view.getBoard().unselectAllFields();
            this.view.playTransition();
        }

        public newTestGame() {
            var viewBoard = this.view.getBoard();
            this.model = new Model.GameModel(Model.PieceColor.White);
            viewBoard.initialize(this.model.getBoard());
            this.view.setInteractive(true);
            viewBoard.onPieceClick(this.onPieceClick.bind(this));
            viewBoard.onSelectedFieldClick(this.onSelectedFieldClick.bind(this));
        }
    }
} 