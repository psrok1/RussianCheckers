module View {
    /**
     * Klasa obiektu planszy widoku gry
     */
    export class Board {
        /** Widok na którym znajduje się plansza */
        private view: GameView; 
        /** Obiekt widoku planszy */
        private board: PIXI.Sprite;    
        /** Pola planszy */
        private fields: Field[];
        /** Pionki na planszy */
        private pieces: Piece[]; 
        
        /*
         * Konstruuje planszę i obiekty planszy
         * @param view Widok gry (rodzic)
         */
        constructor(view: GameView) {   
            // Ustawia widok
            this.view = view;
            
            this.board = new PIXI.Sprite(TextureManager.getInstance().getTexture("boardFrame"));
            this.board.anchor = new PIXI.Point(0.5, 0.5);
            this.board.position = new PIXI.Point(400, 300);
            this.view.getStage().addChild(this.board);

            // Konstruuje pola planszy
            this.fields = new Array();
            for (var y = 0; y < 8; y++)
                for (var x = 0; x < 8; x++) {
                    var field = new Field(new Model.Field(x, y), this);
                    this.fields.push(field);
                }
            // Konstruuje pionki planszy
            this.pieces = new Array();
            for (var i = 0; i < 24; i++)
                this.pieces.push(new Piece(this));
        }

        /**
         * Ustawia pionki na startowych pozycjach
         * Obraca planszę do neutralnej pozycji
         * Rejestruje w widoku przejście obracające planszę w stronę gracza
         * @param boardModel Model planszy
         * @param localPieces Kolor pionków gracza
         */
        public initialize(boardModel: Model.Board, localPieces: Model.PieceColor) {
            // Inicjalizuj czarne pionki
            for (var i = 0; i < 12; i++) {
                var pieceField = new Model.Field(0, Math.floor(i/4));
                pieceField.x = (i * 2) % 8 + ((pieceField.y+1) % 2);
                var pieceModel = boardModel.getPiece(pieceField);
                this.pieces[i].initialize(pieceModel, localPieces);
            }
            // Inicjalizuj biale pionki
            for (var i = 0; i < 12; i++) {
                var pieceField = new Model.Field(0, Math.floor(i / 4)+5);
                pieceField.x = (i * 2) % 8 + ((pieceField.y-5) % 2);
                var pieceModel = boardModel.getPiece(pieceField);
                this.pieces[i+12].initialize(pieceModel, localPieces);
            }
            /*
             * Tutaj wykonamy obrot planszy
             */
            this.board.rotation = -(Math.PI / 2);
            this.view.addTransition(
                new RotateTransition(
                    this.view,
                    this.board,
                    (localPieces == Model.PieceColor.White
                        ? RotateTransitionDirection.RIGHT
                        : RotateTransitionDirection.LEFT)));
        }

        /**
         * Ustawia handler zdarzenia kliknięcia dla wszystkich pionków
         * @param handler Funkcja obsługi zdarzenia
         */
        public onPieceClick(handler: (piece: Piece) => void) {
            for (var e in this.pieces)
                this.pieces[e].onClick(handler);
        }

        /**
         * Ustawia handler zdarzenia kliknięcia dla wszystkich pól
         * @param handler Funkcja obsługi zdarzenia
         */
        public onSelectedFieldClick(handler: (field: Field) => void) {
            for (var e in this.fields)
                this.fields[e].onSelectedClick(handler);   
        }

        /**
         * Ustawia wszystkie pola jako nieoznaczone
         */
        public unselectAllFields() {
            for (var e in this.fields)
                this.fields[e].unselect();
        }
        
        /**
         * Zmienia interaktywność
         * @param interactive Czy plansza ma reagować na mysz?
         */

        public setInteractive(interactive: boolean) {
            for (var e in this.pieces)
                this.pieces[e].setInteractive(interactive);
            for (var e in this.fields)
                this.fields[e].setInteractive(interactive);
        }

        /**
         * Pobiera obiekt pola widoku na podstawie obiektu pola modelu
         * @param field Obiekt pola modelu
         * @return Obiekt pola widoku
         */
        public getField(field: Model.Field): Field {
            return this.fields[field.y * 8 + field.x];
        }

        /**
         * Pobiera obiekt widoku odpowiadający planszy
         * @return Element widoku dla planszy
         */
        public getSprite(): PIXI.Sprite {
            return this.board;
        }
    }
} 