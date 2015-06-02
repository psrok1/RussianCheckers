module Model {
    /**
     * Model pionka
     */
    export class Piece {
        /** Kolor pionka */
        protected color: PieceColor;
        /** Plansza na której leży pionek */
        protected board: Board;
        /** Pole na którym leży pionek */
        protected position: Field;
    
        /** Flaga informująca, że pionek został zbity */
        protected captured: boolean = false;
    
        /** Lista obserwatorów obiektu */
        protected observers: View.ModelObserver<Piece>[] = [];
    
        /**
         * Bufor ruchów niezrealizowanych po stronie serwera
         * Kontroler na podstawie tego bufora, aktualnej pozycji i wiedzy
         * jaki pionek wykonywal ruch: odtworzy ten ruch i wysle na serwer
         */
        protected positionCache: Field[] = [];

        /**
         * Konstruktor pionka
         */
        constructor(color: PieceColor, board: Board, position: Field) {
            this.color = color;
            this.board = board;
            this.position = position;
        }

        /**
         * Metoda zwracająca tablicę pól, na które może przesunąc się damka
         * @param onlyCaptures True, gdy żądamy samych bić
         */
        public getPossibilities(onlyCaptures: boolean): Field[]{ 
            // 
            var poss = [];
            var x = [-1, -1, 1, 1];
            var y = [-1, 1, -1, 1];
            var num = 0;
            var temp;
            for (var i = 0; i < 4; ++i) { // znajdowanie wszystkich mozliwych bic
                temp = this.pieceJump(this.position, x[i], y[i], this.color);
                if (temp !== null) poss[num++] = temp;
            }
            if (num == 0 && onlyCaptures == false) { // nie ma dostepnych bic i nie zadamy samych bic
                for (var j = 0; j < 4; ++j) {
                    temp = this.pieceMove(this.position, x[j], y[j], this.color);
                    if (temp !== null) poss[num++] = temp;
                }
            }

            return poss;
        }

        /**
         * Usunięcie pionka z danego pola (zbicie)
         */
        public capture(capturedField: Field) { 
            var piece = this.board.getPiece(capturedField);
            this.board.setPiece(capturedField, null);
            this.board.pieceCapture(piece.color);
            piece.captured = true;
        
            piece.update();
        }

        /**
         * Przesunięcie pionka na zadane pole
         */
        public move(to: Field): boolean {
            var from = this.position;
            var temp;
            var jumped = false;
            var x = [-1, -1, 1, 1];
            var y = [-1, 1, -1, 1];

            this.positionCache.push(from);

            this.board.setPiece(this.position, null);
            this.board.setPiece(to, this);
            this.position = to;
            this.update();

            if (Math.abs(to.x - from.x) == 2) { // nastapilo bicie    
                this.capture(new Field((from.x + to.x) / 2,(from.y + to.y) / 2));
                var jumped = true;
            }

            if ((this.color == PieceColor.White && to.y == 0) || (this.color == PieceColor.Black && to.y == 7)) // zamieniam na damkę 
                return this.kingChange(jumped);

            if (jumped == true) { // nie jest mozliwe dalsze bicie jesli nie przesunal sie w wyniku bicia
                for (var i = 0; i < 4; ++i) {
                    temp = this.pieceJump(this.position, x[i], y[i], this.color);
                    if (temp !== null) return true;
                }
            }

            return false; // nie ma nastepnego bicia w tym ruchu
        }

        /**
         * Pobranie listy ruchów z bufora do przesłania na serwer
         * i wyczyszczenie bufora
         */
        public popFromCache(): Field[] {
            var cache: Field[] = this.positionCache;
            this.positionCache = [];
            return cache;
        }

        /**
         * Pobranie koloru pionka
         */
        public getColor(): PieceColor {
            return this.color;
        }

        /**
         * Pobranie pozycji pionka (pola, na którym leży)
         */
        public getPosition(): Field {
            return this.position;
        }

        /**
         * Pobranie planszy, na której leży pionek
         */
        public getBoard(): Board {
            return this.board;
        }

        /**
         * Sprawdzenie, czy pionek został zbity
         */
        public isCaptured(): boolean {
            return this.captured;
        }

        /**
         * Zwraca kopię listy obserwatorów
         */
        public sliceObservers() {
            var obs = [];
            obs = this.observers.slice();
            return obs;
        }

        /**
         * Zwraca kopię bufora wykonanych ruchów
         */
        public sliceCache() {
            var obs = [];
            obs = this.positionCache.slice();
            return obs;
        }

        /**
         * Dołącza obserwatora do modelu
         */
        public bindObserver(observer: View.ModelObserver<Piece>)
        {
            this.observers.push(observer);
        }

        /**
         * Wykonuje aktualizację obserwatorów
         */
        public update() {
            for (var o in this.observers)
                this.observers[o].notify(this);
        }

        /**
         * Zwraca, czy w danym kierunku można wykonać ruch (i na jakie pole)
         */
       private pieceMove(from: Field, valX: number, valY: number, color: PieceColor): Field { 
           // 
           if (color === PieceColor.Black && valY < 0) return null;
           if (color === PieceColor.White && valY > 0) return null;
           var temp = new Field(from.x + valX, from.y + valY);
           if (this.board.getPiece(temp) === null) return temp;
           return null;
       }

        /**
         * Zwraca, czy w danym kierunku można wykonać bicie (i na jakie pole)
         */
       private pieceJump(from: Field, valX: number, valY: number, color: PieceColor): Field { 
           var temp = new Field(from.x + valX, from.y + valY);
           var piece = this.board.getPiece(temp);
           if (piece !== undefined && piece !== null && piece.color !== color) {
               temp = new Field(from.x + 2 * valX, from.y + 2 * valY);
               if (this.board.getPiece(temp) === null) return temp;
           }
           return null;
       }

        /**
         * Zamiana piona na damke, ustalenie czy bije dalej
         */
       private kingChange(jumped: boolean) {
           var x = [-1, -1, 1, 1];
           var y = [-1, 1, -1, 1];
           var king = new King(this);
           this.board.setPiece(this.position, king);
           this.captured = true;
           if (jumped == false) return false;
           for (var i = 0; i < 4; ++i) {
               if (king.findToJump(king.position, x[i], y[i], king.color) !== null) return true; // znalazl jakies bicie
           }
           return false; // nie znalazl zadnego bicia
       }
    }

    /**
     * Enumeracja koloru pionka
     */
    export enum PieceColor {
        Black, White
    } 
}