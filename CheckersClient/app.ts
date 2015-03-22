// taki jakby main() :P
window.onload = () => { 
    var viewManager = View.ViewManager.getInstance();
    viewManager.registerView("game", new View.GameView());
    viewManager.switchView("game");
};