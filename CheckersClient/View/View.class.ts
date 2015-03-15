module View {
    export /*abstract*/ class View {
        private paused: boolean;

        constructor() { }
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
    }
} 