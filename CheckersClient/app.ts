/*
 * Coś jakby main()
 * Rejestruje widoki i uruchamia całą machinę
 */
window.onload = () => { 
    var viewManager = View.ViewManager.getInstance();
    viewManager.registerView("message", new View.MessageView());
    viewManager.switchView("message");

    var textureManager = View.TextureManager.getInstance();

    textureManager.onProgress(function (loadedTextureName: string) {
        var that: View.MessageView = this;
        that.setMessage("Ładowanie tekstur: " + loadedTextureName);
    }.bind(viewManager.getView("message")));

    textureManager.onLoaded(function () {
        var that: View.ViewManager = this;
        that.registerView("menu", new View.MenuView());
        that.registerView("game", new View.GameView());
        /* --- TEST --- */
        var gameController = new Controller.Game(<View.GameView>that.getView("game"));
        gameController.startNewGame(null);
    }.bind(viewManager));

    textureManager.loadTextures();
};