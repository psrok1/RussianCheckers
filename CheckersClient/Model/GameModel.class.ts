module Model {
    export class GameModel {
        private board: Board;

        private localPieces: PieceColor;
        private localTurn: boolean;
        private gameTime: number;
        
        constructor(localPieces: PieceColor) {
            /*
             * TODO
             * Tworzy plansze
             * Inicjalizuje wszystkie obiekty
             */
        }

        public switchTurn() {
            /*
             * TODO: Zmienia kolej
             */
        }

        public isLocalTurn() {
            return this.localTurn;
        }

        public nextClockTick() {
            /*
             * TODO: Inkrementuje czas, gdy kolej gracza "lokalnego"
             */
        }

        public getClockTicks(): number {
            return this.gameTime;
        }

        public getBoard(): Board {
            return this.board;
        }
    }
}