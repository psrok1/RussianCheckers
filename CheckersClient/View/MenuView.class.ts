module View {
    /**
     * Klasa reprezentująca widok menu gry
     */
    export class MenuView extends View {
        /** Przycisk wyboru białych pionków */
        private whiteButton: ColorSelectionButton;
        /** Przycisk wyboru dowolnych pionków */
        private autoButton: ColorSelectionButton;
        /** Przycisk wyboru czarnych pionków */
        private blackButton: ColorSelectionButton;
        /** Przycisk rozpoczęcia gry */
        private startButton: PIXI.Text;
        /** Czasy rankingu */
        private bestTimes: PIXI.Text[] = [];

        /** Wybrany kolor pionka */
        private selectedColor: SelectedColor = SelectedColor.Auto;
        /** Handler obsługi zdarzenia rozpoczęcia gry */
        private onStartGameHandler: (selectedColor: SelectedColor) => void = null;
        
        /**
         * Konstruktor widoku menu
         */
        constructor() {
            super();
            this.getStage().interactive = true;
            
            var background = new PIXI.Sprite(
                TextureManager.getInstance().getTexture("gameBackground"));
            background.position = new PIXI.Point(0, 0);
            this.getStage().addChild(background);

            var title = new PIXI.Sprite(
                TextureManager.getInstance().getTexture("title"));
            title.anchor = new PIXI.Point(0.5, 0.5);
            title.position = new PIXI.Point(400, 100);
            this.getStage().addChild(title);

            var bestTimesLabel = new PIXI.Text("Najlepsze czasy:", {
                font: "24px monospace",
                fill: "#efe4b0",
                align: "center"
            });
            bestTimesLabel.anchor = new PIXI.Point(0.5, 0.5);
            bestTimesLabel.position = new PIXI.Point(400, 160);
            this.getStage().addChild(bestTimesLabel);
            
            for (var i = 0; i < 5; i++) {
                var bestTime = new PIXI.Text("-", {
                    font: (([24,20,16,14,12])[i])+"px monospace",
                    fill: "#efe4b0",
                    align: "center"
                });
                bestTime.anchor = new PIXI.Point(0.5, 0.5);
                bestTime.position = new PIXI.Point(400, 190 + (30 * i));
                this.getStage().addChild(bestTime);
                this.bestTimes.push(bestTime);
            }

            var bestTimesLabel = new PIXI.Text("Wybierz kolor pionka", {
                font: "24px monospace",
                fill: "#efe4b0",
                align: "center"
            });
            bestTimesLabel.anchor = new PIXI.Point(0.5, 0.5);
            bestTimesLabel.position = new PIXI.Point(400, 380);
            this.getStage().addChild(bestTimesLabel);

            this.whiteButton = new ColorSelectionButton(
                TextureManager.getInstance().getTexture("pieceWhite"));
            this.whiteButton.position = new PIXI.Point(288, 400);
            this.whiteButton.onSelect(function () {
                this.selectedColor = SelectedColor.White;
                this.updateSelection();
            }.bind(this));
            this.getStage().addChild(this.whiteButton);

            this.autoButton = new ColorSelectionButton(
                TextureManager.getInstance().getTexture("pieceAuto"));
            this.autoButton.position = new PIXI.Point(368, 400);
            this.autoButton.onSelect(function () {
                this.selectedColor = SelectedColor.Auto;
                this.updateSelection();
            }.bind(this));
            this.autoButton.select();
            this.getStage().addChild(this.autoButton);

            this.blackButton = new ColorSelectionButton(
                TextureManager.getInstance().getTexture("pieceBlack"));
            this.blackButton.position = new PIXI.Point(448, 400);
            this.blackButton.onSelect(function () {
                this.selectedColor = SelectedColor.Black;
                this.updateSelection();
            }.bind(this));
            this.getStage().addChild(this.blackButton);

            this.startButton = new PIXI.Text("Rozpocznij grę", {
                font: "28px monospace",
                fill: "#efe4b0",
                align: "center"
            });
            this.startButton.anchor = new PIXI.Point(0.5, 0.5);
            this.startButton.position = new PIXI.Point(400, 540);
            this.startButton.interactive = true;
            this.startButton.click = function () {
                if (this.onStartGameHandler) {
                    this.onStartGameHandler(this.selectedColor);
                }
            }.bind(this);
            this.startButton.mouseover = function () {
                document.body.style.cursor = "pointer";
            }.bind(this);
            this.startButton.mouseout = function () {
                document.body.style.cursor = "default";
            }.bind(this);
            this.getStage().addChild(this.startButton);
        }

        /**
         * Aktualizacja stanu przycisków po wciśnięciu któregoś.
         * Przyciski powinny działać jak RadioButton.
         * Wybrany powinien się zaświecić, reszta zgasnąć.
         */
        private updateSelection() {
            var buttons: ColorSelectionButton[] =
                [this.whiteButton, this.blackButton, this.autoButton];

            for (var i = 0; i < buttons.length; i++)
                buttons[i].unselect();
            buttons[this.selectedColor].select();
        }

        /**
         * Rejestracja handlera zdarzenia rozpoczęcia gry
         * @param handler Funkcja obsługi zdarzenia
         */
        public onStartGame(handler: (selectedColor: SelectedColor) => void) {
            this.onStartGameHandler = handler;
        }

        /**
         * Metoda aktualizująca wyświetlany ranking
         */
        public updateRank(formattedTimes: string[]) {
            for (var i = 0; i < 5; i++)
                this.bestTimes[i].setText(formattedTimes[i]);
        }

        /**
         * Metoda zmieniająca interaktywność widoku
         * @param interactive Czy widok powinien reagować na zdarzenia myszy?
         */
        public setInteractive(interactive: boolean) {
            this.stage.interactive = interactive;
            this.startButton.interactive = interactive;
        }

        /**
         * Metoda wywoływana przez menedżer widoków przy wstrzymaniu tego widoku
         * (gdy widok jest przełączany na inny)
         */
        public pause(): boolean {
            if (!super.pause())
                return false;
            this.setInteractive(false);
            document.body.style.cursor = "default";
            return true;
        }

        /**
         * Metoda wywoływana przez menedżer widoków przy wznawianiu tego widoku
         * (gdy przełączamy na ten widok)
         */
        public resume() {
            if (!super.resume())
                return false;
            this.setInteractive(true);
            return true;
        }
    }

    /**
     * Enumeracja wybranego koloru pionka
     */
    export const enum SelectedColor {
        White,
        Black,
        Auto
    }

    /** 
     * Przycisk wyboru koloru pionka 
     */
    class ColorSelectionButton extends PIXI.Graphics {
        /** Kolor przycisku, który nie został wybrany */
        private static NSELECTED_COLOR = 0x202020;
        /** Kolor wybranego przycisku */
        private static SELECTED_COLOR = 0x606060;

        /** Handler zdarzenia wciśnięcia przycisku */
        private onSelectHandler: () => void = null;

        /**
         * Konstruktor przycisku
         * @param texture Tekstura przycisku (pionek)
         */
        constructor(texture: PIXI.Texture) {
            super();
            super.beginFill(ColorSelectionButton.NSELECTED_COLOR, 1);
            super.lineStyle(1, 0x404040, 1);
            super.drawRect(0, 0, 64, 64);
            super.endFill();
            this.interactive = true;
            this.click = function () {
                if (this.onSelectHandler)
                    this.onSelectHandler();
            }.bind(this);

            var sprite = new PIXI.Sprite(texture);
            sprite.anchor = new PIXI.Point(0.5, 0.5);
            sprite.position = new PIXI.Point(32, 32);
            super.addChild(sprite);
        }

        /**
         * Oznaczenie przycisku jako zapalony
         */
        public select() {
            super.beginFill(ColorSelectionButton.SELECTED_COLOR, 1);
            super.lineStyle(1, 0x404040, 1);
            super.drawRect(0, 0, 64, 64);
            super.endFill();
        }

        /**
         * Oznaczenie przycisku jako zgaszony
         */
        public unselect() {
            super.beginFill(ColorSelectionButton.NSELECTED_COLOR, 1);
            super.lineStyle(1, 0x404040, 1);
            super.drawRect(0, 0, 64, 64);
            super.endFill();
        }

        /** 
         * Rejestracja handlera zdarzenia wciśnięcia przycisku wyboru
         * @param handler Funkcja obsługi zdarzenia
         */
        public onSelect(handler: () => void) {
            this.onSelectHandler = handler;
        }
    }
} 