require.config({
	baseUrl: 'js/'
});

require(["game-manager"], function(GameManager) {
	var gameManager = new GameManager();
	gameManager.init();
});