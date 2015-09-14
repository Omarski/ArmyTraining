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

function hasGetUserMedia(){
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

var PronunciationView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);
        if(hasGetUserMedia()){
            // UserMedia allowed
        }else{
            // UserMedia not allowed
        }
    },

    componentWillUnmount: function() {
        //PageStore.removeChangeListener(this._onChange);
    },
    render: function() {

        return (
            <div className="container">
                <h3>{this.state.title} : {this.state.pageType}</h3>
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

module.exports = PronunciationView;