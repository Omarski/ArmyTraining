var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Button = ReactBootstrap.Button;
var Popover = ReactBootstrap.Popover;
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var PageStore = require('../../../../stores/PageStore');
var ActiveDialogStore = require('../../../../stores/active_dialog/ActiveDialogStore');
var ActiveDialogActions = require('../../../../actions/active_dialog/ActiveDialogActions');

var ActiveDialogCOAs = require('../../../../components/pages/activity/active_dialog/ActiveDialogCOAs');
var ActiveDialogConstants = require('../../../../constants/active_dialog/ActiveDialogConstants');
var ActiveDialogHistory = require('../../../../components/pages/activity/active_dialog/ActiveDialogHistory');
var ActiveDialogObjectives = require('../../../../components/pages/activity/active_dialog/ActiveDialogObjectives');
var ActiveDialogIntro = require('../../../../components/pages/activity/active_dialog/ActiveDialogIntro');
var ActiveDialogEvaluation = require('../../../../components/pages/activity/active_dialog/ActiveDialogEvaluation');


var _bAnimationPlaying = false;
var _bSoundPlaying = false;
var _dataLoaded = false;

// TODO should be moved out into its own view component with a video
var _animationMapping = {};

var _currentAnimation = {};

var _videoCountHack = 0;

function getPageState(props) {
    var title = "";
    var pageType = "";
    var page = "";

    if (props && props.page) {
        title = props.page.title;
        pageType = props.page.type;
        page = props.page;
    }

    if (PageStore.page() && PageStore.page().dialog && PageStore.page().dialog.lgid) {
        if (!_dataLoaded) {
            setTimeout(function() {
                ActiveDialogActions.load({chapterId: PageStore.chapter().xid, dialogId: PageStore.page().dialog.lgid});
            }, .25);
            _dataLoaded = true;
        }
    }

    return {
        activeCOA: null,
        page: page,
        pageType: pageType,
        title: title
    };
}

function updatePageState(st) {

    // get current action from store
    var currentAction = ActiveDialogStore.getCurrentAction();
    if (currentAction) {
        switch(currentAction.type) {
            case ActiveDialogConstants.ACTIVE_DIALOG_ACTION_BLOCKING:
                st.stageMedia = ActiveDialogStore.getCurrentBlockingAssets();
                break;

            case ActiveDialogConstants.ACTIVE_DIALOG_ACTION_OUTPUT:
                handleOutputAction(currentAction);
                break;

            default:
            // no op
        }
    }

    return {
        activeCOA: st.activeCOA,
        info: ActiveDialogStore.info(),
        pageType: st.pageType || "",
        title: st.title || "",
        stageMedia: st.stageMedia
    };
}


function playAnimation(speaker, animation) {
    // see if it is a video or an image


    // if video look up by name for character
    var videoData = ActiveDialogStore.findVideoByAnimationNameForSpeaker(speaker, animation);

    _currentAnimation = videoData;

    var source = videoData.source;
    var start = videoData.start;

    // get video
    var video = document.getElementById(source);


    // set current time
    video.currentTime = start;

    // add event listeners
    video.addEventListener("timeupdate", animationTimeUpdate);

    // play
    video.play();
    _bAnimationPlaying = true;

}

function animationTimeUpdate(event) {
    if (this.currentTime >= _currentAnimation.stop) {
        // go back to idle animation
        // for now stop the animation
        this.pause();

        // remove event listener
        this.removeEventListener("timeupdate", animationTimeUpdate);

        // change flag
        _bAnimationPlaying = false;

        // check if should continue
        checkContinue();
    }
}

function checkContinue() {
    if (_bSoundPlaying === false && _bAnimationPlaying === false ) {
        setTimeout(function() {
            ActiveDialogActions.continueDialog();
        }, .1);
    }
}

function handleOutputAction(actionObject) {
    // get speaker
    var speaker = actionObject.speaker;

    // get audio
    var sound = actionObject.sound;

    // get animation
    var animation = actionObject.anima;

    if (sound) {
        playSound(sound);
    }

    if (animation) {
        playAnimation(speaker, animation);
    }

    // TODO remove this hack
    if (!sound && !animation) {
        checkContinue();
    }
}

function handleVideoLoadStart(event) {
    // remove event handler
    if (event.currentTarget) {
        event.currentTarget.removeEventListener("loadstart", handleVideoLoadStart);
    }

    // increase count
    _videoCountHack++;
}

function handleVideoCanPlayThrough(event) {
    // remove event handler
    if (event.currentTarget) {
        event.currentTarget.removeEventListener("canplaythrough", handleVideoCanPlayThrough)
    }

    // decrease count
    _videoCountHack--;

    if (_videoCountHack <= 0) {
        // all videos loaded
        checkContinue();
    }

    // hide it?

    // trigger that is loaded?
}

function playSound(sound) {
    var player = document.getElementById('activeDialogAudioPlayer');
    player.setAttribute('src', 'data/media/' + sound + '.mp3');
    player.addEventListener('loadeddata', soundLoaded);
    player.addEventListener('ended', soundEnded);
    player.load();
}

