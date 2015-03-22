module View {
    export /*abstract*/ class View {
        private paused: boolean;
        protected stage: PIXI.Stage;

        constructor() {
            this.stage = new PIXI.Stage(0);
        }
        public update() { }
        public pause(): boolean {
            if (!this.paused) {
                this.paused = true;
                return true;
            } else
                return false;
        }

        public resume(): boolean {
            if (this.paused) {
                this.paused = false;
                return true;
            } else
                return false;
        }

        public isPaused(): boolean {
            return this.paused;
        }

        public getStage(): PIXI.Stage {
            return this.stage;
        }
    }
} 