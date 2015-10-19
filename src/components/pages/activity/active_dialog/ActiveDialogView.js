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
var ActiveDialogHints = require('../../../../components/pages/activity/active_dialog/ActiveDialogHints');
var ActiveDialogHistory = require('../../../../components/pages/activity/active_dialog/ActiveDialogHistory');
var ActiveDialogObjectives = require('../../../../components/pages/activity/active_dialog/ActiveDialogObjectives');
var ActiveDialogIntro = require('../../../../components/pages/activity/active_dialog/ActiveDialogIntro');
var ActiveDialogEvaluation = require('../../../../components/pages/activity/active_dialog/ActiveDialogEvaluation');

var _dataLoaded = false;
var _compositionLoaded = false;

function getPageState(props) {
    var title = "";
    var pageType = "";

    if (props && props.page) {
        title = props.page.title;
        pageType = props.page.type;
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
        title: title,
        pageType: pageType,
        data: ActiveDialogStore.activeDialog(),
        activeCOA: null
    };
}

function updatePageState(st) {
    return {
        title: st.title || "",
        pageType: st.pageType || "",
        data: ActiveDialogStore.activeDialog(),
        info: ActiveDialogStore.info(),
        activeCOA: st.activeCOA
    };
}


function loadComposition() {
    if (!_compositionLoaded &&
        ActiveDialogStore.info().script &&
        ActiveDialogStore.info().composition &&
        $("#Stage").length > 0) {

        _compositionLoaded = true;


        AdobeEdge.loadComposition(ActiveDialogStore.info().script, ActiveDialogStore.info().composition, {
            scaleToFit: "none",
            centerStage: "none",
            minW: "0px",
            maxW: "undefined",
            width: "1240px",
            height: "814px"
        }, {dom: []}, {dom: []});
    }
}

var ActiveDialogView = React.createClass({

    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
        //ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentDidMount: function() {
        PageStore.addChangeListener(this._onChange);
        ActiveDialogStore.addChangeListener(this._onDialogChange);
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
        if (this.state.data && this.state.info) {

            content = <div className="container active-dialog-view">
                    <h3>{this.state.title} : {this.state.pageType}</h3>
                    <div className="active-dialog-toolbar">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-10">
                                    <ActiveDialogHints />
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
                    <div id="Stage" className={this.state.info.composition}>
                    </div>
                    <ActiveDialogIntro />
                    <ActiveDialogEvaluation />
                </div>

        }

        return (content);


    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        if (this.state && this.state.title != "") {
            this.setState(updatePageState(this.state));
        } else {
            this.setState(getPageState());
        }
    },

    _onDialogChange: function() {
        this.setState(updatePageState(this.state));
        loadComposition();
    }

});

module.exports = ActiveDialogView;