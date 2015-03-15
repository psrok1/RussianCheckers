module View {
    export class LoaderView extends View {
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

        public resume(): boolean {
            if (!super.resume())
                return false;
            // ...
            return true;
        }
    }
} 