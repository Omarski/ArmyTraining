/**
 * Created by Alec on 5/23/2016.
 */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var FilterableTable = require('../widgets/FilterableTable');


function getSettingsState(props) {
    var data = {
        gestureSources: null
    };

    if(props && props.gestureSources){
        data.gestureSources = props.gestureSources;
    }

    return data;
}

var ReferenceGestureView = React.createClass({
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
        return (
            <div id="referenceGestureView">
                <FilterableTable dictionary={self.state.gestureSources} hasVideo={true} hasHeaders={false} />
            </div>
        );
    },
    _onChange: function() {
        this.setState(getSettingsState());
    }
});

module.exports = ReferenceGestureView;