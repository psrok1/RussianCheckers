module View {
    /**
     * Singleton reprezentujący menedżer widoków aplikacji
     */
    export class ViewManager {
        /** Instancja menedżera */
        private static instance: ViewManager = null;
        /** Kontener widoków */
        private views: { [name: string]: View } = {};
        /** Aktualnie wyświetlany widok */
        private currentView: View = null;
        /** Obiekt silnika renderującego */
        private renderer: Renderer;
    
        /**
         * Konstruktor 
         */
        constructor() {
            if (ViewManager.instance)
                throw new Error("ViewManager is a singleton. Instantiation failed.");
            this.renderer = new Renderer();
            requestAnimationFrame(this.update);
            ViewManager.instance = this;
        }

        /**
         * Pobranie odnośnika do obiektu menedżera
         */
        public static getInstance(): ViewManager {
            if (!ViewManager.instance)
                ViewManager.instance = new ViewManager();
            return ViewManager.instance;
        }

        /**
         * Callback aktualizujący widok i rysujący kolejną klatkę
         */
        public update() {
            requestAnimationFrame(function () { this.update() }.bind(ViewManager.getInstance()));

            if (!this.currentView || this.currentView.isPaused())
                return;
            this.currentView.update();
            this.renderer.render(this.currentView.getStage());
        }

        /**
         * Rejestracja widoku
         * @param name Nazwa widoku
         * @param view Obiekt rejestrowanego widoku
         */
        public registerView(name: string, view: View): View {
            if (this.views[name])
                return this.views[name];
            this.views[name] = view;
            return view;
        }

        /**
         * Zmiana aktualnie wyświetlanego widoku
         * @param name Nazwa widoku, na który chcemy się przełączyć
         */
        public switchView(name: string): View {
            if (this.views[name]) {
                if (this.currentView)
                    this.currentView.pause();
                this.currentView = this.views[name];
                this.currentView.resume();
                return this.currentView;
            } else
                return undefined;
        }

        /**
         * Pobranie obiektu widoku o danej nazwie
         * @param Nazwa poszukiwanego widoku
         * @return Obiekt widoku o zadanej nazwie
         */
        public getView(name: string): View {
            if (this.views[name])
                return this.views[name];
            else
                return undefined;
        }
    }

    /**
     * Klasa opakowująca silnik renderujący
     * Inicjalizuje silnik i obsługuje zdarzenie resize okna, aby
     * skalować kanwę w zależności od rozmiaru okna przeglądarki.
     */
    class Renderer {
        /** Obiekt silnika renderującego dostarczanego przez PIXI */
        private renderer: PIXI.PixiRenderer;

        /** Aktualna skala kanwy */
        private ratio: number = 1;
        /** Pierwotna szerokość */ 
        private defaultWidth: number = 800;
        /** Pierwotna wysokość */
        private defaultHeight: number = 600;
        /** Przeskalowana szerokość */
        private width: number;
        /** Przeskalowana wysokość */
        private height: number;

        /**
         * Konstruktor renderera
         */
        constructor() {
            this.renderer = PIXI.autoDetectRenderer(this.defaultWidth, this.defaultHeight);
            this.width = this.defaultWidth;
            this.height = this.defaultHeight;

            document.body.appendChild(this.renderer.view);
            this.renderer.view.style.position = "absolute";
            this.rescale();
            window.addEventListener("resize", this.rescale.bind(this), false);
        }

        /**
         * Handler zdarzenia resize
         */
        private rescale() {
            this.ratio = Math.min(window.innerWidth / this.defaultWidth,
                window.innerHeight / this.defaultHeight);
            this.width = this.defaultWidth * this.ratio;
            this.height = this.defaultHeight * this.ratio;
            this.renderer.resize(this.width, this.height);
            this.renderer.view.style.left = window.innerWidth / 2 - this.width / 2 + "px";
            this.renderer.view.style.top = window.innerHeight / 2 - this.height / 2 + "px";
        }

        /**
         * Skalowanie obiektów widoku
         * @param displayObject Obiekt podlegający przeskalowaniu
         * @param ratio Skala
         */
        private applyRatio(displayObject: PIXI.DisplayObjectContainer, ratio: number) {
            if (ratio == 1) return;
            displayObject.position.x *= ratio;
            displayObject.position.y *= ratio;
            displayObject.scale.x *= ratio;
            displayObject.scale.y *= ratio;

            // PIXI don't need recursive scaling
            if (!displayObject.parent)
                for (var i = 0; i < displayObject.children.length; ++i)
                    this.applyRatio(<PIXI.DisplayObjectContainer>displayObject.children[i], ratio);
        }

        /**
         * Rysowanie sceny uwzględniając zastosowaną skalę
         * @param stage Rysowana scena
         */
        public render(stage: PIXI.Stage) {
            this.applyRatio(stage, this.ratio);
            this.renderer.render(stage);
            this.applyRatio(stage, 1 / this.ratio);
        }
    }
} 