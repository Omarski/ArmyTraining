var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');


function getPageState(props) {
    var data = {
        page: null,
        note: "Listen and Repeat"
    };

    if (props && props.page) {
        data.page = props.page;
    }

    return data;
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
        var self = this.state;
        var page = self.page;
        var questions = page.nut || [];
        var vaList = questions.map(function(item, index){
            text = item.uttering.utterance.native.text || "Error: JSON structure changed";

            return(
                <div className="li-vocal-answer">
                    <span classNane="glyphicon glyphicon-record"></span>
                    <span classNane="glyphicon glyphicon-record"></span>
                    {text}
                    <span classNane="glyphicon glyphicon-ok-circle"></span>
                    <span classNane="glyphicon glyphicon-remove-circle"></span>
                </div>
            );
        });

        return (
            <div className="container">
                <div className="row li-title">
                    <h3>{page.title}</h3>
                </div>
                <div className="row li-note">
                    <h4>{self.note}</h4>
                </div>
                <div className="row">
                    <div className="li-container">
                        <div className="li-column">
                            <div className="li-voice-answers">
                                {vaList}
                            </div>
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