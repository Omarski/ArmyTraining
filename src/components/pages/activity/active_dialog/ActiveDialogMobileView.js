var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Button = ReactBootstrap.Button;
var Tooltip = ReactBootstrap.Tooltip;
var PageStore = require('../../../../stores/PageStore');
var LocalizationStore = require('../../../../stores/LocalizationStore');
var ActiveDialogStore = require('../../../../stores/active_dialog/ActiveDialogStore');
var ActiveDialogActions = require('../../../../actions/active_dialog/ActiveDialogActions');
var ActiveDialogCOAs = require('../../../../components/pages/activity/active_dialog/ActiveDialogCOAs');
var ActiveDialogComponent = require('../active_dialog/ActiveDialogComponent');
var ActiveDialogConstants = require('../../../../constants/active_dialog/ActiveDialogConstants');
//var ActiveDialogHistory = require('../../../../components/pages/activity/active_dialog/ActiveDialogHistory');
var ActiveDialogObjectives = require('../../../../components/pages/activity/active_dialog/ActiveDialogObjectives');
var ActiveDialogIntro = require('../../../../components/pages/activity/active_dialog/ActiveDialogIntro');
var ActiveDialogEvaluation = require('../../../../components/pages/activity/active_dialog/ActiveDialogEvaluation');
var ActiveDialogClosedCaptionActions = require('../../../../actions/active_dialog/ActiveDialogClosedCaptionActions');
var ActiveDialogClosedCaption = require('../../../../components/pages/activity/active_dialog/ActiveDialogClosedCaption');
var ActiveDialogClosedCaptionPanel = require('../../../../components/pages/activity/active_dialog/ActiveDialogClosedCaptionPanel');
var RemediationView = require('../../../RemediationView');

var _dataLoaded = false;

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
        mediaPath: 'data/media/',
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

function resetDialog() {
    _dataLoaded = false;
}

var ActiveDialogMobileView = React.createClass({

    getInitialState: function() {
        resetDialog();
        return getPageState(this.props);
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
        setTimeout(function () {
            ActiveDialogClosedCaptionActions.show();
        });
    },

    componentWillUnmount: function() {
        ActiveDialogStore.removeChangeListener(this._onDialogChange);
        PageStore.removeChangeListener(this._onChange);
    },

    updatePageState: function(state) {
        var backgroundImage = state.backgroundImage;
        var currentImage = state.currentImage;

        // get current action from store
        var currentAction = ActiveDialogStore.getCurrentAction();
        if (currentAction) {
            switch(currentAction.type) {
                case ActiveDialogConstants.ACTIVE_DIALOG_ACTION_BLOCKING:
                    var blockingAssets = ActiveDialogStore.getCurrentBlockingAssets();
                    // only take the first one
                    if (blockingAssets.length > 0) {
                        var asset = blockingAssets[0];
                        if (asset.assets.length > 0) {
                            var assetData = asset.assets[0].assetData;
                            backgroundImage = assetData.source;
                            currentImage = assetData.source;
                        }
                    }

                    checkContinue();
                    break;

                case ActiveDialogConstants.ACTIVE_DIALOG_ACTION_OUTPUT:

                    // get audio
                    var sound = currentAction.sound;

                    // get animation
                    var animation = currentAction.anima;


                    if (sound) {
                        //this.playSound(speaker, sound);
                    }

                    if (animation) {
                        currentImage = animation + ".jpg";
                    }

                    // TODO remove this hack
                    if (!sound && !animation) {
                        checkContinue();
                    }


                    break;

                default:
                // no op
            }
        }

        var speaker = ActiveDialogStore.getCurrentSpeakerName();

        // get text
        var text = ActiveDialogStore.getCurrentDialogHistory();

        // set data
        if (speaker !== null && text !== null) {
            setTimeout(function() {
                ActiveDialogClosedCaptionActions.update(speaker + ' : ' + text);
            });
        }

        return {
            backgroundImage: backgroundImage,
            currentImage: currentImage,
            info: ActiveDialogStore.info(),
            pageType: state.pageType || "",
            title: state.title || ""
        };
    },

    playSound: function(speaker, sound) {
        // TODO play audio file
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
    },


    render: function() {
        var content = <div></div>;

        var tt = (<Tooltip id="pauseTooltip">{LocalizationStore.labelFor("evaluation", "lblPause")}</Tooltip>);
        var imageStyle = {};


        if (this.state.info) {

            var imgUrl = this.state.mediaPath + this.state.currentImage;

            console.log(imgUrl);
            // get image style
            imageStyle = {
                background: "url('" + imgUrl + "') no-repeat",
                backgroundSize:"100%"
            };

            content = (
                <div>
                    <div className="container active-dialog-view" key={"page-" + this.state.page.xid}>
                        <div className="active-dialog-toolbar">
                            <ActiveDialogCOAs />
                            <OverlayTrigger
                                overlay={tt} placement="top"
                                delayShow={300} delayHide={150}
                                >
                                <Button className="btn btn-default btn-link active-dialog-toolbar-btn">
                                    <span className="glyphicon" aria-hidden="true">
                                        <img className="active-dialog-toolbar-icon" src="images/icons/pauseIcon2.png"/>
                                    </span>
                                </Button>
                            </OverlayTrigger>
                            <ActiveDialogObjectives />
                        </div>

                        <div key={this.state.currentImage}
                             style={imageStyle}
                             className="active-dialog-image"
                            ></div>

                        <div className="active-dialog-closed-caption-container">
                            <div className="row">
                                <ActiveDialogClosedCaption />
                            </div>

                            <div className="row">
                                <ActiveDialogClosedCaptionPanel/>
                            </div>
                        </div>
                        <ActiveDialogIntro />
                        <ActiveDialogEvaluation />
                        <RemediationView />
                    </div>
                </div>
            );

        }

        return (content);
    }
});


module.exports = ActiveDialogMobileView;