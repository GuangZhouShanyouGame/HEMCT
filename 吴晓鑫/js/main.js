require.config({
	baseUrl: 'js/'
});

require(["game-manager"], function(GameManager) {
	var gameManager = new GameManager(null,"game");
	gameManager.init();
});