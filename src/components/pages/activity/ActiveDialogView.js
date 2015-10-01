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

function getPageState(props) {
    var title = "";
    var pageType = "";

    if (props && props.page) {
        title = props.page.title;
        pageType = props.page.type;
    }

    return {
        title: title,
        pageType: pageType,
        data: ActiveDialogStore.activeDialog()
    };
}

function updatePageState(st) {
    return {
        title: st.title || "",
        pageType: st.pageType || "",
        data: ActiveDialogStore.activeDialog(),
        info: ActiveDialogStore.info()
    };
}

/*
var _data = {
        composition: "EDGE-20743566",
        objectives: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        symbols: [
            {
                symbolName: "SorayaSymbol",
                videoName: "Soraya_Crop4",
                animations: [
                    {
                        animationName: "Soraya_No",
                        start: "Soraya1",
                        stop: "Soraya2"
                    },
                    {
                        animationName: "Soraya_Idle",
                        start: "Soraya2",
                        stop: "Soraya3"
                    },
                    {
                        animationName: "Soraya_Nod",
                        start: "Soraya3",
                        stop: "Soraya4"
                    },
                    {
                        animationName: "Soraya_Yes",
                        start: "Soraya4",
                        stop: "Soraya5"
                    }
                ]
            },
            {
                symbolName: "ZhangSymbol",
                videoName: "Zhang_Crop",
                animations: [
                    {
                        label: "Zhang Yes",
                        animationName: "Zhang_Yes",
                        start: "Zhang1",
                        stop: "Zhang2"
                    },
                    {
                        label: "Zhang No",
                        animationName: "Zhang_No",
                        start: "Zhang2",
                        stop: "Zhang3"
                    },
                    {
                        label: "Zhang Idle",
                        animationName: "Zhang_Idle",
                        start: "Zhang3",
                        stop: "Zhang4"
                    },
                    {
                        label: "Zhang Beat",
                        animationName: "Zhang_Beat",
                        start: "Zhang4",
                        stop: "Zhang5"
                    }
                ]
            }
        ]
};
*/

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
        console.dir(hint);
        var animationName = hint.realizations[0].anima;
        var symbol = ActiveDialogStore.findInfoSymbolByAnimationName(animationName);
        var ani = ActiveDialogStore.findInfoAnimationByName(symbol, animationName);
        this.play(ActiveDialogStore.info().composition, symbol.symbolName, symbol.videoName, ani.animationName, ani.start, ani.stop);

        ActiveDialogActions.handleInput(hint);
    },

    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
        ActiveDialogStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        PageStore.addChangeListener(this._onChange);
        ActiveDialogStore.addChangeListener(this._onChange);

        if (!_dataLoaded) {
            $.getJSON("data/content/" + PageStore.chapter().xid + "/" + PageStore.page().dialog.lgid + "_info.json", function(info) {
                $.getJSON("data/content/" + PageStore.chapter().xid + "/" + PageStore.page().dialog.lgid + ".json", function (result) {
                    ActiveDialogActions.create({data: result, info: info});
                    AdobeEdge.loadComposition('dist/js/ScenarioTemplate3', 'EDGE-20743566', {
                        scaleToFit: "none",
                        centerStage: "none",
                        minW: "0px",
                        maxW: "undefined",
                        width: "1240px",
                        height: "814px"
                    }, {dom: []}, {dom: []});
                });
            });


            _dataLoaded = true;
        }
    },

    componentWillUnmount: function() {
        ActiveDialogStore.removeChangeListener(this._onChange);
        PageStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var content = <div></div>;
        if (this.state.data && this.state.info) {
            var _self = this;
            /*
             var symbols = this.state.data.symbols.map(function(item, index) {
             var animations = item.animations.map(function(aItem, aIndex) {
             return  <ListGroupItem key={aIndex}>
             <button className="btn btn-default" onClick={_self.hintAction.bind(this, item, aItem)}>
             {aItem.label}
             </button>
             </ListGroupItem>
             });

             return  <ListGroup key={index}>
             {animations}
             </ListGroup>
             });*/


            var hintsList = <ListGroupItem />;

            if (this.state.data && this.state.data.coas) {
                hintsList = this.state.data.coas.map(function(item, index) {
                    var name = item.realizations[0].anima;
                    return  <ListGroupItem key={index}>
                        <button className="btn btn-default" data-animation-name={name} onClick={_self.hintAction.bind(_self, item)}>
                            {item.act}
                        </button>
                    </ListGroupItem>
                });
            }


            var hintsPopover =  <Popover id="hintsPopover" title='Hints'>
                <ListGroup>
                    {hintsList}
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