module Model {
    export class GameModel {
        private board: Board;

        private localPieces: PieceColor;
        private localTurn: boolean;
        private gameTime: number;
        
        constructor(localPieces: PieceColor) {
            this.board = new Board();
            this.localPieces = localPieces;
            this.localTurn = ((localPieces === PieceColor.White) ? true : false);
            this.gameTime = 0;
        }

        public switchTurn() {
            this.localTurn = !this.localTurn;
        }

        public isLocalTurn() {
            return this.localTurn;
        }

        public nextClockTick() {
            if (this.localTurn) ++this.gameTime;
        }

        public getClockTicks(): number {
            return this.gameTime;
        }

        public syncClockTicks(serverTime: number) {
            this.gameTime = serverTime;
        }

        public getFormattedClockTicks(): string {
            var m = Math.floor(this.gameTime / 60)
            var s = (this.gameTime % 60);
            return m + ":" + (s < 10 ? "0" + s : s);
        }

        public getBoard(): Board {
            return this.board;
        }

        public getLocalPieces(): PieceColor {
            return this.localPieces;
        }
    }
}