var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var PageStore = require('../../../../stores/PageStore');

var _animationTimer = null;
var _soundTimer = null;

var ActiveDialogComponent = React.createClass({
    assetQueue: [],
    assets2Render: [],
    bAnimationPlaying: false,
    bIdleOrChatLoop: false,
    bSoundLoading: false,
    bSoundPlaying: false,
    currentAnimation: "",
    currentChatAnimationName: "",
    currentIdleAnimationName: "Default",
    currentStop: "",
    currentVideosPlayingHack: [],
    hack: false,

    videoCurrentLoading: null,

    propTypes: {
        name: React.PropTypes.string.isRequired,
        onLoadStart: React.PropTypes.func,
        onLoadDone: React.PropTypes.func,
        onPlayingDone: React.PropTypes.func
    },

    getInitialState: function() {
        var assetsNotReady = this.props.assets ? this.props.assets.length : 0;

        // get first asset
        this.assetQueue = [];
        for (var assetIndex in this.props.assets) {
            this.assetQueue.push(this.props.assets[assetIndex]);
        }
        this.assets2Render.push(this.assetQueue.shift());

        // look up chat animation
        this.findChatAnimation();

        // trigger callback function
        if (this.props.onLoadStart !== null) {
            this.props.onLoadStart();
        }

        return {
            assetsNotReady: assetsNotReady
        }
    },

    componentWillUnmount: function() {
        if (_animationTimer) {
            clearInterval(_animationTimer);
        }
    },

    changeIdleAnimation: function(animationName) {
        this.currentIdleAnimationName = animationName;
        if (this.bAnimationPlaying === false) {
            this.playAnimationVideo(this.currentIdleAnimationName);
            this.bIdleOrChatLoop = true;
        }
    },

    changeChatAnimation: function(animationName) {
        this.currentChatAnimationName = animationName;
    },

    checkDonePlaying: function() {
        if (this.bSoundPlaying) {
            // set idle animation as the chat animation
            this.currentIdleAnimationName = this.currentChatAnimationName;

            if (!this.bAnimationPlaying) {
                this.playAnimationVideo(this.currentIdleAnimationName);
                this.bIdleOrChatLoop = true;
            }
        }

        // if no animation or sound is playing then trigger callback
        else if (!this.bAnimationPlaying && !this.bSoundPlaying && !this.bSoundLoading) {
            // go back to idle
            this.currentIdleAnimationName = "Default";
            this.playAnimationVideo(this.currentIdleAnimationName);
            this.bIdleOrChatLoop = true;

            if (this.props.onPlayingDone !== null) {
                this.props.onPlayingDone();
            }
        }
    },

    findChatAnimation: function() {
        var assetLength = this.props.assets.length;
        while(assetLength--) {
            var asset = this.props.assets[assetLength];
            var assetData = asset.assetData;

            if (assetData && assetData.animations) {
                for (var animationName in assetData.animations) {
                    if (animationName.toLowerCase().indexOf("chat") !== -1) {
                        this.currentChatAnimationName = animationName;
                        break;
                    }
                }
            }
        }
    },

    hideVideos: function() {
        if (_animationTimer) {
            clearInterval(_animationTimer);
        }

        // hide all videos that are playing
        var vidLength = this.currentVideosPlayingHack.length;
        while(vidLength--) {
            var video = this.currentVideosPlayingHack[vidLength];

            // stop video
            video.pause();

            // hide video
            video.style.display = "none";
        }
    },

    playAnimationVideo: function(animationName) {
        var bFoundVideo2Play = false;

        // reset hacks
        this.bIdleOrChatLoop = false;
        this.hideVideos();
        this.currentVideosPlayingHack = [];

        // get video
        var assetLength = this.props.assets.length;
        while(assetLength--) {
            var asset = this.props.assets[assetLength];
            var assetData = asset.assetData;

            if (assetData.animations && assetData.animations.hasOwnProperty(animationName)) {
                var animation = assetData.animations[animationName];
                var source = assetData.source;

                // get video element
                var video = document.getElementById(source);

                // set current time
                video.currentTime = animation.start / 1000;

                // set current animation playing
                this.currentAnimation = animationName;
                this.currentStop = animation.stop / 1000;


                // show video
                video.style.display = "block";

                // add to hack
                this.currentVideosPlayingHack.push(video);

                // increment counter if animation is not the default one otherwise play
                if (animationName != this.currentIdleAnimationName) {
                    bFoundVideo2Play = true;

                } else {
                    video.play();

                    // set timer
                    var self = this;
                    _animationTimer = setInterval(function() {
                        self.videoTimeUpdateHandler(video);
                    }, 100);
                }
            }
        }

        // if found videos attempt to play them
        if (bFoundVideo2Play === true) {
            this.syncPlayback();
        }
    },

    videoCanPlayThroughHandler: function(event) {
        if (this.hack === true) {
            return;
        }

        // remove event listener
        if (event.currentTarget) {
            event.currentTarget.removeEventListener(event.type, this.videoCanPlayThroughHandler);
        }

        // decrease count
        this.state.assetsNotReady--;

        // add next video to list
        if (this.assetQueue.length > 0) {
            this.assets2Render.push(this.assetQueue.shift());
            this.forceUpdate();
        }

        // all videos for this asset are ready to play
        if (this.state.assetsNotReady <= 0) {

            // set ready

            // play default animation
            this.playAnimationVideo(this.currentIdleAnimationName);
            this.bIdleOrChatLoop = true;

            // update stupid hack
            this.hack = true;

            // trigger callback function
            if (this.props.onLoadDone !== null) {
                this.props.onLoadDone();
            }
        }
    },

    videoErrorHandler: function(event) {
        // do something
    },

    videoEndedHandler: function(event) {
    },

    videoTimeUpdateHandler: function(video) {
        // get time to 3 decimal places
        var currentAnimationTime = video.currentTime.toFixed(3);

        if (currentAnimationTime >= this.currentStop) {
            // clear timer
            if (_animationTimer) {
                clearInterval(_animationTimer);
            }

            // dispatch event if animation is not the default one
            if (this.bIdleOrChatLoop === false) {
            //if (this.currentAnimation != this.currentIdleAnimationName) {
                // mark as stopped
                this.bAnimationPlaying = false;

                // trigger callback
                this.checkDonePlaying();
            }
            else {
                // go back to default
                this.playAnimationVideo(this.currentIdleAnimationName);
                this.bIdleOrChatLoop = true;
            }
        }
    },

    soundPlay: function (sound){
        // sound hack
        sound = sound.split(',')[0];

        if (this.refs.activeDialogAudioRef && this.refs.activeDialogAudioRef.refs.audioRef) {
            this.bSoundLoading = true;
            var player = this.refs.activeDialogAudioRef.refs.audioRef;
            player.setAttribute('src', 'data/media/' + sound + '.mp3');
            player.addEventListener('loadeddata', this.soundLoaded);
            player.addEventListener('ended', this.soundEnded);
            player.load();
        }
    },

    soundLoaded: function(event) {
        if (_soundTimer) {
            clearInterval(_soundTimer);
        }

        event.currentTarget.play();
        event.currentTarget.removeEventListener('loadeddata', this.soundLoaded);
        this.bSoundPlaying = true;
        this.bSoundLoading = false;

        var soundTimeout = (Math.round(event.currentTarget.duration) + 1) * 1000;
        var self = this;

        if (soundTimeout > 0) {
            _soundTimer = setTimeout(function () {
                clearInterval(_soundTimer);
                self.soundEnded(event);
            }, soundTimeout);
        }

        // if videos are found play them
        this.syncPlayback();
    },

    soundEnded: function(event) {
        clearInterval(_soundTimer);
        if (event.currentTarget) {
            event.currentTarget.removeEventListener('ended', this.soundEnded);
        }

        this.bSoundPlaying = false;

        // trigger callback
        this.checkDonePlaying();
    },

    syncPlayback: function() {
        if (!this.bSoundLoading) {

            // play videos
            var videoLen = this.currentVideosPlayingHack.length;
            if (videoLen > 0) {
                while(videoLen--) {
                    var video = this.currentVideosPlayingHack[videoLen];
                    video.play();
                }

                // set timer
                var self = this;
                _animationTimer = setInterval(function() {
                    self.videoTimeUpdateHandler(video);
                }, 100);

                // mark as playing
                this.bAnimationPlaying = true;
            }
        }
    },

    render: function() {
        var self = this;

        // check if video
        var videos = this.assets2Render.map(function(item, index) {
            var top = Number(item.assetData.dimensions[1].split("px")[0]);
            var left = Number(item.assetData.dimensions[0].split("px")[0]);
            var style = {top: top, left: left, position: "absolute", display: "block"};
            var videoStyle = {display: "none"};
            return (
                <div className="" key={index} style={style}>
                    <div className="active-dialog-video-and-captions">
                        <video id={item.assetData.source}
                               alt=""
                               aria-label=""
                               title=""
                               onCanPlayThrough={self.videoCanPlayThroughHandler}
                               onError={self.videoErrorHandler}
                               onEnded={self.videoEndedHandler}
                               style={videoStyle}
                            >
                            <source src={"data/media/" + PageStore.chapter().xid + "/" + item.assetData.source} type="video/mp4"></source>
                        </video>
                    </div>
                </div>
            );
        });

        return (
            <div>
                {videos}
                <ActiveDialogAudio ref="activeDialogAudioRef" />
            </div>
        );
    }
});

var ActiveDialogAudio = React.createClass({
    shouldRender: true,
    shouldComponentUpdate: function(nextProps, nextState) {
        return this.shouldRender;
    },

    render: function() {
        this.shouldRender = false;
        return (<audio ref="audioRef" src="" ></audio>);
    }

});

module.exports = ActiveDialogComponent;