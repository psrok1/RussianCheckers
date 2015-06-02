module Model {
    /**
     * Model planszy
     */
    export class Board {
        /*
         * (x,y) -> Piece
         * pieces[y*8+x] = (null | Piece)
         */
        
        /** Pionki na planszy */
        private pieces: Piece[];
        /** Liczba pozostałych białych pionków */
        private whiteRemaining: number;
        /** Liczba pozostałych czarnych pionków */
        private blackRemaining: number;

        /**
         * Konstruktor modelu planszy
         */
        constructor() {
            this.pieces = [];
            this.whiteRemaining = 12;
            this.blackRemaining = 12;
            for (var i = 0; i < 8; ++i) {
                for (var j = 0; j < 8; ++j) {
                    if ((i + j) % 2 == 0 || i == 3 || i == 4) this.pieces[i * 8 + j] = null;
                    else {
                        if (i < 3) this.pieces[i * 8 + j] = new Piece(PieceColor.Black, this, new Field(j, i));
                        else this.pieces[i * 8 + j] = new Piece(PieceColor.White, this, new Field(j, i));
                    }
                }
            }
            /*
             * Poprawna plansza
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

        /**
         * Metoda pobierająca pionek z zadanego pola
         * @param from Pole, z którego pobieramy pionek
         * @return Model pionka
         */
        public getPiece(from: Field): Piece {
            if (from.x > 7 || from.y > 7 || from.x < 0 || from.y < 0) return undefined;
            return this.pieces[from.y * 8 + from.x];
            return null;
        }

        /**
         * Metoda ustawiająca pionek na zadanym polu
         * @param position Pole, na którym ustawiamy pionek
         * @param piece Pionek do ustawienia
         */
        public setPiece(position: Field, piece: Piece) {
            this.pieces[position.y * 8 + position.x] = piece;
        }

        /**
         * Metoda wyzwalana przy przechwyceniu pionka o zadanym kolorze
         * @param color Kolor pionka
         */
        public pieceCapture(color: PieceColor) {
            if (color === PieceColor.Black) this.blackRemaining--;
            else this.whiteRemaining--;
        }

        /**
         * Metoda zwracająca, czy pionki o zadanym kolorze mają jakiekolwiek dostępne bicia
         * @param pieceColor Kolor pionka
         * @return Zwraca true, gdy są dostępne bicia
         */
        public anyCaptures(pieceColor: PieceColor): boolean {

            for (var i = 0; i < 8; ++i) {
                for (var j = 0; j < 8; ++j) {
                    if (this.pieces[i * 8 + j] !== null && this.pieces[i * 8 + j].getColor() === pieceColor) {
                        var temp = this.pieces[i * 8 + j].getPossibilities(true);
                        if (temp.length !== 0) return true;
                    }

                }
            }
            return false;
        }
    }
}