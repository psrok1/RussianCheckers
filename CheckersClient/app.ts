/**
 * Punkt wejścia aplikacji
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
        var menuView = <View.MenuView>that.registerView("menu", new View.MenuView());
        var gameView = <View.GameView>that.registerView("game", new View.GameView());
        var appController = new Controller.App(menuView, gameView);
        appController.showMenu();
    }.bind(viewManager));

    textureManager.loadTextures();
};