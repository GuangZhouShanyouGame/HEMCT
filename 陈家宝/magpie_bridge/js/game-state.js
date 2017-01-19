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

        //鸟的颜色
        colorArr : ['Blue', 'Yellow', 'Red'],

        //圈每关的数量
        ringNumArr : [4, 7, 14, 14, 11],

        //鸟的宽度
        birdWidth : 100,
        littleBirdWidth : 70,

        //是否点击鸟
        clickBird : false,

        //牛郎的移动速度
        moveVel : 100,
        //牛郎在Y的偏移量，为使能与圈碰撞
        manOffsetY: 5,

        //背景在屏幕上方
        upward: -1,

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
                    game.load.image('bg1', "assets/images/bg1.png");
                    game.load.image('bg2', "assets/images/bg2.png");
                    game.load.image('bg3', "assets/images/bg3.png");

                    game.load.image('arrow', "assets/images/arrow.png");

                    //云
                    game.load.image('cloud1', "assets/images/cloud1.png");
                    game.load.image('cloud2', "assets/images/cloud2.png");
                   
                    //圈
                    game.load.image('BlueRing', "assets/images/blueRing.png");
                    game.load.image('littleBlueRing', "assets/images/littleBlueRing.png");
                    game.load.image('YellowRing', "assets/images/yellowRing.png");
                    game.load.image('littleYellowRing', "assets/images/littleYellowRing.png");
                    game.load.image('RedRing', "assets/images/redRing.png");
                    game.load.image('littleRedRing', "assets/images/littleRedRing.png");

                    //鸟在圈
                    game.load.image('BlueInRing', "assets/images/blueInRing.png");
                    game.load.image('littleBlueInRing', "assets/images/littleBlueInRing.png");
                    game.load.image('YellowInRing', "assets/images/yellowInRing.png");
                    game.load.image('littleYellowInRing', "assets/images/littleYellowInRing.png");
                    game.load.image('RedInRing', "assets/images/redInRing.png");
                    game.load.image('littleRedInRing', "assets/images/littleRedInRing.png");
                    
                    game.load.atlasJSONArray('birdRed', 'assets/images/birdRed.png', 'assets/images/birdRed.json');
                    game.load.atlasJSONArray('birdYellow', 'assets/images/birdYellow.png', 'assets/images/birdYellow.json');
                    game.load.atlasJSONArray('birdBlue', 'assets/images/birdBlue.png', 'assets/images/birdBlue.json');
                    game.load.atlasJSONArray('littleBirdRed', 'assets/images/littleBirdRed.png', 'assets/images/littleBirdRed.json');
                    game.load.atlasJSONArray('littleBirdYellow', 'assets/images/littleBirdYellow.png', 'assets/images/littleBirdYellow.json');
                    game.load.atlasJSONArray('littleBirdBlue', 'assets/images/littleBirdBlue.png', 'assets/images/littleBirdBlue.json');
                    game.load.atlasJSONArray('man', 'assets/images/man.png', 'assets/images/man.json');
                    game.load.atlasJSONArray('woman', 'assets/images/woman.png', 'assets/images/woman.json');

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
                    // game.world.setBounds(0, 0, game.world.width, game.world.height);
                    // 示例-创建游戏背景
                    this.bgGroup = game.add.group();

                    this.bg1 = game.add.image(0, 0, "bg");
                    this.bg1.width = game.world.width;
                    this.bg1.height = game.world.height;
                    var bg2 = game.add.image(0, 0, "bg1");
                    bg2.width = game.world.width;
                    bg2.height = game.world.height;
                    var bg3 = game.add.image(0, game.world.height * 1 * self.upward, "bg2");
                    bg3.width = game.world.width;
                    bg3.height = game.world.height;
                    var bg4 = game.add.image(0, game.world.height * 2 * self.upward, "bg2");
                    bg4.width = game.world.width;
                    bg4.height = game.world.height;
                    var bg5 = game.add.image(0, game.world.height * 3 * self.upward, "bg2");
                    bg5.width = game.world.width;
                    bg5.height = game.world.height;
                    var bg6 = game.add.image(0, game.world.height * 4 * self.upward, "bg3");
                    bg6.width = game.world.width;
                    bg6.height = game.world.height;
                    // this.bgGroup.add(bg1);
                    this.bgGroup.add(bg2);
                    this.bgGroup.add(bg3);
                    this.bgGroup.add(bg4);
                    this.bgGroup.add(bg5);
                    this.bgGroup.add(bg6);
                    this.bgGroup.alpha = 0;

                    // this.cloud1 = game.add.sprite(0, game.world.height * 0.55 + game.world.height, 'cloud1', 0, this.bgGroup);
                    // this.cloud1.anchor.setTo(0, 0.5);
                    // this.scaling(this.cloud1, game.world.width * 0.44);
                    this.cloud1 = this.generateCloud(this.cloud1, 0, game.world.height * 0.55, 'cloud1', game.world.width * 0.44);                    
                    this.cloud2;
                    

                    // this.ringGroup = game.add.group();
                    // this.ringGroup.enableBody = true; //启用物理系统

                    this.man = this.generateHuman(this.man, this.cloud1.x + this.cloud1.width / 2, this.cloud1.y + self.manOffsetY, 'man');
                    this.woman;
                                                
                                    
                    this.birdGroup = game.add.group();
                    this.birdGroup.enableBody = true; //启用物理系统
                    // this.birdGroup.setAll('checkWorldBounds', true); //边界检测
                    // this.birdGroup.setAll('outOfBoundsKill', true); //出边界后自动kill

                    // 示例-创建游戏元素
                    // var star = game.add.sprite(game.world.centerX, game.world.centerY, "birdRed");

                    // star.anchor.setTo(0.5, 0.5);

                    // 示例-创建动画
                    // game.add.tween(star).to({ y: star.y - 100 }, 1000, Phaser.Easing.Linear.None, true, 0, -1, true);
                    this.hasStarted = false;
                    this.catchBird;
                    this.level = 0;
                    this.offsetX = 0;
                    this.offsetY = 0;
                    this.ringArr = [];
                    this.countOutTime3 = 0; //检测第三四关牛郎出界的次数
                    this.countOutTime4 = 0;

                    this.guideArrow1;
                    this.guideArrow2;
                    // game.input.onDown.add(function(){
                    //     this.nextLevel(this.bgGroup);
                    // }, this);

                    this.bigOrlittle = 0; //1为小鸟，0 2为大鸟
                    
                    //设置定时器
                    game.time.events.add(1000, function() {
                        // this.nextLevel(this.bgGroup);
                        this.showLevel();
                    }, this);
                    //开启定时器
                    game.time.events.start();

                    game.time.events.add(2000, this.startGame, this);                                                       
                };

                //全景切换到第一关游戏开始
                this.startGame = function(){
                    this.hasStarted = true;
                    game.time.events.add(8000, this.manMove, this);                
                    this.generateBirdTime = Phaser.Timer.SECOND * 0.7;
                    this.generateBirdLoop = game.time.events.loop(this.generateBirdTime, this.generateBirds, this);
                    game.time.events.add(1000, this.guide, this);
                }

                //显示第一关
                this.showLevel = function(){                          
                    var tween1 = game.add.tween(this.bg1).to({ alpha: 0 }, 1000, null, true, 0);
                    var tween2 = game.add.tween(this.bgGroup).to({ alpha: 1 }, 1000, null, true, 500);
                    this.level++;   
                    this.generateRings();
                    // tween1.chain(tween2);
                }

                //新手提示
                this.guide = function(){
                    
                    var ring = this.ringArr[0];
                    var bird = this.addBird(ring.x, ring.y - ring.height * 2.5, ring.color);                   
                    this.initBird(bird, ring.color);                 
                    bird.body.velocity.x = 0;
                    bird.body.velocity.y = 0;

                    var arrow = game.add.sprite(ring.x,ring.y - ring.height * 0.8, 'arrow');
                    this.scaling(arrow, 80);
                    // arrow.tint = Math.random() * 0xffffff;
                    arrow.anchor.setTo(0.5, 1);
                    this.scaling(arrow, game.width * 0.1);
                    bird.arrow = arrow;                  
                    var tween = game.add.tween(arrow).to({
                            alpha: 0.2
                        }, 1000, null, true, 0, Number.MAX_VALUE, true);
                }

                //牛郎开始走
                this.manMove = function(){
                    this.man.animations.add('move', [0, 1, 2], 5, true);
                    this.man.animations.play('move');

                    this.man.body.velocity.x = self.moveVel;
                }

                //检测牛郎是否出界,能够出界，说明切换到下一关
                this.manOut = function(){
                            
                    if(this.level < 3 || Math.abs(this.man.x - this.man.width / 2) > game.world.width * 2.5){
                        if(this.man.x - this.man.width / 2 > game.world.width){//右边界
                            this.man.x = 0 - this.man.width;
                            this.man.y = this.ringArr[0].y - this.ringArr[0].height / 2 + self.manOffsetY;
                        }
                    }

                    else{
                        //第三关并且牛郎第一次超出右边界 或 第四关牛郎第一次超出左边界
                        if((this.level == 3 && this.man.x - this.man.width / 2 > game.world.width && this.countOutTime3 == 0||
                            this.level >= 4 && this.man.x + this.man.width / 2 < 0 && this.countOutTime4 == 0) 
                            ){
                            if(this.level >= 4){
                                this.man.body.velocity.x = Math.abs(this.man.body.velocity.x);
                                this.man.width = Math.abs(this.man.width);
                                this.countOutTime4++;
                            }
                            else this.countOutTime3++;
                            this.man.x = 0 - this.man.width;
                            this.man.y = this.ringArr[0].y - this.ringArr[0].height / 2 + self.manOffsetY;
                            
                        }
                        //牛郎第二次超出右边界
                        else if((this.level == 3 && this.countOutTime3 == 1 || this.level == 4 && this.countOutTime4 == 1) &&
                            this.man.x - this.man.width / 2 > game.world.width){
                            console.log(this.level);
                            this.man.x = game.world.width - this.man.width;
                            this.man.y = this.ringArr[this.ringArr.length - 1].y - this.ringArr[this.ringArr.length - 1].height / 2 + self.manOffsetY;
                            this.man.body.velocity.x *= -1;
                            this.man.width *= -1;
                            if(this.level == 3)
                                this.countOutTime3 = 0;
                            else this.countOutTime4 = 0;
                        }
                    }                 
                }

                //牛郎掉下去
                this.manDown = function(){
                    this.man.animations.stop('move');
                    this.man.body.velocity.x = 0;
                    this.man.body.gravity.y = 1000;

                    this.gameOver();
                }

                //检测牛郎所站的圈是否有鸟
                this.checkHasBird = function(man, ring){                    
                    if(!ring.hasBird && Math.abs(man.x - ring.x) < 10){//没有鸟就掉下去
                        // game.time.events.add(1000, this.manDown, this);
                        this.manDown();
                    }
                }

                //检测当前关卡圈圈是否填满鸟
                this.checkRing = function(){
                    if(this.ringArr.length > 0){
                        for(var i = 0; i < this.ringArr.length; i++){
                            if(!this.ringArr[i].hasBird){
                                return false;
                            }
                        }
                        // console.log(this.ringArr);
                        return true;
                    }
                    return false;
                }

                //牛郎碰到织女，胜利
                this.win = function(){

                }

                //牛郎掉下去，失败
                this.gameOver = function(){

                }

                //控制缩放
                this.scaling = function(sprite, size){
                    if(!size){
                        console.warn("size is missing");
                        return;
                    }
                    if(!sprite){
                        console.warn("sprite is undefine");
                        return;
                    }
                    
                    // sprite.width = size;
                    if(sprite.key.indexOf('bird') != -1 || sprite.key.indexOf('Bird') != -1){
                        sprite.width = size;
                        sprite.height = sprite.width * (game.cache.getImage(sprite.key).height / 2) / game.cache.getImage(sprite.key).width;        
                    }else if(sprite.key.indexOf('man') != -1){                        
                        // sprite.height = sprite.width * game.cache.getImage(sprite.key).height / (game.cache.getImage(sprite.key).width / 3);
                        // sprite.height = sprite.width * sprite.height / temp;
                        var temp = sprite.width;
                        var temp1 = sprite.height;
                        sprite.height = size;
                        sprite.width = sprite.height * temp / temp1;
                    }
                    else{
                        sprite.width = size;
                        sprite.height = sprite.width * game.cache.getImage(sprite.key).height / game.cache.getImage(sprite.key).width;
                    }

                }

                //生成一个圈
                this.addRing = function(colorNum, little, littleColorNum){
                    var index = game.rnd.integerInRange(0, self.colorArr.length - 1); // 随机
                    var color = self.colorArr[index]; // 圈的颜色
                    if(!little) 
                        colorNum[index]++;
                    else
                        littleColorNum[index]++;
                    var ring = game.add.sprite(0, 0, (little||'') + color + 'Ring', 0, this.bgGroup);
                    ring.color = color;
                    ring.hasBird = false;
                    ring.anchor.set(0.5);

                    this.game.physics.enable(ring, Phaser.Physics.ARCADE); //开启云的物理系统

                    return ring;
                }


                //生成圈
                this.generateRings =function(){
                    var colorNum = [0, 0, 0];// 蓝、黄、红圈的数量
                    var littleColorNum = [0, 0, 0];

                    // var index; // 随机
                    // var color; // 圈的颜色  
                    if (this.level == 1) {
                        for (var i = 0; i < self.ringNumArr[this.level - 1]; i++) {
                            var ring = this.addRing(colorNum);

                            this.scaling(ring, game.world.width * 0.14);

                            ring.x = this.cloud1.width + ring.width * (0.5 + i);
                            ring.y = this.cloud1.y + ring.height / 2;

                            this.ringArr.push(ring);
                        }

                    }
                    else if(this.level == 2){
                        for(var i = 0; i < self.ringNumArr[this.level - 1]; i++){
                            var ring = this.addRing(colorNum);

                            this.scaling(ring, game.world.width / self.ringNumArr[this.level - 1]);

                            ring.x = ring.width * (0.5 + i);
                            ring.y = (this.level + 0.5 - 2) * game.world.height * self.upward + ring.height / 2;
                            // console.log("第二关的圈");
                            this.ringArr.push(ring);
                        }
                        
                    }
                    else if(this.level == 3 || this.level == 4){
                        for(var i = 0; i < self.ringNumArr[this.level - 1]; i++){
                            var ring = this.addRing(colorNum);

                            var harfRingNum = self.ringNumArr[this.level - 1] / 2;
                            this.scaling(ring, game.world.width / harfRingNum);

                            if(i < harfRingNum){
                                ring.x = ring.width * (0.5 + i);
                                ring.y = (this.level + 0.3 - 2) * game.world.height * self.upward + ring.height / 2;
                            }
                            else{
                                ring.x = ring.width * (0.5 + i - harfRingNum);
                                ring.y = (this.level + 0.65 - 2) * game.world.height * self.upward + ring.height / 2;
                            }
                            this.ringArr.push(ring);
                        }
                        this.arrowGuide(this.guideArrow1, 0, this.ringArr[1].y + this.ringArr[1].height * 1.2, -90, game.world.width * 0.8);
                        this.arrowGuide(this.guideArrow2, game.world.width * 0.8, this.ringArr[this.ringArr.length - 1].y + this.ringArr[this.ringArr.length - 1].height * 1.2, 90, game.world.width * 0.2);
                    }
                    else if(this.level == 5){
                        var bigRingWidth;
                        var bigRingHeight;
                        var bigRingY;
                        var harfRingNum;                        
                        for(var i = 0; i < self.ringNumArr[this.level - 1]; i++){                            
                            harfRingNum = Math.ceil(self.ringNumArr[this.level - 1] / 2);
                                                        
                            if(i < harfRingNum){//大圈
                                var ring = this.addRing(colorNum);
                                this.scaling(ring, game.world.width / (harfRingNum + 3));                               

                                ring.x = ring.width * (0.5 + i);
                                ring.y = (this.level + 0.5 - 2) * game.world.height * self.upward + ring.height / 2;

                                bigRingWidth = ring.width;
                                bigRingHeight = ring.height;
                                bigRingY = ring.y;
                            }
                            else{//小圈
                                var ring = this.addRing(colorNum, 'little', littleColorNum);
                                this.scaling(ring, (game.world.width / (harfRingNum + 3)) / 1.5);

                                ring.x = bigRingWidth * (i - harfRingNum + 1);
                                // ring.y = bigRingY +   + bigRingHeight / 2;
                                ring.y = bigRingY + Math.pow(Math.pow(ring.width / 2 + bigRingWidth / 2, 2) - Math.pow(bigRingWidth / 2, 2), 0.5); // 勾股定理，求与大圈y轴方向的间距
                                                            
                            }
                            
                            this.ringArr.push(ring);
                        }          
                        //生成织女和云彩                        
                        this.cloud2 = this.generateCloud(this.cloud2, bigRingWidth * harfRingNum, bigRingY - bigRingHeight / 2, 'cloud2', game.world.width - bigRingWidth * harfRingNum);
                        this.woman = this.generateHuman(this.woman, this.cloud2.x + this.cloud2.width / 2, this.cloud2.y  + self.manOffsetY, 'woman');
                        this.man.bringToTop();
                    }

                    //检查生成的圈是否包含所有的颜色                    
                    for(var i = 0; i < colorNum.length; i++){
                        if(colorNum[i] == 0 && this.level < 5){
                            var j = i;
                            var index = self.colorArr.indexOf(this.ringArr[this.ringArr.length - i - 1].color);
                            if(colorNum[index] <= 1){
                                j++;
                            }
                            this.ringArr[this.ringArr.length - j - 1].loadTexture(self.colorArr[i] + 'Ring', 0, false);
                            this.ringArr[this.ringArr.length - j - 1].color = self.colorArr[i];                      
                        }                        
                    }

                    if (this.level >= 5) {
                        for (var i = 0; i < colorNum.length; i++) {
                            if (colorNum[i] == 0) {
                                this.ringArr[i].loadTexture(self.colorArr[i] + 'Ring', 0, false);
                                this.ringArr[i].color = self.colorArr[i];
                            }
                        }
                        for (var i = 0; i < littleColorNum.length; i++) {
                            if (littleColorNum[i] == 0) {
                                this.ringArr[this.ringArr.length - i - 1].loadTexture('little' + self.colorArr[i] + 'Ring', 0, false);
                                this.ringArr[this.ringArr.length - i - 1].color = self.colorArr[i];
                            }
                        }
                    }
                                       
                }

                //生成指示箭头，用于引导牛郎的移动方向
                this.arrowGuide = function(arrow, x, y, angle, targetX){
                    if(!arrow){
                        arrow = game.add.sprite(x, y, 'arrow', 0, this.bgGroup);
                    }
                    else{
                        arrow.x = x;
                        arrow.y = y;
                    }
                    arrow.anchor.set(0.5);
                    this.scaling(arrow, game.world.width * 0.07);
                    arrow.angle = angle;
                    var tween = game.add.tween(arrow).to({ x: targetX, alpha: 0.5}, 2500, null, true, 0, Number.MAX_VALUE);
                    // this.guideArrow1 = game.add.sprite(0, this.ringArr[1].y + this.ringArr[1].height * 1.2, 'arrow', 0, this.bgGroup);
                    // this.scaling(this.guideArrow1, game.world.width * 0.07);
                    // this.guideArrow1.angle = -90;
                    // var tween = game.add.tween(this.guideArrow1).to({ x: game.world.width * 0.8, alpha: 0.5}, 2500, null, true, 0, Number.MAX_VALUE);
                }

                //生成云
                this.generateCloud = function(sprite, x, y, key, width){
                    sprite = game.add.sprite(x, y, key, 0, this.bgGroup);
                    sprite.anchor.setTo(0, 0.5);
                    this.scaling(sprite, width);
                    this.game.physics.enable(sprite, Phaser.Physics.ARCADE); //开启云的物理系统
                    return sprite;
                }

                //生成人
                this.generateHuman = function(sprite, x, y, key, width){
                    sprite = game.add.sprite(x, y, key, 0, this.bgGroup);
                    sprite.anchor.setTo(0.5, 1);
                    // if(key.indexOf('woman') != -1)
                    //     this.scaling(sprite, game.world.width * 0.10);
                    // else
                    //     this.scaling(sprite, game.world.width * 0.15);
                    this.scaling(sprite, game.world.height * 0.14);
                    this.game.physics.enable(sprite, Phaser.Physics.ARCADE);

                    return sprite;
                }


                this.addBird = function(birdX, birdY, color) {
                    if (this.level == 5) {
                        if (this.bigOrlittle == 1) {
                            console.log("生成小鸟");
                            var bird = game.add.sprite(birdX, birdY, 'littleBird' + color, 0, this.birdGroup);
                        } else {
                            console.log("生成鸟");
                            var bird = game.add.sprite(birdX, birdY, 'bird' + color, 0, this.birdGroup);
                        }
                        this.bigOrlittle++;
                        this.bigOrlittle %= 3;
                        console.log(this.bigOrlittle);
                    } else {
                        console.log("生成鸟");
                        var bird = game.add.sprite(birdX, birdY, 'bird' + color, 0, this.birdGroup);
                    }

                    return bird;
                }

                //检测当前鸟组缺乏的颜色
                this.checkLackColor = function(){
                    var colorNum = [0, 0, 0]; 
                    var lackColorIndex = -1;    
                    this.birdGroup.forEachExists(function(bird){
                        if(!bird.inRing){
                            var index = self.colorArr.indexOf(bird.color);
                            colorNum[index]++;
                        }
                    });

                    for(var index = 0; index < colorNum.length; index++){
                        if(colorNum[index] == 0){//没有这种鸟的颜色
                            lackColorIndex = index;
                            console.log("缺乏"+self.colorArr[lackColorIndex]);
                            break;
                        }
                    }
                    return lackColorIndex;
                }

                //生成鸟
                this.generateBirds = function(){
                    if(game.rnd.integerInRange(0, 1)){
                        birdX = game.rnd.integerInRange(0 - game.world.width * 0.1,0 - game.world.width * 0.2);
                        birdY = game.rnd.integerInRange(0 + game.world.height * 0.3, game.world.height * 0.7);
                    }
                    else{
                        birdX = game.rnd.integerInRange(game.world.width * 1.1 , game.world.width * 1.2); // 鸟的位置范围
                        birdY = game.rnd.integerInRange(0 + game.world.height * 0.3, game.world.height * 0.7); 
                    }
                    // birdX = game.rnd.integerInRange(0 + game.width * 0.3, game.width * 0.7); // 鸟的位置范围
                    // birdY = game.rnd.integerInRange(0 + game.height * 0.3, game.height * 0.7);       
                    
                    var color;
                    var lackColorIndex = this.checkLackColor();
                    if(lackColorIndex != -1){
                        color = self.colorArr[lackColorIndex];
                    }
                    else{
                        color = self.colorArr[game.rnd.integerInRange(0, self.colorArr.length - 1)]; // 鸟的颜色
                    }
                    // if(this.level < 5 && this.resetBird(birdX, birdY, color)) return;

                    if(this.resetBird(birdX, birdY, color)) return;                    
                   
                    var bird = this.addBird(birdX, birdY, color);

                    this.initBird(bird, color);                       
                }

                //出界Kill掉
                this.checkOutOfBoundKill = function(group){
                    group.forEachExists(function(e){
                        if(e.x < 0 - game.world.width * 0.3 ||
                            e.x > game.world.width * 1.3 ||
                            e.y < 0 - e.world.height ||
                            e.y > game.world.height + e.height){
                            e.kill();
                        }
                    }, this);
                }

                //初始化鸟
                this.initBird = function(bird, color){
                    bird.color = color; // 鸟的颜色
                    bird.isCatch = false; // 鸟是否被抓住 
                    bird.inRing = false; // 鸟是否在圈中                 

                    bird.animations.add('fly', [0, 1], 5, true);
                    bird.animations.play('fly');
                    bird.anchor.set(0.5);
                    if(bird.key.indexOf('little') == -1)
                        this.scaling(bird, self.birdWidth);// 按比例缩放大小
                    else
                        this.scaling(bird, self.littleBirdWidth);

                    // var dirX = game.rnd.integerInRange(0, 1);
                    // if(dirX == 0){//往左飞
                    //     dirX = -1;
                    //     bird.width *= -1;
                    // }else{
                    //     bird.width = Math.abs(bird.width);
                    // }
                    var dirX;
                    if(bird.x > game.world.width){//往左飞
                        dirX = -1;
                        bird.width *= -1;
                    }else{
                        dirX = 1;
                        bird.width = Math.abs(bird.width);
                    }

                    // console.log('鸟的宽度：' + bird.width);
                    // console.log('鸟的x坐标：' + bird.x);
                    bird.body.velocity.x = 180 * dirX;
                    var dirY = game.rnd.integerInRange(-1, 1);
                    bird.body.velocity.y = 100 * dirY;

                    // this.birdGroup.setAll('checkWorldBounds', true); //边界检测
                    // game.time.events.add(5000, function() {
                    //     this.birdGroup.setAll('outOfBoundsKill', true); //出边界后自动kill
                    // }, this);
                    // this.birdGroup.setAll('outOfBoundsKill', true); //出边界后自动kill
                }

                //重置鸟
                this.resetBird = function(x, y, color){
                    var i = 0;
                    var reset = true;
                    this.birdGroup.forEachDead(function(bird){
                        if (!reset) return;
                        
                        if (bird.color == color && reset) {
                            if (this.level >= 5) {
                                if ((this.bigOrlittle == 1 && bird.key.indexOf('little') != -1) ||
                                    (this.bigOrlittle != 1 && bird.key.indexOf('little') == -1)) {
                                    console.log("重置" + bird.color + "鸟");
                                    bird.reset(x, y);
                                    this.initBird(bird, color);
                                    i++;
                                    reset = false;
                                    this.bigOrlittle++;
                                    this.bigOrlittle %= 3;
                                }
                            } else {
                                if (bird.color == color && reset) { //有kill掉的小鸟，此时要生成小鸟，可重置
                                    console.log("重置" + bird.color + "鸟");
                                    bird.reset(x, y);
                                    this.initBird(bird, color);
                                    i++;
                                    reset = false;
                                }
                            }
                        }
                        
                    }, this);
                    return i == 1;
                }

                //鸟怎么飞
                this.flyBird = function(birdGroup){
                    this.birdGroup.forEachExists(function(bird) {
                        bird
                    }, this);
                }

                // 点击小鸟
                this.clickBird = function(birdGroup) {
                    if(this.catchBird || !game.input.pointer1.active){
                        return;
                    }
                    var birds = [];

                    this.birdGroup.forEachExists(function(bird) {
                        if(bird.inRing) return; // 在圈中的鸟不算
                        if ((game.input.x * 2 <= bird.x + Math.abs(bird.width) / 2) &&
                            (game.input.x * 2 >= bird.x - Math.abs(bird.width) / 2) &&
                            (game.input.y * 2 <= bird.y + bird.height / 2) &&
                            (game.input.y * 2 >= bird.y - bird.height / 2)) {
                            birds.push(bird);
                        }
                    }, this);
                    

                    if(birds.length > 1){
                        //返回在最上层的鸟                       
                        var max = birds[0];
                        for(var i = 1; i < birds.length; i++){
                            if(birdGroup.getIndex(max) < birdGroup.getIndex(birds[i])){
                                max = birds[i];
                            }
                        }
                        this.getOffset(max);
                        max.isCatch = true;
                        return max;
                    }
                    else if(birds.length == 1){                            
                        birds[0].isCatch = true;  
                        this.getOffset(birds[0]);
                        return birds[0];
                    }
                    else{
                        return null;
                    }
                    
                }

                //获得偏移量
                this.getOffset = function(bird){
                    this.offsetX = bird.x - game.input.x * 2;
                    this.offsetY = bird.y - game.input.y * 2;
                }

                //拖动小鸟
                this.dragBird = function(birdGroup){
                    if(this.clickBird(birdGroup)){// 点击到小鸟
                        // var pointer=game.input.activePointer; //获取最近一次激活的Pointer对象
                        if(game.input.pointer1.isDown){//第一根手指
                            // var bird = this.clickBird(birdGroup);
                            this.catchBird = this.clickBird(birdGroup);
                            this.catchBird.x = game.input.x * 2 + this.offsetX;
                            this.catchBird.y = game.input.y * 2 + this.offsetY;
                        }        

                    }
                    else if(this.catchBird && game.input.pointer1.isDown){
                        this.catchBird.x = game.input.x * 2 + this.offsetX;
                        this.catchBird.y = game.input.y * 2 + this.offsetY;    
                    }
                    if(game.input.pointer1.isUp && this.catchBird){
                        this.catchBird = null;                   
                    }
                }

                //被抓住过的小鸟放开后会逃跑
                this.runBird = function(bird){
                    if(bird.isCatch == true && game.input.pointer1.isUp && !bird.inRing){
                        if(bird.body.velocity.x > 0)
                            bird.body.velocity.x = 500;
                        else
                            bird.body.velocity.x = -500;
                        bird.body.velocity.y = 0;

                        setTimeout(function(){
                            bird.isCatch = false;
                        }, 100);
                        
                    }
                }

                //屏幕移动到下一关
                this.nextLevel = function(group){
                    if(this.level >= 5) {
                        return;
                    }
                    this.level++;
                    if(this.level >= 5){
                        this.generateBirdLoop.delay = 500;
                        if(this.guideArrow1) this.guideArrow1.destroy();
                        if(this.guideArrow2) this.guideArrow2.destroy();
                    }                   
                    this.ringArr = [];
                    this.generateRings();
                    this.man.velocity += 40;
                    // game.add.tween(group).to({ y: group.y - game.world.height }, 2000, Phaser.Easing.Linear.None, true, 1000);
                    game.add.tween(group).to({ y: group.y - game.world.height  * self.upward}, 1000, Phaser.Easing.Linear.None, true, 500);
                }

                //将鸟抓入圈子
                this.catchToRing = function(ring, bird){

                    
                    if(bird.isCatch && bird.color == ring.color && !ring.hasBird && game.input.pointer1.isUp){//鸟被抓住，鸟与圈颜色相同，圈没有鸟, 松开手
                        if((bird.key.indexOf('little') != -1 && ring.key.indexOf('little') != -1) ||
                            bird.key.indexOf('little') == -1 && ring.key.indexOf('little') == -1){//大小
                            bird.x = ring.x;
                            // bird.y = ring.y - game.world.height * this.level;
                            bird.y = ring.y;
                            bird.body.velocity.x = 0;
                            bird.body.velocity.y = 0;
                            bird.animations.stop('fly', 0);
                            bird.inRing = true;
                            bird.loadTexture(((bird.key.indexOf('little') != -1) ? 'little' : '')
                             + bird.color + 'InRing', 0, false);
                            this.scaling(bird, ring.width);//将鸟缩放到圈的大小

                            ring.hasBird = true;
                            this.bgGroup.add(bird);

                            if(bird.arrow) bird.arrow.destroy();
                        }
                    }
                }




                this.update = function() {
                    // 每一帧更新都会触发
                    if(!this.hasStarted) return;
                    if(this.checkRing()) {
                        this.nextLevel(this.bgGroup);
                    }
                    // console.log(game.input.pointer1.x + '   ' + game.input.pointer1.y);
                    // console.log(game.input.pointer1);
                    this.manOut();
                    this.dragBird(this.birdGroup);
                    this.checkOutOfBoundKill(this.birdGroup);
                    this.birdGroup.forEachExists(this.runBird, this);

                    game.physics.arcade.overlap(this.birdGroup, this.ringArr, this.catchToRing, null, this); // 检测鸟与圈的碰撞
                    game.physics.arcade.overlap(this.man, this.ringArr, this.checkHasBird, null, this);// 检测牛郎与圈的碰撞

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
