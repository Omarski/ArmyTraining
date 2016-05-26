/**
 * Created by Alec on 5/23/2016.
 */
var React = require('react');
var SettingsStore = require('../../stores/SettingsStore');
var ReactBootstrap = require('react-bootstrap');


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
                <FilterableGestureTable gestures={self.state.gestureSources} />
            </div>
        );
    },
    _onChange: function() {
        this.setState(getSettingsState());
    }
});

module.exports = ReferenceGestureView;


var SearchBar = React.createClass({
    handleChange: function(event){
        var self = this;
        self.setState({
            filterText: event.target.value
        });
        this.props.onUserInput(event.target.value);
    },

    getInitialState: function(){
        var self = this;
        return(
            {filterText: self.props.filterText}
        );
    },

    render: function(){
        var self = this;
        return(
            <form>
                <input type="text"
                       value={self.state.filterText}
                       placeholder="Search..."
                       ref="filterTextInput"
                       onChange={self.handleChange}
                    />
            </form>
        )
    }
});

var GestureRow = React.createClass({
    render: function() {
        var name = this.props.name;
        var desc = this.props.description;
        return (
            <tr onClick={this.props.handleClick} >
                <td data-source={this.props.path}>{name}</td>
                <td data-source={this.props.path}>{desc}</td>
            </tr>
        );
    }
});

var GestureTable = React.createClass({
    render: function() {
        var rows = [];
        var self = this;
        this.props.gestures.forEach(function(item) {
            // check the gesture name and the description of the gesture
            if(item.name.indexOf(self.props.filterText) === -1 && item.description.indexOf(self.props.filterText) === -1){
                return;
            }

            rows.push(<GestureRow name={item.name} handleClick={this.props.handleClick} description={item.description} path={item.path}/>);
        }.bind(self) );
        return (
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                </tr>
                </thead>
                <tbody className="referenceTable">{rows}</tbody>
            </table>
        );
    }
});

var FilterableGestureTable = React.createClass({
    getInitialState: function() {
        return {
            filterText: "",
            videoSource: ""
        };
    },

    handleUserInput: function(ft) {
        this.setState({
            filterText: ft
        });
    },

    handleClick: function(e){
        // get source url for gesture clicked
        var video = document.getElementById("gesture-video");
        video.src = $(e.target).attr("data-source");
        video.load();
    },

    render: function() {
        // add video for the gesture
        return (
        <div>
            <video id="gesture-video" width="320" height="240" autoPlay={SettingsStore.autoPlaySound()} volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
                <source src={""} type="video/mp4"></source>
            </video>
            <SearchBar filterText={this.state.filterText}
                       onUserInput={this.handleUserInput}
                />
            <GestureTable filterText={this.state.filterText}
                          gestures={this.props.gestures}
                          handleClick={this.handleClick}
                />
        </div>
        );
    }
});