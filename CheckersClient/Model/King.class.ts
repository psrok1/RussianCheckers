module Model {
    /**
     * Model damki
     */
    export class King extends Piece {
        /**
         * Konstruktor damki
         * @param piece Pionek, z którego wywodzi się damka
         */
        public constructor(piece: Piece) {
            super(piece.getColor(), piece.getBoard(), piece.getPosition());
            this.observers = piece.sliceObservers();
            this.positionCache = piece.sliceCache();
            this.update();
        }

        /**
         * Metoda zwracająca pole, na którym stoi pion do potencjalnego zbicia (w danym kierunku)
         */
        public findToJump(from: Field, varX: number, varY: number, color: PieceColor) { 
            var temp = new Field(from.x + varX, from.y + varY);
            while (this.board.getPiece(temp) === null) {
                temp.x += varX;
                temp.y += varY;
            }
            if (this.board.getPiece(temp) === undefined || this.board.getPiece(temp).getColor() === color) return null;
            return temp;
        }

        /**
         * Metoda zwracająca tablicę pól, na które może przesunąc się damka
         * @param onlyCaptures True, gdy żądamy samych bić
         */
        public getPossibilities(onlyCaptures: boolean): Field[] { 
            var poss = [];
            var num = 0;
            var temp, temp2;
            var x = [-1, -1, 1, 1];
            var y = [-1, 1, -1, 1];
            var dist = 1;
            for (var i = 0; i < 4; ++i) {
                if ((temp = this.findToJump(this.position, x[i], y[i], this.color)) !== null) {
                    while ((temp2 = this.kingMove(temp, x[i], y[i], dist++)) !== null) {
                        poss[num++] = temp2; // potencjalne bicie
                    }
                }
                dist = 1;
            }
            if (num == 0 && onlyCaptures == false) { // jesli nie znaleziono bic i nie zadamy samych bic szukamy ruchow
                for (var i = 0; i < 4; ++i) {
                    while ((temp2 = this.kingMove(this.position, x[i], y[i], dist++)) !== null) {
                        poss[num++] = temp2;
                    }
                    dist = 1;
                }
            }
            return poss;
        }

        /**
         * Metoda przesuwająca damkę, zakłada poprawność wywoływanego ruchu
         */
        public move(to: Field): boolean { 
            var from = this.position;
            var temp;
            var jumped = false;
            var varX = (to.x - from.x) < 0 ? -1 : 1;
            var varY = (to.y - from.y) < 0 ? -1 : 1;
            this.positionCache.push(from);

            this.board.setPiece(this.position, null);
            this.board.setPiece(to, this);
            this.position = to;
            this.update();

            temp = from.clone();


            if (this.hasCapture(temp, to, varX, varY)) { // mozliwe ze bedzie mozna bic ponownie
                var x = [-1, -1, 1, 1];
                var y = [-1, 1, -1, 1];
                var dist = 1;
                for (var i = 0; i < 4; ++i) {
                    if ((temp = this.findToJump(this.position, x[i], y[i], this.color)) !== null) {
                        if ((this.kingMove(temp, x[i], y[i], 1)) !== null) return true // znaleziono bicie
                    }
                    dist = 1;
                }
            }
            return false; //nie znaleziono bicia 
        }

        /**
         * Metoda znajduje wszystkie pola na które można przesunąć damkę bez bicia, 
         * z danego pola w danym kierunku
         */
        private kingMove(from: Field, valX: number, valY: number, dist: number): Field { 
            var temp = new Field(from.x + valX * dist, from.y + valY * dist);
            var piece = this.board.getPiece(temp);
            if (piece === null) return temp;
            else return null;
        }

        /**
         * Sprawdzenie, czy poruszająca się damka zbija inny pion
         */
        private hasCapture(temp: Field, to: Field, varX: number, varY: number): boolean{
            temp.x += varX;
            temp.y += varY;
            while (temp.x !== to.x) { // petla wyszukujaca potencjalne bicie
                if (this.board.getPiece(temp) !== null) {
                    this.board.getPiece(temp).capture(temp);
                    return true;
                }
                temp.x += varX;
                temp.y += varY;
            }
            return false;  
        }
    }

} 