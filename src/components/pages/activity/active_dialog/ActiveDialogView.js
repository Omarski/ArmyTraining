var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Button = ReactBootstrap.Button;
var PageStore = require('../../../../stores/PageStore');
var ActiveDialogStore = require('../../../../stores/active_dialog/ActiveDialogStore');
var ActiveDialogActions = require('../../../../actions/active_dialog/ActiveDialogActions');
var ActiveDialogCOAs = require('../../../../components/pages/activity/active_dialog/ActiveDialogCOAs');
var ActiveDialogComponent = require('../active_dialog/ActiveDialogComponent');
var ActiveDialogConstants = require('../../../../constants/active_dialog/ActiveDialogConstants');
var ActiveDialogHistory = require('../../../../components/pages/activity/active_dialog/ActiveDialogHistory');
var ActiveDialogObjectives = require('../../../../components/pages/activity/active_dialog/ActiveDialogObjectives');
var ActiveDialogIntro = require('../../../../components/pages/activity/active_dialog/ActiveDialogIntro');
var ActiveDialogEvaluation = require('../../../../components/pages/activity/active_dialog/ActiveDialogEvaluation');
var RemediationView = require('../../../RemediationView');

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
    setTimeout(function() {
        ActiveDialogActions.continueDialog();
    }, .1);
}

function handlePersonaDonePlaying() {
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

function resetDialog() {
    _dataLoaded = false;
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
            this.playSound(speaker, sound);
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

    playSound: function(speaker, sound) {
        // find persona component
        if (this.refs.ActiveDialogScenarioView && this.refs.ActiveDialogScenarioView.refs[speaker]) {
            var personaComponent = this.refs.ActiveDialogScenarioView.refs[speaker];

            // play sound
            personaComponent.soundPlay(sound);
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
                    <ActiveDialogComponent key={"persona" + index + item.name + item.blockingId} name={item.name} ref={item.name}
                                         assets={item.assets}
                                         onLoadStart={handlePersonaLoading}
                                         onLoadDone={handlePersonaReady}
                                         onPlayingDone={handlePersonaDonePlaying} />
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


module.exports = ActiveDialogView;