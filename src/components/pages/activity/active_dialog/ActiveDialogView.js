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
            /*
            var _self = this;

            var hintsList = <ListGroupItem />;
            var realizationsList = <ListGroupItem />;

            if (this.state.data && this.state.data.uniqueCOAs) {
                hintsList = this.state.data.uniqueCOAs.map(function(item, index) {
                    var name = item.coas[0].realizations[0].anima;
                    return  <ListGroupItem key={index}>
                        <a className="" href="#" data-animation-name={name} onClick={_self.hintAction.bind(_self, item)}>
                            {item.act}
                        </a>
                    </ListGroupItem>
                });
            }


            var hintsPopover =  <Popover id="hintsPopover" title='Hints'>
                <ListGroup>
                    {hintsList}
                </ListGroup>
            </Popover>;


            var realizations = [];

            if (this.state.data && this.state.activeCOA) {
                var activCOA = this.state.activeCOA;
                var coas = activCOA.coas;
                var coasLen = coas.length;
                for (var i = 0; i < coasLen; i++) {
                    var coa = coas[i];
                    var rlzns = coa.realizations;
                    var rlznsLen = rlzns.length;
                    for (var j = 0; j < rlznsLen; j++) {
                        var r = rlzns[j];
                        realizations.push(<ListGroupItem key={j}>
                            <a className="coa-item" href="#" data-animation-name={r.anima} onClick={this.coaAction.bind(this, coa, r)}>
                                {r.uttText}
                            </a>
                        </ListGroupItem>);
                    }
                }
            }

            console.log("realizations");
            console.dir(realizations);
            console.log("/realizations");
            var realizationsPopover =  <Popover id="realizationsPopover" title='Realizations'>
                <ListGroup>
                    {realizations}
                </ListGroup>
            </Popover>;

            var objectivesPopover =  <Popover id="settingsPopover" title='Background and Objectives'>
                <p>
                    {this.state.data.objectives}
                </p>
            </Popover>;



            */


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