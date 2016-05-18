/**
 * Created by Alec on 4/21/2016.
 */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var ReferenceStore = require('../../stores/ReferenceStore');
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;

function getSettingsState(props) {
    var data = {
        showModal: false
    };

    return data;
}

var ReferenceView = React.createClass({
    close: function(){
        this.setState({ showModal: false });
    },

    openModal: function(){
        console.log('here')
        this.setState({ showModal: !this.state.showModal });
    },

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
        return (
            <div id="referenceView">

                <Modal dialogClassName="referenceModal" bsSize="large" show={this.state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>Reference Guide</Modal.Title>
                    </Modal.Header>
                    <Modal.Body id="referenceModalBody">
                        Here
                    </Modal.Body>
                </Modal>
                <button onClick={this.openModal} type="button" className="btn btn-default btn-lg btn-link main-nav-bar-button" aria-label="reference">
                    <span className="glyphicon glyphicon-education btn-icon" aria-hidden="true"></span>
                </button>
            </div>
        );
    },
    _onChange: function() {
        this.setState(getSettingsState());
    }
});

module.exports = ReferenceView;