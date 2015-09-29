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
        data: _data
    };
}

var _data = {
        composition: "EDGE-20743566",
        objectives: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        symbols: [
            {
                symbolName: "SorayaSymbol",
                videoName: "Soraya_Crop4",
                animations: [
                    {
                        label: "Soraya No",
                        animationName: "Soraya_No",
                        start: "Soraya1",
                        stop: "Soraya2"
                    },
                    {
                        label: "Soraya Idle",
                        animationName: "Soraya_Idle",
                        start: "Soraya2",
                        stop: "Soraya3"
                    },
                    {
                        label: "Soraya Nod",
                        animationName: "Soraya_Nod",
                        start: "Soraya3",
                        stop: "Soraya4"
                    },
                    {
                        label: "Soraya Yes",
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

    hintAction:function(symbol, hint) {
        this.play(_data.composition, symbol.symbolName, symbol.videoName, hint.animationName, hint.start, hint.stop);
        ActiveDialogActions.create({label:hint.label});
    },

    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);
        AdobeEdge.loadComposition('dist/js/ScenarioTemplate3', 'EDGE-20743566', {
            scaleToFit: "none",
            centerStage: "none",
            minW: "0px",
            maxW: "undefined",
            width: "1240px",
            height: "814px"
        }, {dom: [ ]}, {dom: [ ]});
    },

    componentWillUnmount: function() {
        //PageStore.removeChangeListener(this._onChange);
    },
    render: function() {

        var _self = this;
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
        });

        var hintsPopover =  <Popover id="settingsPopover" title='Hints'>
                                {symbols}
                            </Popover>;

        var objectivesPopover =  <Popover id="settingsPopover" title='Background and Objectives'>
                                    <p>
                                        {this.state.data.objectives}
                                    </p>
                                </Popover>;

        return (
            <div className="container active-dialog-view">
                <h3>{this.state.title} : {this.state.pageType}</h3>
                <div className="active-dialog-toolbar">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-10">
                                <OverlayTrigger trigger='click' placement='left' overlay={hintsPopover}>
                                    <Button className="btn btn-default">
                                        Hints
                                    </Button>
                                </OverlayTrigger>
                            </div>
                            <div className="col-md-1">
                                <ActiveDialogListView />
                            </div>
                            <div className="col-md-1">
                                <OverlayTrigger trigger='click' placement='left' overlay={objectivesPopover}>
                                    <Button className="btn btn-default">
                                        Objectives
                                    </Button>
                                </OverlayTrigger>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="Stage" className="EDGE-20743566">
                </div>
            </div>
        );
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        this.setState(getPageState());
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

        var items = this.state.data.map(function(item, index) {
            return  <ListGroupItem key={index}>
                            {item.label}
                    </ListGroupItem>
        });

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