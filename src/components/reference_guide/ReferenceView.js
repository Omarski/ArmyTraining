/**
 * Created by Alec on 4/21/2016.
 */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var ReferenceStore = require('../../stores/ReferenceStore');
var ReferenceGestureView = require('../../components/reference_guide/ReferenceGestureView');
var ReferenceMapView = require('../../components/reference_guide/ReferenceMapView');
var ReferenceDictionaryView = require('../../components/reference_guide/ReferenceDictionaryView');
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;
var NavDropdown = ReactBootstrap.NavDropdown;
var MenuItem = ReactBootstrap.MenuItem;
var Tabs = ReactBootstrap.Tabs;
var Tab = ReactBootstrap.Tab;

var REFERENCE_MAP_VIEW = 1;
var REFERENCE_GESTURE_VIEW = 2;
var REFERENCE_DICTIONARY_VIEW = 3;
var REFERENCE_PDF_VIEW = 4;

function getSettingsState(props) {
    var data = {
        showModal: false,
        selectedIndex: 1,
        content: null,
        referenceJson: {},
        mapSource: null,
        pdfSources: null,
        gestureSources: null,
        dictionarySources: null,
        dictionarySourceKey: null,
        jsonItems: []
    };



    return data;
}

var ReferenceView = React.createClass({
    close: function(){
        this.setState({ showModal: false, dictionarySourceKey: 0 });
    },

    openModal: function(){
        var self = this;
        this.setState({ showModal: !this.state.showModal });
    },
    handleSelect: function(eventKey, e) {
        if(typeof(eventKey) === "object"){
            /* eventKey === "object" means you selected a drop-down menu sub-item and the event key
                    is being passed in 'e' instead

                e = <REFERENCE_PAGETYPE_CONSTANT>.<array index of source>

                example: e = 3.2 means the selected item is a dictionary view (const value 3) and should display
                    content from the dictionary with index [2]
             */
            var eventKeys = e.split('.');
            var selectedIndex = parseInt(eventKeys[0]);
            var sourceKey = parseInt(eventKeys[1]);

            switch(selectedIndex){
                case REFERENCE_PDF_VIEW:
                    this.setState({ selectedIndex: REFERENCE_MAP_VIEW, showModal: false});
                    break;
                case REFERENCE_DICTIONARY_VIEW:
                    this.setState({selectedIndex: REFERENCE_DICTIONARY_VIEW, dictionarySourceKey: sourceKey });
                    break;
                default:
                    // no op, more reference page types may come later
            }
        }else if(typeof(eventKey) === "number"){
            this.setState({ selectedIndex: eventKey });
        }
    },

    getInitialState: function() {
        var settingsState = getSettingsState(this.props);
        return settingsState;
    },

    componentDidMount: function() {
        ReferenceStore.addChangeListener(this._onReferenceChange);
    },
    render: function() {
        var self = this;
        var state = self.state;
        var content = "";
        var dictionaryNav = "";
        var pdfNav = "";
        var mapNav = "";
        var gestureNav = "";

        if(state.dictionarySources){
            var dictionaryDropdownItems = state.dictionarySources.map(function(item, index){
                return (<MenuItem key={"dropdownDictKey" + index}
                                  id={"WordsAndPhrasesDropdownItem" + item.name}
                                  eventKey={REFERENCE_DICTIONARY_VIEW + "." + index}
                    >
                    {item.name}
                </MenuItem>);
            });

            dictionaryNav = (<NavDropdown eventKey={REFERENCE_DICTIONARY_VIEW}
                                          title={"Words "+ '\u0026' +" Phrases"}
                                          id="WordsAndPhrasesDropdownMenu"
                >
                {dictionaryDropdownItems}
            </NavDropdown>);
        }
        // pdf sources
        if(state.pdfSources){
            var dropdownItems = state.pdfSources.map(function(item, index){
                return (<MenuItem key={"dropdownItemsKey" + index}
                                  eventKey={REFERENCE_PDF_VIEW + "." + index }
                                  href={item.path} target={"_blank"}
                                  id={"PDFTakeawaysItem"+item.name}
                    >
                    {item.name}
                </MenuItem>);
            });

            pdfNav = (<NavDropdown eventKey={REFERENCE_PDF_VIEW} title="PDF Takeaways" id="PDFTakeawaysDropdownMenu">
                {dropdownItems}
            </NavDropdown>);
        }

        if(state.mapSource){
            mapNav = (<NavItem eventKey={REFERENCE_MAP_VIEW}>
                Map
            </NavItem>);
        }

        if(state.gestureSources){
            gestureNav = (<NavItem eventKey={REFERENCE_GESTURE_VIEW} title="Item">Gestures</NavItem>);
        }

        switch (state.selectedIndex) {
            case REFERENCE_MAP_VIEW:
                content = (<ReferenceMapView key={"referenceMapViewKey"+state.selectedIndex}
                                             mapSource={self.state.mapSource} />);
                break;
            case REFERENCE_GESTURE_VIEW:
                content = (<ReferenceGestureView key={"referenceGestureViewKey"+state.selectedIndex}
                                                 gestureSources={self.state.gestureSources} />);
                break;
            case REFERENCE_DICTIONARY_VIEW:
                content = (<ReferenceDictionaryView key={"referenceDictionaryViewKey"+state.selectedIndex + state.dictionarySourceKey}
                                                    source={self.state.dictionarySources[state.dictionarySourceKey].path} />);
                break;
            default:
                // no op, PDFs open in new tab/window
                break;
        }

        return (
            <div id="referenceView">

                <Modal dialogClassName="referenceModal" bsSize="large" show={state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>Reference Guide</Modal.Title>
                    </Modal.Header>
                    <Modal.Body id="referenceModalBody">
                        <Nav bsStyle="tabs" activeKey={state.selectedIndex} onSelect={this.handleSelect}>
                            {mapNav}
                            {gestureNav}
                            {dictionaryNav}
                            {pdfNav}
                        </Nav>
                        <div className="container-fluid">
                            {content}
                        </div>
                    </Modal.Body>
                </Modal>
                <button onClick={this.openModal} id="referenceButton" type="button" className="btn btn-default btn-lg btn-link main-nav-bar-button" aria-label="reference">
                    <span className="glyphicon glyphicon-education btn-icon" aria-hidden="true"></span>
                </button>
            </div>
        );
    },
    _onChange: function() {
        this.setState(getSettingsState());
    },
    _onReferenceChange: function(){
        var self = this;
        var referenceJson = ReferenceStore.getData();
        console.dir(referenceJson);
        if(referenceJson && referenceJson.items){
            var mapSource = null;
            var pdfSources = null;
            var gestureSources = null;
            var dictionarySources = null;

            referenceJson.items.map(function(item){
                switch(item.type){
                    case "gesture":
                        gestureSources = item.assets;
                        break;
                    case "image":
                        mapSource = item.assets[0].path;
                        break;
                    case "pdfList":
                        pdfSources = item.assets;
                        break;
                    case "dictionary":
                        dictionarySources = item.assets;
                        break;
                    default:
                    // no op
                }
            });

            self.setState({
                jsonItems: referenceJson.items,
                mapSource: mapSource,
                pdfSources: pdfSources,
                gestureSources: gestureSources,
                dictionarySources: dictionarySources
            })
        }
    }
});

ReferenceView.propTypes = {

}

module.exports = ReferenceView;