module Controller {
    /**
     * Adres serwera gry
     */
    var HOST_ADDRESS = "ws://"+window.location.hostname+":3000/";

    /**
     * Klasa reprezentująca interfejs sieciowy WebSocket za pośrednictwem którego
     * będzie odbywała się komunikacja z serwerem gry
     */
    export class WebClient {
        /** Wykorzystany do połączenia socket */
        private socket: WebSocket = null;
        /** Zdarzenie zestawienia połączenia z serwerem */
        private onConnectHandler: () => void = null;
        /** Zdarzenie niespodziewanego rozłączenia z serwerem */
        private onSuddenDisconnectHandler: () => void = function ()
        {
            View.MessageView.showMessage("Niespodziewana utrata łączności z serwerem.\nOdśwież stronę, aby spróbować ponownie.");
        }
        /** Zdarzenie krytycznego błędu połączenia */
        private onConnectionErrorHandler: () => void = function ()
        {
            View.MessageView.showMessage("Wystąpił błąd połączenia.\nOdśwież stronę, aby spróbować ponownie.");
        };
        /**
         * Zdarzenie wyzwalane po otrzymaniu odpowiedzi na żądanie rozpoczęcia nowej gry.
         * Komunikat zawiera kolor pionka jaki serwer wybrał dla gracza
         */
        private onServerHelloHandler: (localPieces: Model.PieceColor) => void = null;
        /**
         * Zdarzenie wyzwalane po otrzymaniu ruchów serwera gry.
         */
        private onServerMoveHandler: (from: Model.Field, moves: Model.Field[]) => void = null;
        /**
         * Zdarzenie wyzwalane, gdy serwer uzna, że gra jest zakończona.
         */
        private onServerEndHandler: (time: number, win: boolean) => void = null;
        /**
         * Zdarzenie wyzwalane po otrzymaniu bieżącego rankingu od serwera.
         */
        private onServerRankHandler: (times: number[]) => void = null;
        /** Flaga: czy rozłączenie było spodziewane? */
        private connectionClosed: boolean = false;

        /**
         * Wewnętrzny handler zdarzenia nadejścia nowej wiadomości
         * @param msg Wiadomość otrzymana od socketu
         */
        private onMessage(msg: MessageEvent) {
            // Deserializacja JSON
            var response: ServerResponse = JSON.parse(msg.data);
            // Specyficzne funkcje obsługi komunikatu
            var helloHandler = function (response: ServerHelloResponse) {
                if (!this.onServerHelloHandler)
                    return;
                if (response.pieces == "white")
                    this.onServerHelloHandler(Model.PieceColor.White);
                else if (response.pieces == "black")
                    this.onServerHelloHandler(Model.PieceColor.Black);
            }.bind(this);

            var moveHandler = function (response: ServerMoveResponse) {
                if (!this.onServerMoveHandler)
                    return;
                var strToField = function (str: string): Model.Field {
                    var xStr = ["A", "B", "C", "D", "E", "F", "G", "H"];
                    var yStr = ["8", "7", "6", "5", "4", "3", "2", "1"];

                    return new Model.Field(
                        xStr.indexOf(str.charAt(0)),
                        yStr.indexOf(str.charAt(1)));
                }
                var from = strToField(response.moves[0]);
                var to: Model.Field[] = [];
                for (var i = 1; i < response.moves.length; i++)
                    to.push(strToField(response.moves[i]));
                this.onServerMoveHandler(from, to);
            }.bind(this);

            var rankHandler = function (response: ServerRankResponse) {
                if (!this.onServerRankHandler)
                    return;
                this.onServerRankHandler(response.times.slice());
            }.bind(this);

            var endHandler = function (response: ServerEndResponse) {
                if (!this.onServerEndHandler)
                    return;
                this.onServerEndHandler(response.time, response.clientWin);
            }.bind(this);
            // Obsługa komunikatu
            switch (response.message) {
                case "hello":
                    helloHandler(<ServerHelloResponse>response);
                    break;
                case "move":
                    moveHandler(<ServerMoveResponse>response);
                    break;
                case "rank":
                    rankHandler(<ServerRankResponse>response);
                    break;
                case "end":
                    endHandler(<ServerEndResponse>response);
                    break;
                default:
                    if (this.onConnectionErrorHandler)
                        this.onConnectionErrorHandler();
            }
        }

        /**
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

        /**
         * Zamknięcie połączenia z serwerem
         */
        public close() {
            this.connectionClosed = true;
            this.socket.close();
        }
        
