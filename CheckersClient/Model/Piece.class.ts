module Model {
    export class Piece {
        protected color: PieceColor;
        protected board: Board;
        protected position: Field;
        // Flaga informująca, że pionek został zbity
        protected captured: boolean = false;
        // Lista obserwatorów obiektu
        protected observers: View.ModelObserver<Piece>[] = [];
        /*
         * Bufor ruchów niezrealizowanych po stronie serwera
         * Kontroler na podstawie tego bufora, aktualnej pozycji i wiedzy
         * jaki pionek wykonywal ruch: odtworzy ten ruch i wysle na serwer
         */
        private positionCache: Field[] = [];

        constructor(color: PieceColor, board: Board, position: Field) {
            /*
             * TODO: Konstruktor
             */
        }

        public getPossibilities(): Field[] {
            /*
             * TODO: Pobiera listę możliwych ruchów dla danego pionka
             */
            return [];
        }

        public move(to: Field): boolean {
            /*
             * TODO: Metoda przesuwająca pionek na zadaną pozycję
             * 
             * Powinna uwzględniać (zalecana kolejność):
             * - Dodawać starą pozycję do positionCache
             * - Sam ruch (+this.update())
             * - Bicie (+zbijany.update()) [może prywatna metoda?]
             * - Zamianę pionka na damkę (+this_damka.update())
             * - Zwracać czy z danej pozycji jest możliwe dalsze bicie
             * 
             * Wskazane użycie chronionych metod pomocniczych.
             * Każda zmiana stanu jakiegos pionka w modelu (przesunięcie, zbicie etc.)
             * powinna zaskutkować poinformowaniem widoku poprzez metodę tego pionka update()
             * Przy zmianie na damke, update() powinno byc wykonane z obiektu damki.
             */
            return false;
        }

        public popFromCache(): Field[] {
            var cache: Field[] = this.positionCache;
            this.positionCache = [];
            return cache;
        }

        public bindObserver(observer: View.ModelObserver<Piece>)
        {
            /*
             * TODO: Dodaje obserwatora do listy obserwatorow
             */
        }

        public update() {
            for (var o in this.observers)
                this.observers[o].notify(this);
        }
    }

    export class King extends Piece {

        /*
         * TODO: Tutaj konstruktor, ktory przyjmuje za argument pionek, ktory ma zastapic
         * Przepisuje (lub klonuje) jego atrybuty, razem z lista obserwatorow
         * Klonowanie tablicy można przeprowadzić przez 
         * this.observers = piece.observers.slice();
         * constructor(piece: Piece) { } 
         * Konstruktor musi zawierać na początku wywołanie super(...), które wywołuje konstruktor
         * klasy nadrzędnej
         */

        public getPossibilities(): Field[]{
            /*
             * TODO: Damka ma inne mozliwosci
             */
            return [];
        }

        public move(to: Field): boolean {
            /*
             * TODO: Metoda przesuwająca pionek dla damki
             * - nie uwzględniamy zmiany na damkę
             * - nieco inaczej przewidujemy czy jest mozliwe dalsze bicie
             */
            return false;
        }
    }

    export enum PieceColor {
        Black, White
    } 
}