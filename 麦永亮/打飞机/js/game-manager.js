/* 游戏管理器 */
define(["music-manager", "game-state"], function(MusicManager, GameState) {
	var game_width = window.innerWidth;
	var game_height = window.innerHeight;
	var GameManager = function(config, domId) {
		this.config = config || null;
		this.domId = domId || '';
	};
	GameManager.prototype = {
		// 初始化标记
		isInit : false,
		// 设备信息
		device : {
			type : null,
			platform : null,
			width : 0,
			height : 0
		},
		// 画布大小
		canvasSize : {
			width : 0,
			height : 0,
			ratio : 0
		},
		// phaser游戏对象实例
		instance : null,
		// 音乐管理器
		musicManager : null,
		// 配置表
		config: null,
		// 插入的domId
		domId : null,

		// 初始化-设备信息
		initDevice : function() {
			this.device.width = game_width;
			this.device.height = game_height;
			if (game_width > game_height) {
				this.device.width = game_height;
				this.device.height = game_width;
			}
			this.device.platform = (navigator.userAgent.toLowerCase().indexOf('android') < 0) ? 'apple' : 'android';
			this.device.type = (this.device.width > 700) ? 'pad' : 'mobile';
		},
		// 初始化-画布大小
		initCanvasSize : function() {
			if (game_width < game_height) {
				this.canvasSize.width = game_width * 2;
				this.canvasSize.height = game_height * 2;
				this.canvasSize.ratio = this.canvasSize.width/this.canvasSize.height;
			}
		},
		// 初始化-游戏
		init : function() {
			var self = this;
			// 初始化设备信息
			this.initDevice();
			// 初始化画布大小
			this.initCanvasSize();
			// 设置已进入初始化阶段
			this.isInit = true;
			// 创建游戏实例
			this.instance = new Phaser.Game(this.canvasSize.width, this.canvasSize.height, Phaser.CANVAS, this.domId);
			// 创建音乐管理器实例
			this.musicManager = new MusicManager(this.instance, this.device);
			// 创建游戏场景
			this.gameState = new GameState(this.instance, this, this.musicManager);
			console.log("init");
		}
	};
	return GameManager;
});