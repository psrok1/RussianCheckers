module Model {
    export class Board {
        /*
         * (x,y) -> Piece
         * pieces[y*8+x] = (null | Piece)
         */
        private pieces: Piece[];
        private whiteRemaining: number;
        private blackRemaining: number;

        constructor() {
            /*
             * TODO: Tworzy poprawną planszę
             * 
             *  0 1 2 3 4 5 6 7 
             * -----------------
             * | |c| |c| |c| |c| 0
             * -----------------
             * |c| |c| |c| |c| | 1
             * -----------------
             * | |c| |c| |c| |c| 2
             * -----------------
             * | | | | | | | | | 3
             * -----------------
             * | | | | | | | | | 4
             * -----------------
             * |b| |b| |b| |b| | 5
             * -----------------
             * | |b| |b| |b| |b| 6
             * -----------------
             * |b| |b| |b| |b| | 7
             * -----------------
             */
        }

        public getPiece(from: Field): Piece {
            /*
             * TODO: Pobiera wskazany obiekt modelu pionka z planszy
             */
            return null;
        }
    }
}