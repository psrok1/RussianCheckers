module View {
    /*
     * Klasa reprezentująca widok menu gry
     */
    export class MenuView extends View {
        private whiteButton: ColorSelectionButton;
        private autoButton: ColorSelectionButton;
        private blackButton: ColorSelectionButton;
        private bestTimes: PIXI.Text[] = [];

        private selectedColor: SelectedColor = SelectedColor.Auto;
        private onStartGameHandler: (selectedColor: SelectedColor) => void = null;
        // ...
        
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

            var startButton = new PIXI.Text("Rozpocznij grę", {
                font: "28px monospace",
                fill: "#efe4b0",
                align: "center"
            });
            startButton.anchor = new PIXI.Point(0.5, 0.5);
            startButton.position = new PIXI.Point(400, 540);
            startButton.interactive = true;
            startButton.click = function () {
                if (this.onStartGameHandler) {
                    this.onStartGameHandler(this.selectedColor);
                }
            }.bind(this);
            startButton.mouseover = function () {
                document.body.style.cursor = "pointer";
            }.bind(this);
            startButton.mouseout = function () {
                document.body.style.cursor = "default";
            }.bind(this);
            this.getStage().addChild(startButton);
        }

        private updateSelection() {
            var buttons: ColorSelectionButton[] =
                [this.whiteButton, this.blackButton, this.autoButton];

            for (var i = 0; i < buttons.length; i++)
                buttons[i].unselect();
            buttons[this.selectedColor].select();
        }

        public onStartGame(handler: (selectedColor: SelectedColor) => void) {
            this.onStartGameHandler = handler;
        }

        public updateRank(formattedTimes: string[]) {
            for (var i = 0; i < 5; i++)
                this.bestTimes[i].setText(formattedTimes[i]);
        }

        //public update() { }

        public pause(): boolean {
            if (!super.pause())
                return false;
            document.body.style.cursor = "default";
            return true;
        }

        //public resume() {
        //    if (!super.resume())
        //        return false;
        //    // ...
        //    return true;
        //}
    }

    export const enum SelectedColor {
        White,
        Black,
        Auto
    }

    class ColorSelectionButton extends PIXI.Graphics {
        private static NSELECTED_COLOR = 0x202020;
        private static SELECTED_COLOR = 0x606060;

        private onSelectHandler: () => void = null;

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

        public select() {
            super.beginFill(ColorSelectionButton.SELECTED_COLOR, 1);
            super.lineStyle(1, 0x404040, 1);
            super.drawRect(0, 0, 64, 64);
            super.endFill();
        }

        public unselect() {
            super.beginFill(ColorSelectionButton.NSELECTED_COLOR, 1);
            super.lineStyle(1, 0x404040, 1);
            super.drawRect(0, 0, 64, 64);
            super.endFill();
        }

        public onSelect(handler: () => void) {
            this.onSelectHandler = handler;
        }
    }
} 