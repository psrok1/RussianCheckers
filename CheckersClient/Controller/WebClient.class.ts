module Controller {
    /*
     * Adres serwera gry
     */
    var HOST_ADDRESS = "ws://127.0.0.1/";

    /*
     * Klasa reprezentująca interfejs sieciowy WebSocket za pośrednictwem którego
     * będzie odbywała się komunikacja z serwerem gry
     */
    export class WebClient {
        private socket: WebSocket = null;
        // Zdarzenie zestawienia połączenia z serwerem
        private onConnectHandler: () => void = null;
        // Zdarzenie niespodziewanego rozłączenia z serwerem
        private onSuddenDisconnectHandler: () => void = null;
        // Zdarzenie krytycznego błędu połączenia
        private onConnectionErrorHandler: () => void = null;
        /*
         * Zdarzenie wyzwalane po otrzymaniu odpowiedzi na żądanie rozpoczęcia nowej gry.
         * Komunikat zawiera kolor pionka jaki serwer wybrał dla gracza
         */
        private onServerHelloHandler: (localPieces: Model.PieceColor) => void = null;
        /*
         * Zdarzenie wyzwalane po otrzymaniu ruchów serwera gry.
         */
        private onServerMoveHandler: (from: Model.Field, moves: Model.Field[]) => void = null;
        /*
         * Zdarzenie wyzwalane, gdy serwer uzna, że gra jest zakończona.
         */
        private onServerEndHandler: (time: number) => void = null;
        // Flaga: czy rozłączenie było spodziewane?
        private connectionClosed: boolean = false;

        /*
         * Wewnętrzny handler zdarzenia nadejścia nowej wiadomości
         */
        private onMessage(msg: MessageEvent) {
            /*
             * TODO
             */
        }

        /*
         * Otwarcie połączenia z serwerem
         */
        public open() {
            this.connectionClosed = false;
            this.socket = new WebSocket(HOST_ADDRESS);
            this.socket.onopen = function (evt: Event) {
                if(this.onConnectHandler)
                    this.onConnectHandler();
            }.bind(this);
            this.socket.onclose = function (evt: Event) {
                if (!this.connectionClosed && this.onSuddenDisconnectHandler)
                    this.onSuddenDisconnectHandler();
            }.bind(this);
            this.socket.onerror = function (evt: ErrorEvent) {
                if (this.onConnectionErrorHandler)
                    this.onConnectionErrorHandler();
            }.bind(this);
            this.socket.onmessage = this.onMessage.bind(this);
        }

        /*
         * Zamknięcie połączenia z serwerem
         */
        public close() {
            this.connectionClosed = true;
            this.socket.close();
        }

        /***** Metody rejestracji handlerów zdarzeń, tj. opisano powyżej *****/

        public onConnect(handler: () => void) {
            this.onConnectHandler = handler;
        }
        
        public onSuddenDisconnect(handler: () => void) {
            this.onSuddenDisconnectHandler = handler;
        }

        public onConnectionError(handler: () => void) {
            this.onConnectionErrorHandler = handler;
        }

        public onServerHello(handler: (localPieces: Model.PieceColor) => void) {
            this.onServerHelloHandler = handler;
        }

        public onServerMove(handler: (from: Model.Field, moves: Model.Field[]) => void) {
            this.onServerMoveHandler = handler;
        }

        public onServerEnd(handler: (time: number) => void) {
            this.onServerEndHandler = handler;
        }
    }
} 