        /**
         * Metoda wysyłająca do serwera żądanie rozpoczęcia gry
         * W razie ustawienia auto - desiredColor = null
         * @param desiredColor Żądany przez gracza kolor pionka
         */

        public sayHello(desiredColor: Model.PieceColor) {
            var msg = JSON.stringify({
                message: "hello",
                pieces: (desiredColor === Model.PieceColor.White ? "white" :
                    (desiredColor === Model.PieceColor.Black ? "black" : "auto"))
            });
            this.socket.send(msg);
        }

        /**
         * Metoda wysyłająca do serwera sygnał o gotowości do gry
         */
        public sayReady() {
            var msg = JSON.stringify({
                message: "ready"
            });
            this.socket.send(msg);
        }

        /**
         * Metoda wysyłająca ruchy gracza do serwera
         */
        public sendMoves(moves: Model.Field[]) {
            var xStr = ["A", "B", "C", "D", "E", "F", "G", "H"];
            var yStr = ["8", "7", "6", "5", "4", "3", "2", "1"];
            var msgMoves: String[] = [];

            for (var e in moves)
                msgMoves.push(xStr[moves[e].x] + yStr[moves[e].y]);
            
            var msg = JSON.stringify({
                message: "move",
                moves: msgMoves
            });
            this.socket.send(msg);
        }

        /**
         * Metoda wysyłająca żądanie odczytania bieżącego rankingu
         */
        public requestRank() {
            var msg = JSON.stringify({
                message: "rank"
            });
            this.socket.send(msg);
        }

        /***** Metody rejestracji handlerów zdarzeń, tj. opisano powyżej *****/

        /**
         * Ustawienie handlera dla zdarzenia nowego połączenia
         * @param handler Funkcja obsługi zdarzenia
         */
        public onConnect(handler: () => void) {
            this.onConnectHandler = handler;
        }

        /**
         * Ustawienie handlera dla zdarzenia niespodziewanego rozłączenia
         * @param handler Funkcja obsługi zdarzenia
         */        
        public onSuddenDisconnect(handler: () => void) {
            this.onSuddenDisconnectHandler = handler;
        }

        /**
         * Ustawienie handlera dla zdarzenia krytycznego błędu połączenia
         * @param handler Funkcja obsługi zdarzenia
         */
        public onConnectionError(handler: () => void) {
            this.onConnectionErrorHandler = handler;
        }

        /**
         * Ustawienie handlera dla odpowiedzi na żądanie o stworzeniu nowej gry
         * @param handler Funkcja obsługi zdarzenia
         */
        public onServerHello(handler: (localPieces: Model.PieceColor) => void) {
            this.onServerHelloHandler = handler;
        }

        /**
         * Ustawienie handlera dla ruchu serwera
         * @param handler Funkcja obsługi zdarzenia
         */
        public onServerMove(handler: (from: Model.Field, moves: Model.Field[]) => void) {
            this.onServerMoveHandler = handler;
        }

        /**
         * Ustawienie handlera dla zdarzenia zakończenia gry decyzją serwera
         * @param handler Funkcja obsługi zdarzenia
         */
        public onServerEnd(handler: (time: number, win: boolean) => void) {
            this.onServerEndHandler = handler;
        }

        /**
         * Ustawienie handlera dla odpowiedzi zawierającej aktualizację rankingu
         * @param handler Funkcja obsługi zdarzenia
         */
        public onServerRank(handler: (times: number[]) => void) {
            this.onServerRankHandler = handler;
        }
    }


    /***** Interfejsy dla komunikatów protokołu *****/

    /**
     * Interfejs bazowy komunikatu
     */
    interface ServerResponse {
        message: string;
    }

    /**
     * Interfejs komunikatu o inicjalizacji gry przez serwer
     */
    interface ServerHelloResponse extends ServerResponse {
        pieces: string;
    }

    /**
     * Interfejs komunikatu o ruchu serwera
     */
    interface ServerMoveResponse extends ServerResponse {
        moves: string[];
    }

    /**
     * Interfejs komunikatu o zakończeniu gry przez serwer
     */
    interface ServerEndResponse extends ServerResponse {
        time: number;
        clientWin: boolean;
    }

    /**
     * Interfejs komunikatu zawierającego aktualizację rankingu
     */
    interface ServerRankResponse extends ServerResponse {
        times: number[];
    }
} 