function resetDialog() {
    _bAnimationPlaying = false;
    _bSoundPlaying = false;
    _dataLoaded = false;
}

function soundLoaded(event) {
    this.play();
    this.removeEventListener('loadeddata', soundLoaded);
    _bSoundPlaying = true;
}

function soundEnded(event) {
    this.removeEventListener('ended', soundEnded);
    _bSoundPlaying = false;
    checkContinue();
}


var ActiveDialogView = React.createClass({

    getInitialState: function() {
        resetDialog();
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentDidMount: function() {
        if (this.state && this.state.title != "") {
            this.setState(updatePageState(this.state));
        } else {
            this.setState(getPageState());
        }
    },

    componentWillUnmount: function() {
        ActiveDialogStore.removeChangeListener(this._onDialogChange);
        PageStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var content = <div></div>;

        if (this.state.info) {

            content = (
                <div>
                    <div className="container active-dialog-view" key={"page-" + this.state.page.xid}>
                        <h3>{this.state.title} : {this.state.pageType}</h3>
                        <div className="active-dialog-toolbar">
                            <div className="container">
                                <div className="row">
                                    <div className="col-md-10">
                                        <ActiveDialogCOAs />
                                    </div>
                                    <div className="col-md-1">
                                        <ActiveDialogHistory />
                                    </div>
                                    <div className="col-md-1">
                                        <ActiveDialogObjectives />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ActiveDialogScenarioView composition={this.state.info.composition} media={this.state.stageMedia} />
                        <ActiveDialogIntro />
                        <ActiveDialogEvaluation />
                        <ActiveDialogAudio />
                    </div>
                </div>
            );

        }

        return (content);
    },
    /**
     * Event handler for 'change' events coming from the ActiveDialogStore
     */
    _onChange: function() {
        if (this.isMounted()) {
            if (this.state && this.state.title != "") {
                this.setState(updatePageState(this.state));
            } else {
                this.setState(getPageState());
            }
        }
    },

    _onDialogChange: function() {
        if (this.isMounted()) {
            this.setState(updatePageState(this.state));
        }
    }
});


var ActiveDialogScenarioView = React.createClass({
    shouldRender: true,
    shouldComponentUpdate: function(nextProps, nextState) {
        return this.shouldRender;
    },

    render: function() {
        if (this.props.composition) {
            this.shouldRender = false;
        }

        if (this.props.media) {
            var media;

            var testDeleteMe;

            // reset counter
            _videoCountHack = 0;

            media = this.props.media.map(function(mediaObj){

                return mediaObj.assets.map(function(item, index) {
                    var style = {top: item.top+'px', left: item.left+'px', position: "absolute", display: "block"};
                    return (
                        <div className="" key={index} style={style}>
                            <video id={item.source}
                                   alt=""
                                   aria-label=""
                                   title=""
                                   onLoadStart={handleVideoLoadStart}
                                   onCanPlayThrough={handleVideoCanPlayThrough}
                                >
                                <source src={"data/media/" + item.source} type="video/mp4"></source>
                            </video>
                        </div>
                    );
                });
            });

            testDeleteMe = this.props.media.map(function(item, index){
                return (
                    <ActiveDialogPersona name={item.name} assets={item.assets} />
                );
            });
        }


        return (
            <div id="Stage" className={this.props.composition}>
                Loading....{media}
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
        return (<audio id="activeDialogAudioPlayer" src="" ></audio>);
    }

});


var ActiveDialogPersona = React.createClass({
    defaultAnimationName: "",
    currentAnimation: "",

    isReady: false,
    videos: [],
    images: [],

    getInitialState: function() {
        console.log(this.props.assets.length);

        var videosNotReady = this.props.assets ? this.props.assets.length : 0;


        return {
            videosNotReady: videosNotReady
        }
        // get name

        // get current default animation

        // get videos
    },

    componentWillUnmount: function() {
        // unregister event listeners on videos
    },

    playAnimationVideo: function() {
        // get video

        // show video

        // set current frame

        // add listener

        // start play
    },

    videoCanPlayThroughHandler: function(event) {
        // remove event listener
        if (event.currentTarget) {
            event.currentTarget.removeEventListener("canplaythrough", this.videoCanPlayThroughHandler)
        }

        // decrease count
        this.props.videosNotReady--;

        // all videos ready to play
        if (this.props.videosNotReady <= 0) {

            // set ready

            // dispatch event
        }
    },

    videoLoadStartHandler: function(event) {

    },

    videoTimeUpdateHandler: function(event) {

    },

    render: function() {

        // check if video
        var videos = this.props.assets.map(function(item, index) {
            var style = {top: item.top+'px', left: item.left+'px', position: "absolute", display: "block"};
            return (
                <div className="" key={index} style={style}>
                    <video id={item.source}
                           alt=""
                           aria-label=""
                           title=""
                           onLoadStart={this.videoLoadStartHandler}
                           onCanPlayThrough={this.videoCanPlayThroughHandler}
                        >
                        <source src={"data/media/" + item.source} type="video/mp4"></source>
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

module.exports = ActiveDialogView;