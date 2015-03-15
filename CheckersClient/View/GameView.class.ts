﻿module View {
    export class GameView extends View {
        // ...
        
        constructor() {
            super();
            // ...
        }

        public update() {
            // ...
        }

        public pause(): boolean {
            if (!super.pause())
                return false;
            // ...
            return true;
        }

        public resume() {
            if (!super.resume())
                return false;
            // ...
            return true;
        }
    }
} 