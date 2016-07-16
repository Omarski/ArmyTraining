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
var RemediationView = require('../../../RemediationView');

var _bAnimationPlaying = false;
var _bSoundPlaying = false;
var _dataLoaded = false;
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

function checkContinue() {
    if (_bSoundPlaying === false && _bAnimationPlaying === false ) {
        setTimeout(function() {
            ActiveDialogActions.continueDialog();
        }, .1);
    }
}

function handleAnimationStart() {
    // change flag
    _bAnimationPlaying = true;
}

function handleAnimationStop() {
    // change flag
    _bAnimationPlaying = false;

    // check if should continue
    checkContinue();
}


function handlePersonaLoading() {
    // increase count
    _videoCountHack++;
}

function handlePersonaReady() {
    // decrease count
    _videoCountHack--;

    if (_videoCountHack <= 0) {
        // all videos loaded
        checkContinue();
    }
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

    updatePageState: function(st) {
        // get current action from store
        var currentAction = ActiveDialogStore.getCurrentAction();
        if (currentAction) {
            switch(currentAction.type) {
                case ActiveDialogConstants.ACTIVE_DIALOG_ACTION_BLOCKING:
                    st.stageMedia = ActiveDialogStore.getCurrentBlockingAssets();
                    break;

                case ActiveDialogConstants.ACTIVE_DIALOG_ACTION_OUTPUT:
                    this.handleOutputAction(currentAction);
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
    },

    handleOutputAction: function(actionObject) {
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
            this.playAnimation(speaker, animation);
        }

        // TODO remove this hack
        if (!sound && !animation) {
            checkContinue();
        }
    },

    playAnimation: function(speaker, animation) {
        // find persona component
        if (this.refs.ActiveDialogScenarioView && this.refs.ActiveDialogScenarioView.refs[speaker]) {
            var personaComponent = this.refs.ActiveDialogScenarioView.refs[speaker];

            // play animation
            personaComponent.playAnimationVideo(animation);
        }
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentDidMount: function() {
        if (this.state && this.state.title != "") {
            this.setState(this.updatePageState(this.state));
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
                        <ActiveDialogScenarioView composition={this.state.info.composition} ref="ActiveDialogScenarioView" media={this.state.stageMedia} />
                        <ActiveDialogIntro />
                        <ActiveDialogEvaluation />
                        <ActiveDialogAudio />
                        <RemediationView />
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
                this.setState(this.updatePageState(this.state));
            } else {
                this.setState(getPageState());
            }
        }
    },

    _onDialogChange: function() {
        if (this.isMounted()) {
            this.setState(this.updatePageState(this.state));
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
            var media = "";

            // reset counter
            _videoCountHack = 0;

            // iterate over media creating persona components
            media = this.props.media.map(function(item, index){
                return (
                    <ActiveDialogPersona key={"persona" + index + item.name} name={item.name} ref={item.name}
                                         assets={item.assets}
                                         onLoadStart={handlePersonaLoading}
                                         onLoadDone={handlePersonaReady}
                                         onAnimationStart={handleAnimationStart}
                                         onAnimationStop={handleAnimationStop} />
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
    defaultAnimationName: "Default",
    currentAnimation: "",
    currentStop: "",
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

                // dispatch event if animation is not the default one
                if (animationName != this.defaultAnimationName) {
                    if (this.props.onAnimationStart !== null) {
                        this.props.onAnimationStart();
                    }
                }

                // found animation so break out!
                break;
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

            // hide video
            event.currentTarget.style.display = "none";

            // dispatch event if animation is not the default one
            if (this.currentAnimation != this.defaultAnimationName) {
                if (this.props.onAnimationStop !== null) {
                    this.props.onAnimationStop();
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

module.exports = ActiveDialogView;