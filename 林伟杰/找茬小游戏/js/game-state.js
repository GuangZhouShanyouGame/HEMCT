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

            //新添加参数
            var score = 0;
            var countDown = 99; + " "//计时
            var level = 1;//设置当前关卡
            var timeText;
            var timer;//计时器
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

                    //加载图片
                    game.load.image('reduceTime','assets/images/减时间.png');//减时间
                    game.load.image('head','assets/images/头部.png');//头部
                    game.load.image('perfectFinish','assets/images/完美通关.png');//完美通关
                    game.load.image('right','assets/images/对.png');//对
                    game.load.image('puzzle1','assets/images/拼图1.png');//拼图
                    game.load.image('puzzle2','assets/images/拼图2.png');
                    game.load.image('puzzle3','assets/images/拼图3.png');
                    game.load.image('puzzle4','assets/images/拼图4.png');
                    game.load.image('puzzle5','assets/images/拼图5.png');
                    game.load.image('puzzle6','assets/images/拼图6.png');
                    game.load.image('puzzle7','assets/images/拼图7.png');
                    game.load.image('puzzle8','assets/images/拼图8.png');
                    game.load.image('puzzle9','assets/images/拼图9.png');
                    game.load.image('puzzle10','assets/images/拼图10.png');
                    game.load.image('puzzle11','assets/images/拼图11.png');
                    game.load.image('puzzle12','assets/images/拼图12.png');
                    game.load.image('puzzle13','assets/images/拼图13.png');
                    game.load.image('puzzle14','assets/images/拼图14.png');
                    game.load.image('puzzle15','assets/images/拼图15.png');
                    game.load.image('puzzle16','assets/images/拼图16.png');
                    game.load.image('puzzle17','assets/images/拼图17.png');
                    game.load.image('puzzle18','assets/images/拼图18.png');
                    game.load.image('puzzle19','assets/images/拼图19.png');
                    game.load.image('puzzle20','assets/images/拼图20.png');
                    game.load.image('figureBottom','assets/images/数字底.png');//数字底
                    game.load.image('clock','assets/images/时间.png');//时间
                    game.load.image('success','assets/images/通关.png');//通关图片
                    game.load.image('wrong','assets/images/错.png');//错
                    game.load.image('background','assets/images/bg.png');//背景图
                    game.load.image('star1','assets/images/star1.png');//空心星星
                    game.load.image('star2','assets/images/star2.png');//实心星星
                    game.load.image('timeOver','assets/images/时间到.png');//时间到
                    game.load.image('shade','assets/images/遮罩.png');//遮罩
                    game.load.image('yep','//24haowan-cdn.shanyougame.com/puzzle/assets/images/yep.png');//打钩图片

                    //加载字体
                    game.load.atlasJSONArray('level','http://24haowan-cdn.shanyougame.com/findSquare/assets/mobile/level.png','assets/fonts/level.json')
                };
            };
            // 开始界面
            game.States.create = function() {
                this.create = function() {
                    // 初始化音乐
                    /*if(self.gameManager.device.platform != 'android'){
                        self.musicManager.init(['bg','input']);
                    }else{
                        self.musicManager.init(['bg']);
                    }*/
                    game.state.start('play');
                }
                //此方法借用Arvin的,可以用来画圆角边框（利用Html5 中的canvas）
                CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
                    this.beginPath();
                    this.moveTo(x + r, y);
                    this.arcTo(x + w, y, x + w, y + h, r);
                    this.arcTo(x + w, y + h, x, y + h, r);
                    this.arcTo(x, y + h, x, y, r);
                    this.arcTo(x, y, x + w, y, r);
                    this.closePath();
                    return this;
                };  
            };
            // State - play
            // 游戏界面
            game.States.play = function() {
                this.create = function() {
                    //创建游戏背景
                    this.bg = game.add.image(0,0,'background');
                    this.bg.width = game.world.width;
                    this.bg.height = game.world.height;
                    //添加顶部背景横条
                    var head_top = game.cache.getImage('head');
                    this.head = game.add.image(0,0,'head');
                    if(head_top.width/head_top.height >= 750/123) {
                        this.head.width = game.world.width;
                        this.head.height = this.head.width/(head_top.width/head_top.height);
                    } else {
                        this.head.height = game.world.height/(750/123);
                        this.head.width = game.world.width;
                    }
                    //把六个空心星星添加到头部    
                    this.stars = game.add.group();
                    for(var i = 0; i < 6; i++) {
                        this.stars.create((23 + i * 64), (this.head.height - 64) / 2, 'star1');
                    }
                    //添加数字底
                    this.figureBottom = game.add.image((this.head.width - 220 - 13), (this.head.height - 64) / 2, 'figureBottom');//添加数字底
                    //添加时钟
                    this.clock = game.add.image((this.head.width - 220 - 13), (this.head.height - 64) / 2, 'clock');
                    timeText = game.add.text(this.figureBottom.x + this.figureBottom.width/2, (this.head.height - this.figureBottom.height/2)/2,'99' + " ");
                    timeText.font = 'timeFont';
                    timeText.fill = '#506F82';
                    //获取不同型号设备图片的缩放比例
                    this.puzzle = game.cache.getImage('puzzle1');
                    this.puzzleScale = game.world.height / 1208;
                    this.puzzle.width = this.puzzle.width * this.puzzleScale;
                    this.puzzle.height = this.puzzle.height * this.puzzleScale;              
                    game.time.events.add(1000,this.startGame,this);
                };
                //生成白色背景图
                var centerBg;//创建背景参数
                this.newWhiteBg = function() {
                    //新建一个白色圆角矩形背景
                    var bgWidth = this.puzzle.width + 40;
                    var bgHeight = this.puzzle.height * 2 + 60;

                    rectBitmap = game.add.bitmapData(bgWidth, bgHeight);
                    rectBitmap.context.roundRect(0, 0, bgWidth, bgHeight, 15);
                    rectBitmap.context.fillStyle = "#FAF8EF";
                    rectBitmap.context.fill();

                    centerBg = game.add.image(game.world.centerX,game.world.centerY + this.head.height / 2,rectBitmap);
                    centerBg.anchor.setTo(0.5,0.5);
                }

                //添加图片参数
                var puzzleOne;
                var puzzleTwo;
                //插入拼图和白色背景
                this.insertPuzzle = function() {                
                    this.newWhiteBg();
                    var firstPuzzle = 'puzzle' + (2 * level - 1);
                    var secondPuzzle = 'puzzle' + 2 * level;
                    var Scale = this.puzzleScale;
                    puzzleOne = game.add.image(centerBg.centerX - this.puzzle.width / 2,centerBg.centerY - this.puzzle.height - 10,firstPuzzle);
                    puzzleOne.width = puzzleOne.width * Scale;
                    puzzleOne.height = puzzleOne.height * Scale;
                    puzzleTwo = game.add.image(centerBg.centerX - this.puzzle.width / 2,centerBg.centerY + 10,secondPuzzle);
                    puzzleTwo.width = puzzleTwo.width * Scale;
                    puzzleTwo.height = puzzleTwo.height * Scale;
                    // this.play();
                    game.time.events.add(4000,this.play,this);
                }

                //开始玩函数
                var rightX = new Array();
                var rightY = new Array();
                var rightWidth = new Array();
                var rightHeight = new Array();
                var Scale = this.puzzleScale;
                this.play = function() {//点击找茬
                    var Scale = this.puzzleScale;
                    var tag = new Array();//用于标记两张图片中的一张被点击，则另一张点击了也不会出现效果
                    
                    this.right = game.add.group();
                    for(var i=0; i<6; i++) {
                        tag[i] = false;
                    }
                    //根据游戏的等级分别设置不同处的范围
                    if(level == 1) {
                        rightX[1] = puzzleOne.x + 8 * Scale;
                        rightY[1] = puzzleOne.y + 76 * Scale;
                        rightWidth[1] = 64 * Scale;
                        rightHeight[1] = 64 * Scale;
                        rightX[2] = puzzleOne.x + 1 * Scale; //蓝色彩旗
                        rightY[2] = puzzleOne.y + 242 * Scale;
                        rightWidth[2] = 70 * Scale;
                        rightHeight[2] = 40 * Scale;
                        rightX[3] = puzzleOne.x + 172 * Scale;
                        rightY[3] = puzzleOne.y + 126 * Scale;
                        rightWidth[3] = 122 * Scale;
                        rightHeight[3] = 78 * Scale;
                        rightX[4] = puzzleOne.x + 178 * Scale;
                        rightY[4] = puzzleOne.y + 352 * Scale;
                        rightWidth[4] = 136 * Scale;
                        rightHeight[4] = 48 * Scale;
                        rightX[5] = puzzleOne.x + 424 * Scale;
                        rightY[5] = puzzleOne.y + 32 * Scale;
                        rightWidth[5] = 78 * Scale;
                        rightHeight[5] = 80 * Scale;
                        rightX[6] = puzzleOne.x + 410 * Scale;
                        rightY[6] = puzzleOne.y + 274 * Scale;
                        rightWidth[6] = 72 * Scale;
                        rightHeight[6] = 92 * Scale;
                        rightX[7] = puzzleTwo.x + 8 * Scale;
                        rightY[7] = puzzleTwo.y + 76 * Scale;
                        rightWidth[7] = 64 * Scale;
                        rightHeight[7] = 64 * Scale;
                        rightX[8] = puzzleTwo.x + 1 * Scale;
                        rightY[8] = puzzleTwo.y + 242 * Scale;
                        rightWidth[8] = 70 * Scale;
                        rightHeight[8] = 40 * Scale;
                        rightX[9] = puzzleTwo.x + 172 * Scale;
                        rightY[9] = puzzleTwo.y + 126 * Scale;
                        rightWidth[9] = 122 * Scale;
                        rightHeight[9] = 78 * Scale;
                        rightX[10] = puzzleTwo.x + 178 * Scale;
                        rightY[10] = puzzleTwo.y + 352 * Scale;
                        rightWidth[10] = 136 * Scale;
                        rightHeight[10] = 48 * Scale;
                        rightX[11] = puzzleTwo.x + 424 * Scale;
                        rightY[11] = puzzleTwo.y + 32 * Scale;
                        rightWidth[11] = 78 * Scale;
                        rightHeight[11] = 80 * Scale;
                        rightX[12] = puzzleTwo.x + 410 * Scale;
                        rightY[12] = puzzleTwo.y + 274 * Scale;
                        rightWidth[12] = 72 * Scale;
                        rightHeight[12] = 92 * Scale;

                    } else if(level == 2) {
                        rightX[1] = puzzleOne.x + 214 * Scale; //椰子叶
                        rightY[1] = puzzleOne.y + 104 * Scale;
                        rightWidth[1] = 80 * Scale;
                        rightHeight[1] = 62 * Scale;
                        rightX[2] = puzzleOne.x + 288 * Scale;
                        rightY[2] = puzzleOne.y + 274 * Scale;
                        rightWidth[2] = 40 * Scale;
                        rightHeight[2] = 32 * Scale;
                        rightX[3] = puzzleOne.x + 1 * Scale;
                        rightY[3] = puzzleOne.y + 52 * Scale;
                        rightWidth[3] = 102 * Scale;
                        rightHeight[3] = 182 * Scale;
                        rightX[4] = puzzleOne.x + 372 * Scale;
                        rightY[4] = puzzleOne.y + 66 * Scale;
                        rightWidth[4] = 132 * Scale;
                        rightHeight[4] = 90 * Scale;
                        rightX[5] = puzzleOne.x + 184 * Scale;
                        rightY[5] = puzzleOne.y + 308 * Scale;
                        rightWidth[5] = 60 * Scale;
                        rightHeight[5] = 54 * Scale;
                        rightX[6] = puzzleOne.x + 368 * Scale;
                        rightY[6] = puzzleOne.y + 364 * Scale;
                        rightWidth[6] = 68 * Scale;
                        rightHeight[6] = 68 * Scale;
                        rightX[7] = puzzleTwo.x + 214 * Scale;
                        rightY[7] = puzzleTwo.y + 104 * Scale;
                        rightWidth[7] = 80 * Scale;
                        rightHeight[7] = 62 * Scale;
                        rightX[8] = puzzleTwo.x + 288 * Scale;
                        rightY[8] = puzzleTwo.y + 274 * Scale;
                        rightWidth[8] = 40 * Scale;
                        rightHeight[8] = 32 * Scale;
                        rightX[9] = puzzleTwo.x + 1 * Scale;
                        rightY[9] = puzzleTwo.y + 52 * Scale;
                        rightWidth[9] = 102 * Scale;
                        rightHeight[9] = 182 * Scale;
                        rightX[10] = puzzleTwo.x + 372 * Scale;
                        rightY[10] = puzzleTwo.y + 66 * Scale;
                        rightWidth[10] = 132 * Scale;
                        rightHeight[10] = 90 * Scale;
                        rightX[11] = puzzleTwo.x + 184 * Scale;
                        rightY[11] = puzzleTwo.y + 308 * Scale;
                        rightWidth[11] = 60 * Scale;
                        rightHeight[11] = 54 * Scale;
                        rightX[12] = puzzleTwo.x + 368 * Scale;
                        rightY[12] = puzzleTwo.y + 364 * Scale;
                        rightWidth[12] = 68 * Scale;
                        rightHeight[12] = 68 * Scale;

                    } else if(level == 3) {
                        rightX[1] = puzzleOne.x + 136 * Scale;
                        rightY[1] = puzzleOne.y + 74 * Scale;
                        rightWidth[1] = 64 * Scale;
                        rightHeight[1] = 54 * Scale;
                        rightX[2] = puzzleOne.x + 362 * Scale;
                        rightY[2] = puzzleOne.y + 38 * Scale;
                        rightWidth[2] = 60 * Scale;
                        rightHeight[2] = 54 * Scale;
                        rightX[3] = puzzleOne.x + 114 * Scale;
                        rightY[3] = puzzleOne.y + 280 * Scale;
                        rightWidth[3] = 98 * Scale;
                        rightHeight[3] = 48 * Scale;
                        rightX[4] = puzzleOne.x + 56 * Scale;
                        rightY[4] = puzzleOne.y + 372 * Scale;
                        rightWidth[4] = 94 * Scale;
                        rightHeight[4] = 100 * Scale;
                        rightX[5] = puzzleOne.x + 260 * Scale;
                        rightY[5] = puzzleOne.y + 412 * Scale;
                        rightWidth[5] = 96 * Scale;
                        rightHeight[5] = 60 * Scale;
                        rightX[6] = puzzleOne.x + 354 * Scale;
                        rightY[6] = puzzleOne.y + 362 * Scale;
                        rightWidth[6] = 124 * Scale;
                        rightHeight[6] = 108 * Scale;
                        rightX[7] = puzzleTwo.x + 136 * Scale;
                        rightY[7] = puzzleTwo.y + 74 * Scale;
                        rightWidth[7] = 64 * Scale;
                        rightHeight[7] = 54 * Scale;
                        rightX[8] = puzzleTwo.x + 362 * Scale;
                        rightY[8] = puzzleTwo.y + 38 * Scale;
                        rightWidth[8] = 60 * Scale;
                        rightHeight[8] = 54 * Scale;
                        rightX[9] = puzzleTwo.x + 114 * Scale;
                        rightY[9] = puzzleTwo.y + 280 * Scale;
                        rightWidth[9] = 98 * Scale;
                        rightHeight[9] = 48 * Scale;
                        rightX[10] = puzzleTwo.x + 56 * Scale;
                        rightY[10] = puzzleTwo.y + 372 * Scale;
                        rightWidth[10] = 94 * Scale;
                        rightHeight[10] = 100 * Scale;
                        rightX[11] = puzzleTwo.x + 260 * Scale;
                        rightY[11] = puzzleTwo.y + 412 * Scale;
                        rightWidth[11] = 96 * Scale;
                        rightHeight[11] = 60 * Scale;
                        rightX[12] = puzzleTwo.x + 354 * Scale;
                        rightY[12] = puzzleTwo.y + 362 * Scale;
                        rightWidth[12] = 124 * Scale;
                        rightHeight[12] = 108 * Scale;

                    } else if(level == 4) {
                        rightX[1] = puzzleOne.x + 302 * Scale;
                        rightY[1] = puzzleOne.y + 74 * Scale;
                        rightWidth[1] = 112 * Scale;
                        rightHeight[1] = 130 * Scale;
                        rightX[2] = puzzleOne.x + 446 * Scale;
                        rightY[2] = puzzleOne.y + 156 * Scale;
                        rightWidth[2] = 62 * Scale;
                        rightHeight[2] = 120 * Scale;
                        rightX[3] = puzzleOne.x + 194 * Scale;
                        rightY[3] = puzzleOne.y + 388 * Scale;
                        rightWidth[3] = 56 * Scale;
                        rightHeight[3] = 46 * Scale;
                        rightX[4] = puzzleOne.x + 0 * Scale;
                        rightY[4] = puzzleOne.y + 156 * Scale;
                        rightWidth[4] = 78 * Scale;
                        rightHeight[4] = 108 * Scale;
                        rightX[5] = puzzleOne.x + 98 * Scale;
                        rightY[5] = puzzleOne.y + 110 * Scale;
                        rightWidth[5] = 112 * Scale;
                        rightHeight[5] = 136 * Scale;
                        rightX[6] = puzzleOne.x + 228 * Scale;
                        rightY[6] = puzzleOne.y + 158 * Scale;
                        rightWidth[6] = 56 * Scale;
                        rightHeight[6] = 52 * Scale;
                        rightX[7] = puzzleTwo.x + 302 * Scale;
                        rightY[7] = puzzleTwo.y + 74 * Scale;
                        rightWidth[7] = 112 * Scale;
                        rightHeight[7] = 130 * Scale;
                        rightX[8] = puzzleTwo.x + 446 * Scale;
                        rightY[8] = puzzleTwo.y + 156 * Scale;
                        rightWidth[8] = 62 * Scale;
                        rightHeight[8] = 120 * Scale;
                        rightX[9] = puzzleTwo.x + 194 * Scale;
                        rightY[9] = puzzleTwo.y + 388 * Scale;
                        rightWidth[9] = 56 * Scale;
                        rightHeight[9] = 46 * Scale;
                        rightX[10] = puzzleTwo.x + 0 * Scale;
                        rightY[10] = puzzleTwo.y + 156 * Scale;
                        rightWidth[10] = 78 * Scale;
                        rightHeight[10] = 108 * Scale;
                        rightX[11] = puzzleTwo.x + 98 * Scale;
                        rightY[11] = puzzleTwo.y + 110 * Scale;
                        rightWidth[11] = 112 * Scale;
                        rightHeight[11] = 136 * Scale;
                        rightX[12] = puzzleTwo.x + 228 * Scale;
                        rightY[12] = puzzleTwo.y + 158 * Scale;
                        rightWidth[12] = 56 * Scale;
                        rightHeight[12] = 52 * Scale;
                    } else if(level == 5) {
                        rightX[1] = puzzleOne.x + 138 * Scale;
                        rightY[1] = puzzleOne.y + 74 * Scale;
                        rightWidth[1] = 56 * Scale;
                        rightHeight[1] = 58 * Scale;
                        rightX[2] = puzzleOne.x + 144 * Scale;
                        rightY[2] = puzzleOne.y + 300 * Scale;
                        rightWidth[2] = 40 * Scale;
                        rightHeight[2] = 54 * Scale;
                        rightX[3] = puzzleOne.x + 322 * Scale;
                        rightY[3] = puzzleOne.y + 178 * Scale;
                        rightWidth[3] = 60 * Scale;
                        rightHeight[3] = 62 * Scale;
                        rightX[4] = puzzleOne.x + 48 * Scale;
                        rightY[4] = puzzleOne.y + 390 * Scale;
                        rightWidth[4] = 74 * Scale;
                        rightHeight[4] = 94 * Scale;
                        rightX[5] = puzzleOne.x + 300 * Scale;
                        rightY[5] = puzzleOne.y + 386 * Scale;
                        rightWidth[5] = 30 * Scale;
                        rightHeight[5] = 30 * Scale;
                        rightX[6] = puzzleOne.x + 360 * Scale;
                        rightY[6] = puzzleOne.y + 454 * Scale;
                        rightWidth[6] = 32 * Scale;
                        rightHeight[6] = 34 * Scale;
                        rightX[7] = puzzleTwo.x + 138 * Scale;
                        rightY[7] = puzzleTwo.y + 74 * Scale;
                        rightWidth[7] = 56 * Scale;
                        rightHeight[7] = 58 * Scale;
                        rightX[8] = puzzleTwo.x + 144 * Scale;
                        rightY[8] = puzzleTwo.y + 300 * Scale;
                        rightWidth[8] = 40 * Scale;
                        rightHeight[8] = 54 * Scale;
                        rightX[9] = puzzleTwo.x + 322 * Scale;
                        rightY[9] = puzzleTwo.y + 178 * Scale;
                        rightWidth[9] = 60 * Scale;
                        rightHeight[9] = 62 * Scale;
                        rightX[10] = puzzleTwo.x + 48 * Scale;
                        rightY[10] = puzzleTwo.y + 390 * Scale;
                        rightWidth[10] = 74 * Scale;
                        rightHeight[10] = 94 * Scale;
                        rightX[11] = puzzleTwo.x + 300 * Scale;
                        rightY[11] = puzzleTwo.y + 386 * Scale;
                        rightWidth[11] = 30 * Scale;
                        rightHeight[11] = 30 * Scale;
                        rightX[12] = puzzleTwo.x + 360 * Scale;
                        rightY[12] = puzzleTwo.y + 454 * Scale;
                        rightWidth[12] = 32 * Scale;
                        rightHeight[12] = 34 * Scale;
                    } else if(level == 6) {
                        rightX[1] = puzzleOne.x + 58 * Scale;
                        rightY[1] = puzzleOne.y + 334 * Scale;
                        rightWidth[1] = 36 * Scale;
                        rightHeight[1] = 54 * Scale;
                        rightX[2] = puzzleOne.x + 384 * Scale;
                        rightY[2] = puzzleOne.y + 202 * Scale;
                        rightWidth[2] = 40 * Scale;
                        rightHeight[2] = 42 * Scale;
                        rightX[3] = puzzleOne.x + 2 * Scale;
                        rightY[3] = puzzleOne.y + 432 * Scale;
                        rightWidth[3] = 112 * Scale;
                        rightHeight[3] = 70 * Scale;
                        rightX[4] = puzzleOne.x + 142 * Scale;
                        rightY[4] = puzzleOne.y + 276 * Scale;
                        rightWidth[4] = 40 * Scale;
                        rightHeight[4] = 42 * Scale;
                        rightX[5] = puzzleOne.x + 434 * Scale;
                        rightY[5] = puzzleOne.y + 54 * Scale;
                        rightWidth[5] = 34 * Scale;
                        rightHeight[5] = 34 * Scale;
                        rightX[6] = puzzleOne.x + 408 * Scale;
                        rightY[6] = puzzleOne.y + 342 * Scale;
                        rightWidth[6] = 30 * Scale;
                        rightHeight[6] = 40 * Scale;
                        rightX[7] = puzzleTwo.x + 58 * Scale;
                        rightY[7] = puzzleTwo.y + 334 * Scale;
                        rightWidth[7] = 36 * Scale;
                        rightHeight[7] = 54 * Scale;
                        rightX[8] = puzzleTwo.x + 384 * Scale;
                        rightY[8] = puzzleTwo.y + 202 * Scale;
                        rightWidth[8] = 40 * Scale;
                        rightHeight[8] = 42 * Scale;
                        rightX[9] = puzzleTwo.x + 2 * Scale;
                        rightY[9] = puzzleTwo.y + 432 * Scale;
                        rightWidth[9] = 112 * Scale;
                        rightHeight[9] = 70 * Scale;
                        rightX[10] = puzzleTwo.x + 142 * Scale;
                        rightY[10] = puzzleTwo.y + 276 * Scale;
                        rightWidth[10] = 40 * Scale;
                        rightHeight[10] = 42 * Scale;
                        rightX[11] = puzzleTwo.x + 438 * Scale;
                        rightY[11] = puzzleTwo.y + 58 * Scale;
                        rightWidth[11] = 34 * Scale;
                        rightHeight[11] = 34 * Scale;
                        rightX[12] = puzzleTwo.x + 408 * Scale;
                        rightY[12] = puzzleTwo.y + 342 * Scale;
                        rightWidth[12] = 30 * Scale;
                        rightHeight[12] = 40 * Scale;
                    } else if(level == 7) {
                        rightX[1] = puzzleOne.x + 3 * Scale;
                        rightY[1] = puzzleOne.y + 60 * Scale;
                        rightWidth[1] = 110 * Scale;
                        rightHeight[1] = 70 * Scale;
                        rightX[2] = puzzleOne.x + 368 * Scale;
                        rightY[2] = puzzleOne.y + 242 * Scale;
                        rightWidth[2] = 32 * Scale;
                        rightHeight[2] = 32 * Scale;
                        rightX[3] = puzzleOne.x + 422 * Scale;
                        rightY[3] = puzzleOne.y + 104 * Scale;
                        rightWidth[3] = 76 * Scale;
                        rightHeight[3] = 48 * Scale;
                        rightX[4] = puzzleOne.x + 56* Scale;
                        rightY[4] = puzzleOne.y + 220 * Scale;
                        rightWidth[4] = 28 * Scale;
                        rightHeight[4] = 40 * Scale;
                        rightX[5] = puzzleOne.x + 196 * Scale;
                        rightY[5] = puzzleOne.y + 286 * Scale;
                        rightWidth[5] = 50 * Scale;
                        rightHeight[5] = 68 * Scale;
                        rightX[6] = puzzleOne.x + 458 * Scale;
                        rightY[6] = puzzleOne.y + 330 * Scale;
                        rightWidth[6] = 44 * Scale;
                        rightHeight[6] = 54 * Scale;
                        rightX[7] = puzzleTwo.x + 3 * Scale;
                        rightY[7] = puzzleTwo.y + 60 * Scale;
                        rightWidth[7] = 110 * Scale;
                        rightHeight[7] = 70 * Scale;
                        rightX[8] = puzzleTwo.x + 368 * Scale;
                        rightY[8] = puzzleTwo.y + 242 * Scale;
                        rightWidth[8] = 32 * Scale;
                        rightHeight[8] = 32 * Scale;
                        rightX[9] = puzzleTwo.x + 422 * Scale;
                        rightY[9] = puzzleTwo.y + 104 * Scale;
                        rightWidth[9] = 76 * Scale;
                        rightHeight[9] = 48 * Scale;
                        rightX[10] = puzzleTwo.x + 56* Scale;
                        rightY[10] = puzzleTwo.y + 220 * Scale;
                        rightWidth[10] = 28 * Scale;
                        rightHeight[10] = 40 * Scale;
                        rightX[11] = puzzleTwo.x + 196 * Scale;
                        rightY[11] = puzzleTwo.y + 286 * Scale;
                        rightWidth[11] = 50 * Scale;
                        rightHeight[11] = 68 * Scale;
                        rightX[12] = puzzleTwo.x + 458 * Scale;
                        rightY[12] = puzzleTwo.y + 330 * Scale;
                        rightWidth[12] = 44 * Scale;
                        rightHeight[12] = 54 * Scale;
                    } else if(level == 8) {
                        rightX[1] = puzzleOne.x + 60 * Scale;
                        rightY[1] = puzzleOne.y + 30 * Scale;
                        rightWidth[1] = 32 * Scale;
                        rightHeight[1] = 32 * Scale;
                        rightX[2] = puzzleOne.x + 188 * Scale;
                        rightY[2] = puzzleOne.y + 24 * Scale;
                        rightWidth[2] = 124 * Scale;
                        rightHeight[2] = 124 * Scale;
                        rightX[3] = puzzleOne.x + 314 * Scale;
                        rightY[3] = puzzleOne.y + 428 * Scale;
                        rightWidth[3] = 54 * Scale;
                        rightHeight[3] = 56 * Scale;
                        rightX[4] = puzzleOne.x + 22 * Scale;
                        rightY[4] = puzzleOne.y + 182 * Scale;
                        rightWidth[4] = 38 * Scale;
                        rightHeight[4] = 38 * Scale;
                        rightX[5] = puzzleOne.x + 62 * Scale;
                        rightY[5] = puzzleOne.y + 316 * Scale;
                        rightWidth[5] = 52 * Scale;
                        rightHeight[5] = 50 * Scale;
                        rightX[6] = puzzleOne.x + 376 * Scale;
                        rightY[6] = puzzleOne.y + 316 * Scale;
                        rightWidth[6] = 52 * Scale;
                        rightHeight[6] = 50 * Scale;
                        rightX[7] = puzzleTwo.x + 60 * Scale;
                        rightY[7] = puzzleTwo.y + 30 * Scale;
                        rightWidth[7] = 32 * Scale;
                        rightHeight[7] = 32 * Scale;
                        rightX[8] = puzzleTwo.x + 188 * Scale;
                        rightY[8] = puzzleTwo.y + 24 * Scale;
                        rightWidth[8] = 124 * Scale;
                        rightHeight[8] = 124 * Scale;
                        rightX[9] = puzzleTwo.x + 314 * Scale;
                        rightY[9] = puzzleTwo.y + 428 * Scale;
                        rightWidth[9] = 54 * Scale;
                        rightHeight[9] = 56 * Scale;
                        rightX[10] = puzzleTwo.x + 22 * Scale;
                        rightY[10] = puzzleTwo.y + 182 * Scale;
                        rightWidth[10] = 38 * Scale;
                        rightHeight[10] = 38 * Scale;
                        rightX[11] = puzzleTwo.x + 62 * Scale;
                        rightY[11] = puzzleTwo.y + 316 * Scale;
                        rightWidth[11] = 52 * Scale;
                        rightHeight[11] = 50 * Scale;
                        rightX[12] = puzzleTwo.x + 376 * Scale;
                        rightY[12] = puzzleTwo.y + 316 * Scale;
                        rightWidth[12] = 52 * Scale;
                        rightHeight[12] = 50 * Scale;
                    } else if(level == 9) {
                        rightX[1] = puzzleOne.x + 56 * Scale;
                        rightY[1] = puzzleOne.y + 80 * Scale;
                        rightWidth[1] = 198 * Scale;
                        rightHeight[1] = 98 * Scale;
                        rightX[2] = puzzleOne.x + 36 * Scale;
                        rightY[2] = puzzleOne.y + 436 * Scale;
                        rightWidth[2] = 110 * Scale;
                        rightHeight[2] = 60 * Scale;
                        rightX[3] = puzzleOne.x + 418 * Scale;
                        rightY[3] = puzzleOne.y + 350 * Scale;
                        rightWidth[3] = 80 * Scale;
                        rightHeight[3] = 54 * Scale;
                        rightX[4] = puzzleOne.x + 16 * Scale;
                        rightY[4] = puzzleOne.y + 260 * Scale;
                        rightWidth[4] = 56 * Scale;
                        rightHeight[4] = 56 * Scale;
                        rightX[5] = puzzleOne.x + 290 * Scale;
                        rightY[5] = puzzleOne.y + 124 * Scale;
                        rightWidth[5] = 84 * Scale;
                        rightHeight[5] = 40 * Scale;
                        rightX[6] = puzzleOne.x + 360 * Scale;
                        rightY[6] = puzzleOne.y + 270 * Scale;
                        rightWidth[6] = 64 * Scale;
                        rightHeight[6] = 28 * Scale;
                        rightX[7] = puzzleTwo.x + 56 * Scale;
                        rightY[7] = puzzleTwo.y + 80 * Scale;
                        rightWidth[7] = 198 * Scale;
                        rightHeight[7] = 98 * Scale;
                        rightX[8] = puzzleTwo.x + 36 * Scale;
                        rightY[8] = puzzleTwo.y + 436 * Scale;
                        rightWidth[8] = 120 * Scale;
                        rightHeight[8] = 60 * Scale;
                        rightX[9] = puzzleTwo.x + 418 * Scale;
                        rightY[9] = puzzleTwo.y + 350 * Scale;
                        rightWidth[9] = 80 * Scale;
                        rightHeight[9] = 54 * Scale;
                        rightX[10] = puzzleTwo.x + 16 * Scale;
                        rightY[10] = puzzleTwo.y + 260 * Scale;
                        rightWidth[10] = 56 * Scale;
                        rightHeight[10] = 56 * Scale;
                        rightX[11] = puzzleTwo.x + 290 * Scale;
                        rightY[11] = puzzleTwo.y + 124 * Scale;
                        rightWidth[11] = 84 * Scale;
                        rightHeight[11] = 40 * Scale;
                        rightX[12] = puzzleTwo.x + 360 * Scale;
                        rightY[12] = puzzleTwo.y + 270 * Scale;
                        rightWidth[12] = 64 * Scale;
                        rightHeight[12] = 28 * Scale;
                    } else if(level == 10) {
                        rightX[1] = puzzleOne.x + 66 * Scale;
                        rightY[1] = puzzleOne.y + 258 * Scale;
                        rightWidth[1] = 64 * Scale;
                        rightHeight[1] = 92 * Scale;
                        rightX[2] = puzzleOne.x + 196 * Scale;
                        rightY[2] = puzzleOne.y + 152 * Scale;
                        rightWidth[2] = 96 * Scale;
                        rightHeight[2] = 56 * Scale;
                        rightX[3] = puzzleOne.x + 340 * Scale;
                        rightY[3] = puzzleOne.y + 452 * Scale;
                        rightWidth[3] = 40 * Scale;
                        rightHeight[3] = 40 * Scale;
                        rightX[4] = puzzleOne.x + 28 * Scale;
                        rightY[4] = puzzleOne.y + 136 * Scale;
                        rightWidth[4] = 38 * Scale;
                        rightHeight[4] = 38 * Scale;
                        rightX[5] = puzzleOne.x + 234 * Scale;
                        rightY[5] = puzzleOne.y + 10 * Scale;
                        rightWidth[5] = 62 * Scale;
                        rightHeight[5] = 62 * Scale;
                        rightX[6] = puzzleOne.x + 478 * Scale;
                        rightY[6] = puzzleOne.y + 368 * Scale;
                        rightWidth[6] = 24 * Scale;
                        rightHeight[6] = 74 * Scale;
                        rightX[7] = puzzleTwo.x + 66 * Scale;
                        rightY[7] = puzzleTwo.y + 258 * Scale;
                        rightWidth[7] = 64 * Scale;
                        rightHeight[7] = 92 * Scale;
                        rightX[8] = puzzleTwo.x + 196 * Scale;
                        rightY[8] = puzzleTwo.y + 152 * Scale;
                        rightWidth[8] = 96 * Scale;
                        rightHeight[8] = 56 * Scale;
                        rightX[9] = puzzleTwo.x + 340 * Scale;
                        rightY[9] = puzzleTwo.y + 452 * Scale;
                        rightWidth[9] = 40 * Scale;
                        rightHeight[9] = 40 * Scale;
                        rightX[10] = puzzleTwo.x + 28 * Scale;
                        rightY[10] = puzzleTwo.y + 136 * Scale;
                        rightWidth[10] = 38 * Scale;
                        rightHeight[10] = 38 * Scale;
                        rightX[11] = puzzleTwo.x + 234 * Scale;
                        rightY[11] = puzzleTwo.y + 10 * Scale;
                        rightWidth[11] = 62 * Scale;
                        rightHeight[11] = 62 * Scale;
                        rightX[12] = puzzleTwo.x + 478 * Scale;
                        rightY[12] = puzzleTwo.y + 368 * Scale;
                        rightWidth[12] = 24 * Scale;
                        rightHeight[12] = 74 * Scale;
                    }

                    //添加一个点击事件来判断是否找出正确答案
                    game.input.onTap.add(function (e) {
                        console.log(countDown);
                        console.log(score);
                        if(score == 6) {
                            //game.input.onTap.active = false;
                            this.gameFinish();
                        } 
                        else if( (e.x * 2 > rightX[1] && e.x * 2 < rightX[1] +  rightWidth[1]&& e.y * 2 > rightY[1] && e.y * 2 < rightY[1] + rightHeight[1]) || (e.x * 2 > rightX[7] && e.x * 2 < rightX[7] +  rightWidth[7]
                            && e.y * 2 > rightY[7] && e.y * 2 < rightY[7] + rightHeight[7]) ) {
                            var right1 = game.add.image(rightX[1],rightY[1],'right','',this.right);
                            right1.width = rightWidth[1];
                            right1.height = rightHeight[1];
                            //console.log(rightWidth[1]);
                            var right7 = game.add.image(rightX[7],rightY[7],'right','',this.right);
                            right7.width = rightWidth[7];
                            right7.height = rightHeight[7];
                            if(tag[0] == false) {
                                score++;
                                tag[0] = true;
                                this.solidStar();
                            } 
                        }
                        else if( (e.x * 2 > rightX[2] && e.x * 2 < rightX[2] +  rightWidth[2]&& e.y * 2 > rightY[2] && e.y * 2 < rightY[2] + rightHeight[2]) || 
                            (e.x * 2 > rightX[8] && e.x * 2 < rightX[8] +  rightWidth[8] && e.y * 2 > rightY[8] && e.y * 2 < rightY[8] + rightHeight[8]) ) {
                            var right2 = game.add.image(rightX[2],rightY[2],'right','',this.right);
                            right2.width = rightWidth[2];
                            right2.height = rightHeight[2];
                            var right8 = game.add.image(rightX[8],rightY[8],'right','',this.right);
                            right8.width = rightWidth[8];
                            right8.height = rightHeight[8];
                            if(tag[1] == false) {
                                tag[1] = true;
                                score++;
                                this.solidStar(); 
                            } 
                        }
                        else if( (e.x * 2 > rightX[3] && e.x * 2 < rightX[3] +  rightWidth[3] && e.y * 2 > rightY[3] && e.y * 2 < rightY[3] + rightHeight[3]) || (e.x * 2 > rightX[9] && e.x * 2 < rightX[9] +  rightWidth[9]
                            && e.y * 2 > rightY[9] && e.y * 2 < rightY[9] + rightHeight[9]) ) {
                            var right3 = game.add.image(rightX[3], rightY[3],'right','',this.right);
                            right3.width = rightWidth[3];
                            right3.height = rightHeight[3];
                            var right9 = game.add.image(rightX[9], rightY[9],'right','',this.right);
                            right9.width = rightWidth[9];
                            right9.height = rightHeight[9];
                            if(tag[2] == false) {
                                tag[2] = true
                                score++;
                                this.solidStar();
                            }  
                        }
                        else if( (e.x * 2 > rightX[4] && e.x * 2 < rightX[4] +  rightWidth[4] && e.y * 2 > rightY[4] && e.y * 2 < rightY[4] + rightHeight[4]) || (e.x * 2 > rightX[10] && e.x * 2 < rightX[10] +  rightWidth[10]
                            && e.y * 2 > rightY[10] && e.y * 2 < rightY[10] + rightHeight[10]) ) {
                            var right4 = game.add.image(rightX[4],rightY[4],'right','',this.right);
                            right4.width = rightWidth[4];
                            right4.height = rightHeight[4];
                            var right10 = game.add.image(rightX[10],rightY[10],'right','',this.right);
                            right10.width = rightWidth[10];
                            right10.height = rightHeight[10];
                            if(tag[3] == false) {
                                tag[3] = true
                                score++;
                                this.solidStar(); 
                            }  
                        }
                        else if( (e.x * 2 > rightX[5] && e.x * 2 < rightX[5] +  rightWidth[5] && e.y * 2 > rightY[5] && e.y * 2 < rightY[5] + rightHeight[5] ) || (e.x * 2 > rightX[11] && e.x * 2 < rightX[11] +  rightWidth[11]
                            && e.y * 2 > rightY[11] && e.y * 2 < rightY[11] + rightHeight[11] ) ) {
                            var right5 = game.add.image(rightX[5],rightY[5],'right','',this.right);
                            right5.width = rightWidth[5];
                            right5.height = rightHeight[5];
                            var right11 = game.add.image(rightX[11],rightY[11],'right','',this.right);
                            right11.width = rightWidth[11];
                            right11.height = rightHeight[11];
                            if(tag[4] == false) {
                                tag[4] = true
                                score++;
                                this.solidStar();
                            }  
                        }
                        else if( (e.x * 2 > rightX[6] && e.x * 2 < rightX[6] +  rightWidth[6] && e.y * 2 > rightY[6] && e.y * 2 < rightY[6] + rightHeight[6] ) || (e.x * 2 > rightX[12] && e.x * 2 < rightX[12] +  rightWidth[12]
                            && e.y * 2 > rightY[12] && e.y * 2 < rightY[12] + rightHeight[12] ) ) {
                            var right6 = game.add.image(rightX[6],rightY[6],'right','',this.right);
                            right6.width = rightWidth[6];
                            right6.height = rightHeight[6];
                            var right12 = game.add.image(rightX[12],rightY[12],'right','',this.right);
                            right12.width = rightWidth[12];
                            right12.height = rightHeight[12];
                            if(tag[5] == false) {
                                tag[5] = true
                                score++;
                                this.solidStar();
                            }  
                        }
                        //但不是正确答案是播放减时间动画，并且让时间减5秒
                        //上面那张图点击错误
                        else if(e.x * 2 > puzzleOne.x && e.x * 2<puzzleOne.x + puzzleOne.width 
                            &&e.y * 2 > puzzleOne.y && e.y * 2<puzzleOne.y+puzzleOne.height) {
                            console.log(countDown);
                            countDown -= 5;
                            console.log(countDown);
                            var wrong = game.add.image(e.x * 2 - 48,e.y*2-48,'wrong');
                            wrong.width *= 0.7;
                            wrong.height *= 0.7;
                            wrong.alpha = 1;
                            var reduceTime = game.add.sprite(e.x * 2 - wrong.width/2,e.y*2 - wrong.height,'reduceTime');
                            reduceTime.alpha = 1;
                            game.physics.enable(reduceTime,Phaser.Physics.ARCADE);
                            reduceTime.body.velocity.y = -40;
                            //播放点击错误动画
                            var wrongTween = game.add.tween(wrong).to({alpha:0},500,null,true,1000,0,false);
                            var reduceTween = game.add.tween(reduceTime).to({alpha:0},500,null,true,1000,0,false);
                            reduceTween.onComplete.add(completed, this);
                            //删除生成的符号
                            function completed() {
                                wrong.destroy();
                                reduceTime.destroy();
                                // console.log('yes');
                            }
                        }
                        //下面那张图点击错误
                        else if(e.x * 2 > puzzleTwo.x && e.x * 2<puzzleTwo.x+puzzleTwo.width 
                            &&e.y * 2 > puzzleTwo.y && e.y * 2<puzzleTwo.y+puzzleTwo.height) {
                            countDown -= 5;
                            console.log(countDown);
                            var wrong = game.add.image(e.x * 2 - 48,e.y*2-48,'wrong');
                            wrong.width *= 0.7;
                            wrong.height *= 0.7;
                            wrong.alpha = 1;
                            var reduceTime = game.add.sprite(e.x * 2 - wrong.width/2,e.y*2 - wrong.height,'reduceTime');
                            reduceTime.alpha = 1;
                            game.physics.enable(reduceTime,Phaser.Physics.ARCADE);
                            reduceTime.body.velocity.y = -40;
                            //播放点击错误动画
                            var wrongTween = game.add.tween(wrong).to({alpha:0},100,null,true,1000,0,false);
                            var reduceTween = game.add.tween(reduceTime).to({alpha:0},100,null,true,1000,0,false);
                            reduceTween.onComplete.add(completed, this);
                            //删除生成的符号
                            function completed() {
                                wrong.destroy();
                                reduceTime.destroy();
                                // console.log('yes2');
                            }
                        }
                    },this);
                }
                //开始游戏入口
                this.startGame = function() {
                    this.insertPuzzle();
                    this.gameHint();
                    game.time.events.add(4000,function() {
                        game.input.onTap.active = true;//开启鼠标点击事件
                    },this);
                    // game.time.events.add(4000,this.play,this);
                    game.time.events.add(4000,this.startTime,this);
                }
                //晋级函数
                this.nextLevel = function() {
                    puzzleOne.destroy();
                    puzzleTwo.destroy();
                    centerBg.destroy();
                    this.right.destroy();//把之前的图片，背景，都删掉
                    this.insertPuzzle();
                    this.gameHint();
                    this.emptyStar();
                    // this.startTime();
                    // game.time.events.add(4000,this.play,this);
                    game.time.events.add(4000,this.startTime,this);
                    game.time.events.add(4000,function() {
                        game.input.onTap.active = true;//开启鼠标点击事件
                    },this);
                    timeText.fill = '#506F82';
                }
                //通关函数
                this.gameFinish = function() {    
                    timer.pause();
                    timeText.text = 99 + " "; 
                    timeText.fill = '#506F82';
                    score = 0;
                    game.input.onTap.active = false;
                    level++;
                    // this.gameHint();
                    //添加打钩动画
                    var yep = game.add.image(game.world.centerX, game.world.centerY + 20, "yep");
                    var yepsc = this.bg.width / yep.width * 0.6;
                    yep.scale.setTo(0, 0);
                    yep.anchor.setTo(0.5, 0.5);

                    game.add.tween(yep.scale).to({
                        x: yepsc,
                        y: yepsc
                    }, 500, Phaser.Easing.Quadratic.Out, true, 0, 0, false);
                    setTimeout(function() {
                        game.add.tween(yep.scale).to({
                            x: 1,
                            y: 1
                        }, 800, Phaser.Easing.Quadratic.In, true, 0, 0, false);
                    }, 500);

                    game.time.events.add(2500,this.nextLevel,this);
                }
                //完美通关函数
                this.perfectFinish = function() {
                    timer.pause();
                    score = 0;
                    game.input.onTap.active = false;//关闭鼠标点击事件
                    timeText.text = 99 + " "; 
                    timeText.fill = '#506F82';
                    var testSprite = game.add.sprite(game.world.centerX,-200,'success');//通关动画
                    testSprite.anchor.set(0.5);
                    game.add.tween(testSprite).to({y:game.world.centerY},2000,Phaser.Easing.Bounce.Out,true);
                    //播放动画2秒，停留一秒后再消失
                    game.time.events.add(3000,function() {
                        testSprite.destroy();
                    },this);
                }
                //时间到的函数
                this.timeOver = function() {
                    timer.pause();
                    timeText.text = 0 + " ";
                    game.input.onTap.active = false;
                    countDown = 99;
                    // alert("时间到");
                    var timeOver = game.add.sprite(game.world.centerX,-200,'timeOver');//时间到动画
                    timeOver.anchor.set(0.5);
                    game.add.tween(timeOver).to({y:game.world.centerY},2000,Phaser.Easing.Bounce.Out,true);
                    game.time.events.add(3000,function() {
                        timeOver.destroy();
                    },this);
                }
                //创建六个空心星星
                this.emptyStar = function() {
                    this.stars = game.add.group();//把六个空心星星添加到头部
                        for(var i = 0; i < 6; i++) {
                            this.stars.create((23 + i * 64), (this.head.height - 64) / 2, 'star1');
                    }
                }
                //把实心的星星改变为空心的星星
                this.solidStar = function() {
                        this.stars.create((23 + (score-1) * 64), (this.head.height - 64) / 2, 'star2');
                }
                //关卡提示动画和开始动画（总共需要4秒时间）
                this.gameHint = function() {
                    //添加遮罩背景图
                    var shade = game.add.image(0,0,'shade');
                    shade.width = game.world.width;
                    shade.height = game.world.height;
                    shade.alpha = 1;
                    var tween1 = game.add.tween(shade).to({alpha:0},3000,null,true,1000,0,false);
                    game.time.events.add(4000,function() {
                        shade.destroy();
                    },this);

                    this.levelText = game.add.sprite(game.world.centerX,game.world.centerY,'level',level-1);
                    this.levelText.width = this.levelText.width * 2 * this.puzzleScale;
                    this.levelText.height = this.levelText.height * 2 * this.puzzleScale;
                    this.levelText.anchor.setTo(0.5,0.5);
                    this.levelText.alpha = 1;
                    var tween2 = game.add.tween(this.levelText).to({alpha:0},3000,null,true,1000,0,false);
                }
                //开启计时器
                this.startTime = function() {
                    //开启计时器
                    score = 0;
                    countDown = 99;
                    timer = game.time.create();
                    timer.loop(1000,function() {
                        countDown--;
                        timeText.text = countDown + " ";
                    },this);
                    timer.start();
                }
                //每一帧执行一次
                this.update = function() {
                    //如果时间小于30秒则让字体变红
                    if(countDown <= 30) {
                        timeText.fill = 'red';
                    }
                    if(countDown > 30) {
                        timeText.fill = '#506F82'
                    }
                    //时间到，暂时没有减时间动画效果
                    if(countDown <= 0) {
                        this.timeOver();
                    }
                    //0~10级则调用通关函数
                    if(level != 10 && score == 6) {
                        this.gameFinish();
                    }
                    //10级过后则调用完美通关函数
                    if(level == 10 && score == 6) {
                        this.perfectFinish();
                    }
                };
                this.render = function() {
                    
                }
                // 游戏结束
                this.gameEnd = function() {
                    this.stars.removeChildAt(1);
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