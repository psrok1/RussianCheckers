module View {
    /**
     * Klasa reprezentująca widok wiadomości
     */
    export class MessageView extends View {
        /** Tekst wiadomości */
        private messageText: PIXI.Text;
        
        /**
         * Konstruktor widoku wiadomości
         */
        constructor() {
            super();
            this.messageText = new PIXI.Text("Hello world!", { font: "12px monospace", fill: "gray" });
            this.messageText.position.x = 400;
            this.messageText.position.y = 300;
            this.messageText.anchor.x = this.messageText.anchor.y = 0.5;
            this.getStage().addChild(this.messageText);
        }

        /**
         * Metoda zmieniająca treść wiadomości
         * @param message Treść wyświetlanej wiadomości
         */
        public setMessage(message: string) {
            this.messageText.setText(message);
        }

        /**
         * Statyczna metoda przełączająca na ten widok i wyświetlająca zadaną wiadomość
         * @param message Treść wiadomości
         */
        public static showMessage(message: string) {
            (<MessageView>ViewManager.getInstance().getView("message")).setMessage(message);
            ViewManager.getInstance().switchView("message");
        }
    }
} 