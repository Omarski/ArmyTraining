/**
 * Created by Alec on 5/23/2016.
 */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');


function getSettingsState(props) {
    var data = {
        mapSource: ""
    };

    if(props && props.mapSource){
        data.mapSource = props.mapSource;
    }

    return data;
}

var ReferenceMapView = React.createClass({
    getInitialState: function() {
        var settingsState = getSettingsState(this.props);
        return settingsState;
    },

    render: function() {
        var self = this;
        var source = self.state.mapSource;

        // TODO: add alt text to image

        return (
            <div id="referenceMapView">
                <img className="reference-map" src={source} alt={""}></img>
            </div>
        );
    },
    _onChange: function() {
        this.setState(getSettingsState());
    }
});

module.exports = ReferenceMapView;