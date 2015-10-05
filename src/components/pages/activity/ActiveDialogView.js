var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Button = ReactBootstrap.Button;
var Popover = ReactBootstrap.Popover;
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var PageStore = require('../../../stores/PageStore');
var ActiveDialogStore = require('../../../stores/ActiveDialogStore');
var ActiveDialogActions = require('../../../actions/ActiveDialogActions');

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
            }, 2000);
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

function updateCOAState(st, coa) {
    return {
        title: st.title || "",
        pageType: st.pageType || "",
        data: ActiveDialogStore.activeDialog(),
        info: ActiveDialogStore.info(),
        activeCOA: coa
    };
}

function loadComposition() {
    if (!_compositionLoaded &&
        ActiveDialogStore.info().script &&
        ActiveDialogStore.info().composition &&
        $("#Stage").length > 0) {

        _compositionLoaded = true;


        AdobeEdge.loadComposition('dist/js/' + ActiveDialogStore.info().script, ActiveDialogStore.info().composition, {
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

    play: function(compName, symbolName, childName, animKey, start, end) {


        var sym = AdobeEdge.getComposition(compName).getStage().getSymbol(symbolName);
        var symChild = sym.$(childName)[0];
        var pos = sym.getLabelPosition(start)/1000;
        var pause = sym.getLabelPosition(end)/1000;

        symChild.currentTime = pos;

        symChild.addEventListener("timeupdate", function() {
            if(symChild.currentTime >= pause) {
                symChild.pause();
                symChild.removeEventListener("timeupdate");
            }
        });

        symChild.play();
    },

    hintAction:function(hint) {
        /*
        var animationName = hint.realizations[0].anima;
        var symbol = ActiveDialogStore.findInfoSymbolByAnimationName(animationName);
        var ani = ActiveDialogStore.findInfoAnimationByName(symbol, animationName);
        this.play(ActiveDialogStore.info().composition, symbol.symbolName, symbol.videoName, ani.animationName, ani.start, ani.stop);
         ActiveDialogActions.handleInput(hint);
        */

        this.setState(updateCOAState(this.state, hint));


    },

    coaAction: function (coa, realization) {
        console.log(coa)
        var animationName = realization.anima;
        var symbol = ActiveDialogStore.findInfoSymbolByAnimationName(animationName);
        var ani = ActiveDialogStore.findInfoAnimationByName(symbol, animationName);
        this.play(ActiveDialogStore.info().composition, symbol.symbolName, symbol.videoName, ani.animationName, ani.start, ani.stop);
        ActiveDialogActions.handleInput(coa);
    },

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






            content = <div className="container active-dialog-view">
                    <h3>{this.state.title} : {this.state.pageType}</h3>
                    <div className="active-dialog-toolbar">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-10">
                                    <OverlayTrigger trigger='focus' placement='right' overlay={hintsPopover}>
                                        <Button className="btn btn-default">
                                            Hints
                                        </Button>
                                    </OverlayTrigger>

                                    <OverlayTrigger trigger='focus' placement='right' overlay={realizationsPopover}>
                                        <Button className="btn btn-default">
                                            Realizations
                                        </Button>
                                    </OverlayTrigger>

                                </div>
                                <div className="col-md-1">
                                    <ActiveDialogListView />
                                </div>
                                <div className="col-md-1">
                                    <OverlayTrigger trigger='focus' placement='left' overlay={objectivesPopover}>
                                        <Button className="btn btn-default">
                                            Objectives
                                        </Button>
                                    </OverlayTrigger>
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

function getDialogState() {
    return {data:ActiveDialogStore.activeDialog()};
}

var ActiveDialogListView = React.createClass({
    getInitialState: function() {
        return getDialogState();
    },

    componentWillMount: function() {
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentDidMount: function() {
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentWillUnmount: function() {
        ActiveDialogStore.removeChangeListener(this._onDialogChange);
    },

    render: function() {

        /*
        var items = this.state.data.map(function(item, index) {
            return  <ListGroupItem key={index}>
                            {item.label}
                    </ListGroupItem>
        });*/

        var items = [];

        var content = items;

        if (items.length === 0) {
            content =   <p>
                            Your dialog will appear here as you interact with the scenario.
                        </p>
        }
        var hintsPopover =  <Popover id="settingsPopover" title='Dialog'>
                                <ListGroup>
                                    {content}
                                </ListGroup>
                            </Popover>;

        return (
            <OverlayTrigger trigger='click' placement='left' overlay={hintsPopover}>
                <Button className="btn btn-default">
                    Dialog
                </Button>
            </OverlayTrigger>

        );
    },

    _onDialogChange: function() {
        this.setState(getDialogState());
    }
});


/**
 *
 *
 *
 * getCOA gets the hints
 */

module.exports = ActiveDialogView;