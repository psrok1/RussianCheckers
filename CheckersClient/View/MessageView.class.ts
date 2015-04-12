module View {
    /*
     * Klasa reprezentująca widok ładowania gry
     */
    export class MessageView extends View {
        private messageText: PIXI.Text;
        
        constructor() {
            super();
            this.messageText = new PIXI.Text("Hello world!", { font: "12px monospace", fill: "gray" });
            this.messageText.position.x = 400;
            this.messageText.position.y = 300;
            this.messageText.anchor.x = this.messageText.anchor.y = 0.5;
            this.getStage().addChild(this.messageText);
        }

        public setMessage(message: string) {
            this.messageText.setText(message);
        }
    }
} 