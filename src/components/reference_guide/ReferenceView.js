/**
 * Created by Alec on 4/21/2016.
 */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var ReferenceStore = require('../../stores/ReferenceStore');
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;
var NavDropdown = ReactBootstrap.NavDropdown;
var MenuItem = ReactBootstrap.MenuItem;

function getSettingsState(props) {
    var data = {
        showModal: false,
        selectedIndex: 1,
        content: null
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

    handleSelect: function(event) {
        this.setState({ selectedIndex: event });
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
        var content = "";
        switch (this.state.selectedIndex) {
            case 1:
                content = (<h2>First Tab</h2>);
                break;
            case 2:
                content = (<h2>Second Tab</h2>);
                break;
            case 3:
                content = (<h2>Third Tab</h2>);
                break;
            case 4:
                content = (<h2>Fourth Tab</h2>);
                break;
        }
        return (
            <div id="referenceView">

                <Modal dialogClassName="referenceModal" bsSize="large" show={this.state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>Reference Guide</Modal.Title>
                    </Modal.Header>
                    <Modal.Body id="referenceModalBody">
                        <Nav bsStyle="tabs" activeKey={1} onSelect={this.handleSelect}>
                            <NavItem eventKey={1}>
                                NavItem 1 content
                            </NavItem>
                            <NavItem eventKey={2} title="Item">
                                NavItem 2 content
                            </NavItem>
                            <NavItem eventKey={3} disabled>
                                NavItem 3 content
                            </NavItem>
                            <NavDropdown eventKey={4} title="Dropdown" id="nav-dropdown">
                                <MenuItem eventKey="4.1">Action</MenuItem>
                                <MenuItem eventKey="4.2">Another action</MenuItem>
                                <MenuItem eventKey="4.3">Something else here</MenuItem>
                                <MenuItem divider />
                                <MenuItem eventKey="4.4">Separated link</MenuItem>
                            </NavDropdown>
                        </Nav>
                        <div className="container-fluid">
                            {content}
                        </div>
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