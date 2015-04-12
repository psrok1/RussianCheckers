module View {
    /*
     * Singleton reprezentujący menedżer tekstur widoku
     */
    export class TextureManager {
        private static instance: TextureManager = null;    // instancja obiektu singletona
        private textures: { [name: string]: PIXI.Texture } = {};   // kontener tekstur

        private progress: number;
        private progressMax: number;

        private onLoadedHandler: () => void = null;
        private onProgressHandler: (loadedTextureName: string) => void = null; 

        /*
         * Konstruktor 
         */
        constructor() {
            if (TextureManager.instance)
                throw new Error("ViewManager is a singleton. Instantiation failed.");
            // ...
            TextureManager.instance = this;
        }

        /*
         * Pobranie odnośnika do obiektu menedżera
         */
        public static getInstance(): TextureManager {
            if (!TextureManager.instance)
                TextureManager.instance = new TextureManager();
            return TextureManager.instance;
        }

        /*
         * Pobranie załadowanej tekstury na podstawie nazwy
         */
        public getTexture(name: string): PIXI.Texture {
            return this.textures[name];
        }

        /*
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

        /*
         * Wyzwalacz ładowania zadanej tekstury
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

        /*
         * Rozpoczęcie ładowania tekstur przez menedżer
         */
        public loadTextures() {
            this.progress = 0;
            this.progressMax = TEXTURES_TO_LOAD.length;
            this.textures = {};
            for (var e in TEXTURES_TO_LOAD)
                this.loadResource(TEXTURES_TO_LOAD[e]);
        }

        /*
         * Rejestracja handlera zdarzenia wywoływanego po załadowaniu wszystkich tekstur
         * przez menedżer
         */
        public onLoaded(handler: () => void) {
            this.onLoadedHandler = handler;
        }

        /*
         * Rejestracja handlera zdarzenia wywoływanego po załadowaniu tekstury przez
         * menedżer
         */
        public onProgress(handler: (loadedTextureName: string) => void) {
            this.onProgressHandler = handler;
        }
    }

    interface TextureData {
        name: string;
        file: string;
    }

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
            }

            // ...
        ]

} 