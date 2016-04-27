/**
 * Created by Alec on 4/21/2016.
 */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var ConfigStore = require('../../stores/ConfigStore');

function getSettingsState(props) {
    var data = {
        modalControl: null
    };

    console.log("DliView props...");
    console.dir(props);

    if(props && props.modalControl){
        data.modalControl = props.modalControl;
    }

    return {data};
}

var DliView = React.createClass({
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
        var dliIcon = <span className="glyphicon glyphicon-book btn-icon" aria-hidden="true"></span>;
        var modalControl = function(){
            console.log("not overridden");
        };
        if(this.state.modalControl){
            modalControl = this.state.modalControl;
        }
        // this makes me sad
        return  (<button onClick={modalControl()} type="button" className="btn btn-default btn-lg btn-link main-nav-bar-button" aria-label="sound">
            {dliIcon}
        </button>);
    },
    _onChange: function() {
        this.setState(getSettingsState());
    }
});

module.exports = DliView;