var React = require('react');
var PageStore = require('../../../stores/PageStore');


function getPageState(props) {
    var data = {};

    if (props && props.page) {
        data.page = props.page;
    }

    return {data};
}

function hasGetUserMedia(){
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

var PronunciationView = React.createClass({
    getInitialState: function() {
        return getPageState(this.props);
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
        var page = this.state.data.page;
        var list = null;

        return (
            <div className="container">
                <div className="row li-title">
                    <h3>{page.title}</h3>
                </div>
                <div className="row li-note">
                    <h4>{page.nut[0].note.text}</h4>
                </div>
                <div className="row">
                    <div className="li-container">
                        <div className="li-column">
                            <ul className="dd-answer-list">
                                {list}
                            </ul>
                        </div>
                    </div>
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

module.exports = PronunciationView;