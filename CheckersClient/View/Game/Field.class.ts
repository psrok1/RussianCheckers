module View {
    /*
     * Klasa obiektu pola na planszy widoku gry
     */
    export class Field {
        private state: FieldState;      // Kolor i stan pola
        private field: PIXI.Sprite;     // Obiekt widoku
        private position: Model.Field;  // Pozycja pola na planszy
        private board: Board;           // Obiekt planszy

        /*
         * Zarejestrowany handler obsługi zdarzenia wciśniecia oznaczonego pola
         */
        private onSelectedClickHandler: (field: Field) => void = null;

        /*
         * Konstruktor tworzący obiekt pola na planszy
         */
        constructor(field: Model.Field, board: Board) {
            this.position = field.clone();
            this.field = new PIXI.Sprite(TextureManager.getInstance().getTexture("fieldWhite"));
            this.field.position = new PIXI.Point(field.x * 48 - 192, field.y * 48 - 192);
            this.unselect();
            this.board = board;
            this.board.getSprite().addChildAt(this.field, 0);
            this.field.click = function () {
                if (this.onSelectedClickHandler && this.state === FieldState.Selected)
                    this.onSelectedClickHandler(this);
            }.bind(this);
        }

        /*
         * Aktualizacja tekstury pola w zależności od stanu
         */
        private updateTexture() {
            var texture: PIXI.Texture = null;
            var manager = TextureManager.getInstance();
            switch (this.state) {
                case FieldState.Black:
                    texture = manager.getTexture("fieldBlack");
                    break;
                case FieldState.White:
                    texture = manager.getTexture("fieldWhite");
                    break;
                case FieldState.Selected:
                    texture = manager.getTexture("fieldSelected");
                    break;
            }
            if (texture)
                this.field.setTexture(texture);
        }

        /*
         * Zaznaczenie pola
         */
        public select() {
            this.state = FieldState.Selected;
            this.updateTexture();
        }

        /*
         * Odznaczenie pola
         */
        public unselect() {
            if (((this.position.y % 2) == 0 && (this.position.x % 2) != 0) ||
                ((this.position.y % 2) != 0 && (this.position.x % 2) == 0))
                this.state = FieldState.Black;
            else
                this.state = FieldState.White;
            this.updateTexture();
        }

        /*
         * Zmiana interaktywności
         */

        public setInteractive(interactive: boolean) {
            this.field.interactive = interactive;
        }

        /*
         * Rejestracja handlera zdarzenia wciśnięcia oznaczonego pola
         */
        public onSelectedClick(handler: (field: Field) => void) {
            this.onSelectedClickHandler = handler;
        }

        /*
         * Pobranie pozycji pola
         */
        public getModelField(): Model.Field {
            return this.position;
        }
    }

    /*
     * Enumeracja oznaczająca kolor i stan pola
     */
    enum FieldState {
        Black,
        White,
        Selected
    };
} 