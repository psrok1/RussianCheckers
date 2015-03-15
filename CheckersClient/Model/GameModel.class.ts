module Model {
    export class GameModel {
        private board: Board;

        private localPlayer: Player;
        private remotePlayer: Player;
        private whoseTurn: Player;

        private timeRemaining: number;
    }
}