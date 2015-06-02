module View {
    /**
     * Singleton reprezentujący menedżer tekstur widoku
     */
    export class TextureManager {
        /** Instancja obiektu menedżera tekstur */
        private static instance: TextureManager = null;
        /** Kontener tekstur */
        private textures: { [name: string]: PIXI.Texture } = {};

        /** Postęp ładowania tekstur */
        private progress: number;
        /** Maksymalna wartość postępu */
        private progressMax: number;

        /** Handler zdarzenia zakończenia ładowania tekstur */
        private onLoadedHandler: () => void = null;
        /** Handler zdarzenia zakończenia ładowania pojedyńczej tekstury */
        private onProgressHandler: (loadedTextureName: string) => void = null; 

        /**
         * Konstruktor menedżera
         */
        constructor() {
            if (TextureManager.instance)
                throw new Error("ViewManager is a singleton. Instantiation failed.");
            // ...
            TextureManager.instance = this;
        }

        /**
         * Pobranie odnośnika do obiektu menedżera
         */
        public static getInstance(): TextureManager {
            if (!TextureManager.instance)
                TextureManager.instance = new TextureManager();
            return TextureManager.instance;
        }

        /**
         * Pobranie załadowanej tekstury na podstawie nazwy
         * @param name Nazwa tekstury
         * @return Tekstura o zadanej nazwie
         */
        public getTexture(name: string): PIXI.Texture {
            return this.textures[name];
        }

        /**
         * Prywatna metoda wywoływana po załadowaniu tekstury przez menedżer
         */
        private postloadAction() {
            var that: TextureManager = (<any>this).that;
            var textureName: string = (<any>this).textureName;
            that.progress++;
            that.onProgressHandler(textureName);
            if (that.progress === that.progressMax)
                that.onLoadedHandler();
        }

        /**
         * Wyzwalacz ładowania zadanej tekstury
         * @param data Informacje o teksturze do załadowania
         */
        private loadResource(data: TextureData) {
            var texture: PIXI.Texture = PIXI.Texture.fromImage(data.file);
            this.textures[data.name] = texture;
            if (!texture.baseTexture.hasLoaded)
                texture.baseTexture.addEventListener("loaded",
                    this.postloadAction.bind({ that: this, textureName: data.name }));
            else
                this.postloadAction.call({ that: this, textureName: data.name });
        }

        /**
         * Rozpoczęcie ładowania tekstur przez menedżer
         */
        public loadTextures() {
            this.progress = 0;
            this.progressMax = TEXTURES_TO_LOAD.length;
            this.textures = {};
            for (var e in TEXTURES_TO_LOAD)
                this.loadResource(TEXTURES_TO_LOAD[e]);
        }

        /**
         * Rejestracja handlera zdarzenia wywoływanego po załadowaniu wszystkich tekstur
         * przez menedżer
         * @param handler Funkcja obsługi zdarzenia
         */
        public onLoaded(handler: () => void) {
            this.onLoadedHandler = handler;
        }

        /*
         * Rejestracja handlera zdarzenia wywoływanego po załadowaniu tekstury przez
         * menedżer
         * @param handler Funkcja obsługi zdarzenia
         */
        public onProgress(handler: (loadedTextureName: string) => void) {
            this.onProgressHandler = handler;
        }
    }

    /**
     * Typ dla informacji o teksturze do załadowania
     */
    type TextureData = {
        name: string;
        file: string;
    }

    /**
     * Zestaw tekstur do załadowania przez menedżer
     */
    var TEXTURES_TO_LOAD: TextureData[] =
        [
            {
                name: "gameBackground",
                file: "Textures/game_bg.jpg"
            },
            {
                name: "boardFrame",
                file: "Textures/plansza.png"
            },
            {
                name: "fieldWhite",
                file: "Textures/field_w.png"
            },
            {
                name: "fieldBlack",
                file: "Textures/field_b.png"
            },
            {
                name: "fieldSelected",
                file: "Textures/field_sel.png"
            },
            {
                name: "pieceWhite",
                file: "Textures/piece_w.png"
            },
            {
                name: "pieceBlack",
                file: "Textures/piece_b.png"
            },
            {
                name: "pieceAuto",
                file: "Textures/piece_wb.png"
            },
            {
                name: "pieceWhiteKing",
                file: "Textures/piece_w_king.png"
            },
            {
                name: "pieceBlackKing",
                file: "Textures/piece_b_king.png"
            },
            {
                name: "title",
                file: "Textures/title.png"
            },
            {
                name: "turnWhite",
                file: "Textures/turn_w.png"
            },
            {
                name: "turnBlack",
                file: "Textures/turn_b.png"
            },
            {
                name: "turnWhiteDisabled",
                file: "Textures/turn_w_dis.png"
            },
            {
                name: "turnBlackDisabled",
                file: "Textures/turn_b_dis.png"
            }
            // ...
        ]

} 