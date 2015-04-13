module Model {
    export class King extends Piece {
        //klasa rerezentujaca damke

        public constructor(piece: Piece) {
            super(piece.getColor(), piece.getBoard(), piece.getPosition());
            this.observers = piece.sliceObservers();
            this.update();
        }


        public findToJump(from: Field, varX: number, varY: number, color: PieceColor) { 
            // metoda zwracajaca pole, na ktorym stoi pion do potencjalnego zbicia (w danym kierunku)
            var temp = new Field(from.x + varX, from.y + varY);
            while (this.board.getPiece(temp) === null) {
                temp.x += varX;
                temp.y += varY;
            }
            if (this.board.getPiece(temp) === undefined || this.board.getPiece(temp).getColor() === color) return null;
            return temp;
        }

        public getPossibilities(onlyCaptures: boolean): Field[] { 
            // metoda zwracajaca tablice pol, na ktore moze przesunac sie damka, onlyCaptures == true gdy zadamy samych bic
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

        public move(to: Field): boolean { 
            // metoda przesuwajaca damke, zaklada poprawnosc wywolywanego ruchu
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


        private kingMove(from: Field, valX: number, valY: number, dist: number): Field { 
            /* metoda znajduje wszystkie pola na ktore mozna przesunac damke bez bicia, 
             * z danego pola w danym kierunku
            */
            var temp = new Field(from.x + valX * dist, from.y + valY * dist);
            var piece = this.board.getPiece(temp);
            if (piece === null) return temp;
            else return null;
        }

        private hasCapture(temp: Field, to: Field, varX: number, varY: number): boolean{
            // sprawdzenie czy poruszajaca sie damka zbija inny pion
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