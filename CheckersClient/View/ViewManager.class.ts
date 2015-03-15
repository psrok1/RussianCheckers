module View {
    export class ViewManager {
        private static instance: ViewManager = null;
        private views: { [name: string]: View } = {};
        private currentView: View = null;

        constructor() {
            if (ViewManager.instance)
                throw new Error("ViewManager is a singleton. Instantiation failed.");
            // ...
            ViewManager.instance = this;
        }

        public static getInstance(): ViewManager {
            if (!ViewManager.instance)
                ViewManager.instance = new ViewManager();
            return ViewManager.instance;
        }

        public update() {
            requestAnimationFrame(function () { this.render() }.bind(ViewManager.getInstance()));

            if (!this.currentView || this.currentView.isPaused())
                return;
            this.currentView.update();
            // ...
        }

        public registerView(name: string, view: View): View {
            if (this.views[name])
                return this.views[name];
            this.views[name] = view;
            return view;
        }

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

        public getView(name: string): View {
            if (this.views[name])
                return this.views[name];
            else
                return undefined;
        }
    }
} 