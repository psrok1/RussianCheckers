module Model {
    /**
     * Model gry
     */
    export class GameModel {
        /** Plansza gry */
        private board: Board;

        /** Kolor pionków gracza */
        private localPieces: PieceColor;
        /** Flaga oznaczająca kolej gracza */
        private localTurn: boolean;
        /** Lokalny czas gry */
        private gameTime: number;
        
        /**
         * Konstruktor modelu gry
         * @param localPieces Kolor pionków gracza
         */
        constructor(localPieces: PieceColor) {
            this.board = new Board();
            this.localPieces = localPieces;
            this.localTurn = ((localPieces === PieceColor.White) ? true : false);
            this.gameTime = 0;
        }

        /**
         * Przełączenie kolejki w grze
         */
        public switchTurn() {
            this.localTurn = !this.localTurn;
        }

        /**
         * Czy kolej gracza?
         * @return Zwraca true, jeśli kolej gracza
         */
        public isLocalTurn(): boolean {
            return this.localTurn;
        }

        /**
         * Następne tyknięcie zegara gry
         */
        public nextClockTick() {
            if (this.localTurn) ++this.gameTime;
        }

        /**
         * Pobiera aktualny czas gry
         */
        public getClockTicks(): number {
            return this.gameTime;
        }

        /**
         * Synchronizuje stan lokalnego zegara z czasem otrzymanym od serwera
         */
        public syncClockTicks(serverTime: number) {
            this.gameTime = serverTime;
        }

        /**
         * Pobiera sformatowany czas gry
         */
        public getFormattedClockTicks(): string {
            var m = Math.floor(this.gameTime / 60)
            var s = (this.gameTime % 60);
            return m + ":" + (s < 10 ? "0" + s : s);
        }

        /**
         * Pobiera model planszy dla danej gry
         * @return Plansza gry
         */
        public getBoard(): Board {
            return this.board;
        }

        /**
         * Pobiera kolor pionków gracza
         * @return Kolor pionków gracza
         */
        public getLocalPieces(): PieceColor {
            return this.localPieces;
        }
    }
}