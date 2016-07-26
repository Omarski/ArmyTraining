var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var PageStore = require('../../../../stores/PageStore');




var ActiveDialogComponent = React.createClass({
    bAnimationPlaying: false,
    bSoundLoading: false,
    bSoundPlaying: false,
    currentAnimation: "",
    currentChatAnimationName: "",
    currentIdleAnimationName: "Default",
    currentStop: "",
    currentVideosPlayingHack: [],
    hack: false,

    propTypes: {
        name: React.PropTypes.string.isRequired,
        onLoadStart: React.PropTypes.func,
        onLoadDone: React.PropTypes.func,
        onPlayingDone: React.PropTypes.func
    },

    getInitialState: function() {
        var videosNotReady = this.props.assets ? this.props.assets.length : 0;

        // look up chat animation
        this.findChatAnimation();

        // trigger callback function
        if (this.props.onLoadStart !== null) {
            this.props.onLoadStart();
        }

        return {
            videosNotReady: videosNotReady
        }
    },

    componentWillUnmount: function() {
        // unregister event listeners on videos
    },

    changeIdleAnimation: function(animationName) {
        this.currentIdleAnimationName = animationName;
        if (this.bAnimationPlaying === false) {
            this.playAnimationVideo(this.currentIdleAnimationName);
        }
    },

    changeChatAnimation: function(animationName) {
        this.currentChatAnimationName = animationName;
    },

    checkDonePlaying: function() {
        // if no animation or sound is playing then trigger callback
        if (!this.bAnimationPlaying && !this.bSoundPlaying && !this.bSoundLoading) {
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

    playAnimationVideo: function(animationName) {
        var bFoundVideo2Play = false;

        // reset hack
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

                // add event listeners
                video.addEventListener("timeupdate", this.videoTimeUpdateHandler);

                // set current animation playing
                this.currentAnimation = animationName;
                this.currentStop = animation.stop / 1000;


                // show video
                video.style.display = "block";




                // increment counter if animation is not the default one otherwise play
                if (animationName != this.currentIdleAnimationName) {
                    bFoundVideo2Play = true;
                    
                    // add to hack
                    this.currentVideosPlayingHack.push(video);
                } else {
                    video.play();
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
        this.state.videosNotReady--;

        // all videos for this asset are ready to play
        if (this.state.videosNotReady <= 0) {

            // set ready

            // play default animation
            this.playAnimationVideo(this.currentIdleAnimationName);

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
        // remove event listener?
        event.currentTarget.removeEventListener("timeupdate", this.videoTimeUpdateHandler);
    },

    videoLoadStartHandler: function(event) {
        // remove event handler
        if (event.currentTarget) {
            event.currentTarget.removeEventListener("loadstart", this.videoLoadStartHandler);
        }
    },

    videoTimeUpdateHandler: function(event) {
        // get time to 3 decimal places
        var currentAnimationTime = event.currentTarget.currentTime.toFixed(3);

        if (currentAnimationTime >= this.currentStop) {
            // remove event listener
            event.currentTarget.removeEventListener("timeupdate", this.videoTimeUpdateHandler);

            // dispatch event if animation is not the default one
            if (this.currentAnimation != this.currentIdleAnimationName) {
                // mark as stopped
                this.bAnimationPlaying = false;

                // trigger callback
                this.checkDonePlaying();

                // hide all videos that are playing
                var vidLength = this.currentVideosPlayingHack.length;
                while(vidLength--) {
                    var video = this.currentVideosPlayingHack[vidLength];
                    // hide video
                    video.style.display = "none";
                }
            }

            // go back to default
            this.playAnimationVideo(this.currentIdleAnimationName);
        }
    },

    soundPlay: function (sound){
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
        event.currentTarget.play();
        event.currentTarget.removeEventListener('loadeddata', this.soundLoaded);
        this.bSoundPlaying = true;
        this.bSoundLoading = false;

        // if videos are found play them
        this.syncPlayback();
    },

    soundEnded: function(event) {
        event.currentTarget.removeEventListener('ended', this.soundEnded);
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

                // mark as playing
                this.bAnimationPlaying = true;
            }
        }
    },

    render: function() {
        var self = this;

        // check if video
        var videos = this.props.assets.map(function(item, index) {
            var style = {top: item.assetData.dimensions[1], left: item.assetData.dimensions[0], position: "absolute", display: "block"};
            var videoStyle = {display: "none"};
            return (
                <div className="" key={index} style={style}>
                    <div className="active-dialog-video-and-captions">
                        <video id={item.assetData.source}
                               alt=""
                               aria-label=""
                               title=""
                               onLoadStart={self.videoLoadStartHandler}
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