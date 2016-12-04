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
					//从plsyingList中移除audio.name这个元素，什么时候存进去的???
					audio.onPause.add(function() {
						self.playingList = self.playingList.splice(self.playingList.indexOf(audio.name), 1);
						if (self.playingList.length == 0) 
							self.isPlaying = false;
					});
					//从plsyingList中移除audio.name这个元素，什么时候存进去的???
					audio.onStop.add(function() {
						self.playingList = self.playingList.splice(self.playingList.indexOf(audio.name), 1);
						if (self.playingList.length == 0) 
							self.isPlaying = false;
					});
					//把所有添加的音频存进musicObject里面
					this.musicObject[this.assets[index]] = audio;
				}
			}
		},
		// 调用一次play()，this.playing变为true，此时再调用play()也无法进行播放操作
		play : function(assetName, loop) {
			if (!this.isBaned) {
				var playTag = false;
				if (this.deviceInfo.platform == "apple") {
					playTag = true;
				} else if (this.deviceInfo.platform == "android" && !this.isPlaying) {
					playTag = true;
				}
				//在这里把添加的音频存进playingList里面
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
		//对那些在playingList的音频进行操作
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