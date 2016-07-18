var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var PageStore = require('../../../../stores/PageStore');


var ActiveDialogComponent = React.createClass({
    defaultAnimationName: "Default",
    currentAnimation: "",
    currentStop: "",
    currentVideosPlayingHack: [],
    hack: false,

    propTypes: {
        name: React.PropTypes.string.isRequired,
        onAnimationStart: React.PropTypes.func,
        onAnimationStop: React.PropTypes.func,
        onLoadStart: React.PropTypes.func,
        onLoadDone: React.PropTypes.func

    },

    getInitialState: function() {
        var videosNotReady = this.props.assets ? this.props.assets.length : 0;

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

                // start playing
                video.play();

                // increment counter if animation is not the default one
                if (animationName != this.defaultAnimationName) {
                    bFoundVideo2Play = true;

                    // add to hack
                    this.currentVideosPlayingHack.push(video);
                }
            }
        }

        // if found videos to play dispatch event
        if (bFoundVideo2Play === true) {
            if (this.props.onAnimationStart !== null) {
                this.props.onAnimationStart();
            }
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
            this.playAnimationVideo(this.defaultAnimationName);

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
        if (event.currentTarget.currentTime >= this.currentStop) {

            // remove event listener
            event.currentTarget.removeEventListener("timeupdate", this.videoTimeUpdateHandler);

            // dispatch event if animation is not the default one
            if (this.currentAnimation != this.defaultAnimationName) {
                if (this.props.onAnimationStop !== null) {
                    this.props.onAnimationStop();
                }

                // hide all videos that are playing
                var vidLength = this.currentVideosPlayingHack.length;
                while(vidLength--) {
                    var video = this.currentVideosPlayingHack[vidLength];

                    // hide video
                    video.style.display = "none";
                }
            }

            // go back to default
            this.playAnimationVideo(this.defaultAnimationName);
        }
    },

    render: function() {
        var self = this;

        // check if video
        var videos = this.props.assets.map(function(item, index) {
            var style = {top: item.assetData.dimensions[1]+'px', left: item.assetData.dimensions[0]+'px', position: "absolute", display: "block"};
            var videoStyle = {display: "none"};
            return (
                <div className="" key={index} style={style}>
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
            );
        });

        return (
            <div>
                {videos}
            </div>
        );
    }
});

module.exports = ActiveDialogComponent;