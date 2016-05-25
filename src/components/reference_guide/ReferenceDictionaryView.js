/**
 * Created by Alec on 5/23/2016.
 */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var FormGroup = ReactBootstrap.FormGroup;
var FormControl = ReactBootstrap.FormControl;



function getSettingsState(props) {
    var data = {
        dictionarySources: null
    };

    if(props && props.dictionarySources){
        data.dictionarySources = props.dictionarySources;
    }

    return data;
}

var ReferenceDictionaryView = React.createClass({
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
        console.log("dictionary view");
        console.dir(self.state.dictionarySources);
            //did the form group then??
        return (
            <div id="referenceDictionaryView">
                Placeholder Dictionary text
            </div>
        );
    },
    _onChange: function() {
        this.setState(getSettingsState());
    }
});

module.exports = ReferenceDictionaryView;