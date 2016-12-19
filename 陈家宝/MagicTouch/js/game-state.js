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
                    $(game.canvas).css("width", game.world.width / 2);
                    $(game.canvas).css("height", game.world.height / 2);
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
                    if (self.gameManager.device.platform != 'android') {
                        self.musicManager.init(['bg', 'input']);
                    } else {
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

                    let lastPoints = [];
                    var options = {
                        //el: document.getElementsByTagName('canvas')[0],
                        el: document.body,
                        enablePath: true,
                        timeDelay: -200,
                        lineColor: '#c120bb', //'#666'
                        lineWidth: '4',
                        triggerMouseKey: 'left',
                        activeColor: 'rgba(0, 0, 0, .05)',
                        eventType: "touch",
                        onSwipe: (list) => {
                            // document.getElementById('result0').innerHTML = list.join('');
                            console.log(list);
                        },
                        onGesture: (res, points) => {
                            console.log(res);
                            this.res = res;
                            // document.getElementById('result').innerHTML = res.score > 2 ? res.name : '未识别';
                            lastPoints = points;
                            //console.log(lastPoints);
                        }
                    };

                    this.canvas = new smartGesture(options);



                    // 示例-创建背景音乐
                    self.musicManager.play("bg");
                    game.input.onDown.add(function() {
                        self.musicManager.play("input");
                    });

                    // 示例-创建游戏背景
                    this.bg = game.add.image(0, 0, "bg");
                    this.bg.width = game.world.width;
                    this.bg.height = game.world.height;

                    // 示例-创建游戏元素
                    this.star = game.add.sprite(game.world.centerX, game.world.centerY, "star");
                    this.star.anchor.setTo(0.5, 0.5);

                    // 示例-创建动画
                    game.add.tween(this.star).to({
                        y: this.star.y - 100
                    }, 1000, Phaser.Easing.Linear.None, true, 0, -1, true);
                };
                this.update = function() {
                    // 每一帧更新都会触发
                    if (this.res) {
                        if (this.res.name == "check" && this.res.score >= 2) {
                            this.star.kill();
                            this.res = null;
                            this.shake();
                            
                            //this.bg.tint = 0xe26c6c;//礼物即将到达边界时，背景需要变红

                            // this.fade();
                            // game.camera.onFadeComplete.add(this.resetFade, this);
                            //this.canvas.destroy(); //取消手势
                        }
                    }
                };

                this.fade = function() {
                    //颜色淡入淡出
                    game.camera.fade('0xe26c6c', 2000);
                }

                this.resetFade = function() {

                    game.camera.resetFX();

                }

                this.shake = function() {
                    //屏幕震动
                    //  You can set your own intensity and duration
                    game.camera.shake(0.05, 500);

                }

                this.flash = function() {
                    //屏幕闪红
                    //  You can set your own flash color and duration
                    game.camera.flash(0xff0000, 500);

                }

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