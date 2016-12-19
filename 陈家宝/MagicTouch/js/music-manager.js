/* 音乐管理器 */
define(function() {
	var MusicManager = function(gameInstance, deviceInfo) {
		this.gameInstance = gameInstance;
		this.deviceInfo = deviceInfo;
	};
	MusicManager.prototype = {
		// 游戏实例
		gameInstance : null,
		// 设备信息
		deviceInfo : null,
		// 资源
		assets : null,
		// 音乐对象
		musicObject : null,
		// 静音标记
		isBaned : false,
		// 是否播放中
		isPlaying : false,
		// 正在播放列表
		playingList : [],
		// 初始化
		init : function(assets) {
			var self = this;
			this.assets = assets;
			if (this.assets) {
				this.musicObject = {};
				for (var index=0,len = this.assets.length;index<len;index++) {
					var audio = this.gameInstance.add.audio(this.assets[index]);
					audio.name = this.assets[index];
					audio.onPause.add(function() {
						self.playingList = self.playingList.splice(self.playingList.indexOf(audio.name), 1);
						if (self.playingList.length == 0) self.isPlaying = false;
					});
					audio.onStop.add(function() {
						self.playingList = self.playingList.splice(self.playingList.indexOf(audio.name), 1);
						if (self.playingList.length == 0) self.isPlaying = false;
					});
					this.musicObject[this.assets[index]] = audio;
				}
			}
		},
		// 播放
		play : function(assetName, loop) {
			if (!this.isBaned) {
				var playTag = false;
				if (this.deviceInfo.platform == "apple") {
					playTag = true;
				} else if (this.deviceInfo.platform == "android" && !this.isPlaying) {
					playTag = true;
				}
				if (playTag) {
					if (loop) {
						if (!this.musicObject[assetName].isPlaying){
							this.musicObject[assetName].loopFull();
							this.playingList.push(assetName);
						}
					} else {
						if (!this.musicObject[assetName].isPlaying) {
							this.musicObject[assetName].play();
							this.playingList.push(assetName);
						}
					}
					this.isPlaying = true;
				}
			}
		},
		resume : function() {
			for (var item in this.playingList) {
				var name = this.playingList[item];
				this.musicObject[name].resume();
			}
			this.isPlaying = true;
		},
		pause : function() {
			for (var item in this.playingList) {
				var name = this.playingList[item];
				this.musicObject[name].pause();
			}
			this.isPlaying = false;
		},
		stop : function() {
			for (var item in this.playingList) {
				var name = this.playingList[item];
				this.musicObject[name].stop();
			}
			this.isPlaying = false;
			this.playingList = [];
		},
		ban : function() {
			this.isBaned = true;
			this.pause();
		},
		disban : function() {
			this.isBaned = false;
			this.resume();
		}
	};
	return MusicManager;
});