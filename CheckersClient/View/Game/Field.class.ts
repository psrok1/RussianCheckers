module View {
    export class Field {
        private state: FieldState;
        private field: PIXI.Sprite;
        private position: Model.Field;

        constructor(field: Model.Field) {

        }

        public select() {

        }

        public unselect() {

        }

        public onSelectedClick(handler: (field: Field) => void) {

        }
    }

    enum FieldState {
        Black,
        White,
        Selected
    };
} 