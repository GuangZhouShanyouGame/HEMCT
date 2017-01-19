/* 游戏场景 */
define(function() {
    var GameState = function(_game, _gameManager, _musicManager) {
        this.game = _game;
        this.gameManager = _gameManager;
        this.musicManager = _musicManager;
        this.init();
    };
    GameState.prototype = {
        // Phaser游戏示例
        game: null,
        // 游戏管理器
        gameManager: null,
        // 音乐管理器
        musicManager: null,
        // 游戏得分
        score: 0,

        // 初始化
        init: function() {
            var self = this;
            var game = this.game;
            game.States = {};

            // State - boot
            // 游戏启动
            game.States.boot = function() {
                this.preload = function() {
                    // 设置画布大小
                    // $(game.canvas).css("width", game.world.width / 2);
                    // $(game.canvas).css("height", game.world.height / 2);
                    // 设置默认背景颜色
                    game.stage.backgroundColor = '#aaa';
                };
                this.create = function() {
                    // 进入preload状态
                    game.state.start('preload');
                };
            };

            // State - preload
            // 加载游戏所需资源
            game.States.preload = function() {
                this.preload = function() {
                    // 加载完成回调
                    function callback() {
                        game.state.start('create');
                    }
                    // 全部文件加载完成
                    game.load.onLoadComplete.add(callback);

                    game.load.image('bg', "assets/images/bg.png");
                    game.load.image('star', "assets/images/star.png");

                    //加载音效
                    game.load.audio('bg', "assets/audio/bg.mp3");
                    // 安卓只能同时播放一个音乐
                    if (self.gameManager.device.platform != 'android') {
                        game.load.audio('input', "assets/audio/tap.mp3");
                    }
                };
            };

            // State - create
            // 开始界面
            game.States.create = function() {
                this.create = function() {
                    // 初始化音乐
                    if(self.gameManager.device.platform != 'android'){
                        self.musicManager.init(['bg','input']);
                    }else{
                        self.musicManager.init(['bg']);
                    }
                    game.state.start('play');
                }
            };

            // State - play
            // 游戏界面
            game.States.play = function() {
                this.create = function() {
                    // 此处写游戏逻辑

                    // 示例-创建背景音乐
					self.musicManager.play("bg");
                    game.input.onDown.add(function(){
                        self.musicManager.play("input");
                    });

                    // 示例-创建游戏背景
                    var bg = game.add.image(0, 0, "bg");
                    bg.width = game.world.width;
                    bg.height = game.world.height;

                    // 示例-创建游戏元素
                    var star = game.add.sprite(game.world.centerX, game.world.centerY, "star");
                    star.anchor.setTo(0.5, 0.5);

                    // 示例-创建动画
                    game.add.tween(star).to({ y: star.y - 100 }, 1000, Phaser.Easing.Linear.None, true, 0, -1, true);
                    button = game.add.button(game.world.centerX-40, 400, 'star', function(){
                        console.log("button")
                    }, this, 1, 2, 0);
                };
                this.update = function() {
                    // 每一帧更新都会触发
                };
                // 游戏结束
                this.gameEnd = function() {

                };
            };

            // State - end
            // 游戏结束界面
            game.States.end = function() {
                this.create = function() {
                    // 游戏结束
                    game.paused = true;
                    console.log("得分是: " + self.score);
                    alert("得分是: " + self.score);
                }
            };

            // 添加游戏状态
            game.state.add('boot', game.States.boot);
            game.state.add('preload', game.States.preload);
            game.state.add('create', game.States.create);
            game.state.add('play', game.States.play);
            game.state.add('end', game.States.end);
            game.state.start('boot');
        }
    };
    return GameState;
});
