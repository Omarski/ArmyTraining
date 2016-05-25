/**
 * Created by Alec on 5/23/2016.
 */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');


function getSettingsState(props) {
    var data = {
        pdfList: [],
        eventKey: ""
    };

    if(props){
        data.pdfList = props.pdfList;
        data.eventKey = props.eventKey;
    }

    return data;
}

var ReferencePdfView = React.createClass({
    getInitialState: function() {
        var settingsState = getSettingsState(this.props);
        return settingsState;
    },

    componentWillMount: function() {
        //  SettingsStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //  SettingsStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        //  SettingsStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var self = this;
        var state = self.state;




        return (
            <div id="referencePdfView" key={"pdfView" + state.eventKey}>
                PDF placeholder text
            </div>
        );
    },
    _onChange: function() {
        this.setState(getSettingsState());
    }
});

module.exports = ReferencePdfView;