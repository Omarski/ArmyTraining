var React = require('react');
var PageStore = require('../../../stores/PageStore');


function getPageState(props) {
    var title = "";
    var pageType = "";

    if (props && props.page) {
        title = props.page.title;
        pageType = props.page.type;
    }

    return {
        title: title,
        pageType: pageType
    };
}

var ActiveDialogView = React.createClass({

    hints:function() {
        var comp = AdobeEdge.getComposition("Soraya_Yes");
        comp.play();
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

        return (
            <div className="container active-dialog-view">
                <h3>{this.state.title} : {this.state.pageType}</h3>
                <div className="active-dialog-toolbar">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-10">
                                <button className="btn btn-default" onClick={this.hints}>Hints</button>
                            </div>
                            <div className="col-md-1">
                                <button className="btn btn-default">Dialog</button>
                            </div>
                            <div className="col-md-1">
                                <button className="btn btn-default">Objectives</button>
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

module.exports = ActiveDialogView;