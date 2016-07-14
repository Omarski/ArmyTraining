/**
 * Created by Alec on 4/21/2016.
 */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var ReferenceStore = require('../../stores/ReferenceStore');
var LocalizationStore = require('../../stores/LocalizationStore');
var ReferenceGestureView = require('../../components/reference_guide/ReferenceGestureView');
var ReferenceMapView = require('../../components/reference_guide/ReferenceMapView');
var ReferenceDictionaryView = require('../../components/reference_guide/ReferenceDictionaryView');
var ReferencePdfView = require('../../components/reference_guide/ReferencePdfView');
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
        dictionaryLanguage: "none",
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
        /*
         eventKey = <REFERENCE_PAGETYPE_CONSTANT>.<array index of source>
                  = (selectedIndex).(sourceKey);

         example: e = 3.2 means the selected item is a dictionary view (const value 3) and should display
         content from the dictionary with index [2]
         */
        var eventKeys = "";
        var selectedIndex = "";
        var sourceKey = "";
        var languageName = "none";
        if(typeof eventKey === "number"){
            selectedIndex = eventKey;
        }else{
            eventKeys = eventKey.split('.');
            selectedIndex = parseInt(eventKeys[0]);
            sourceKey = parseInt(eventKeys[1]);
            languageName = $(e.target).attr("data-name") ? $(e.target).attr("data-name") : "none";
        }



        switch(selectedIndex){
            case REFERENCE_MAP_VIEW:
            case REFERENCE_GESTURE_VIEW:
                this.setState({ selectedIndex: eventKey });
                break;
            case REFERENCE_DICTIONARY_VIEW:
                this.setState({selectedIndex: selectedIndex, dictionarySourceKey: sourceKey, dictionaryLanguage: languageName });
                break;
            case REFERENCE_PDF_VIEW:
                this.setState({ selectedIndex: eventKey });
                break;
            default:
                // no op, more reference page types may come later
        }
    },

    getInitialState: function() {
        var settingsState = getSettingsState(this.props);
        return settingsState;
    },

    componentDidMount: function() {
        ReferenceStore.addUpdateListener(this._onReferenceChange);
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
                                  className={"reference-tab"}
                                  id={"WordsAndPhrasesDropdownItem" + item.name}
                                  eventKey={REFERENCE_DICTIONARY_VIEW + "." + index}
                                  data-name={item.name}
                    >
                    {item.name}
                </MenuItem>);
            });

            dictionaryNav = (<NavDropdown eventKey={REFERENCE_DICTIONARY_VIEW}
                                          className={"reference-nav-dropdown" + (state.selectedIndex === REFERENCE_DICTIONARY_VIEW ? " active" : "")}
                                          title={LocalizationStore.labelFor("reference","refWordsTitle")}
                                          id="WordsAndPhrasesDropdownMenu"
                >
                {dictionaryDropdownItems}
            </NavDropdown>);
        }
        // pdf sources
        if(state.pdfSources){
            //var dropdownItems = state.pdfSources.map(function(item, index){
            //    return (<MenuItem key={"dropdownItemsKey" + index}
            //                      eventKey={REFERENCE_PDF_VIEW + "." + index }
            //                      href={item.path} target={"_blank"}
            //                      id={"PDFTakeawaysItem"+item.name}
            //        >
            //        {item.name}
            //    </MenuItem>);
            //});

            pdfNav = (<NavItem className="reference-tab" eventKey={REFERENCE_PDF_VIEW} title={LocalizationStore.labelFor("reference","refPdfTitle")} id="PDFTakeawaysDropdownMenu">
                {LocalizationStore.labelFor("reference","refPdfTitle")}
            </NavItem>);
        }

        if(state.mapSource){
            mapNav = (<NavItem className="reference-tab" eventKey={REFERENCE_MAP_VIEW} title={LocalizationStore.labelFor("reference","refMapTitle")}>
                {LocalizationStore.labelFor("reference","refMapTitle")}
            </NavItem>);
        }

        if(state.gestureSources){
            gestureNav = (<NavItem className="reference-tab" eventKey={REFERENCE_GESTURE_VIEW} title={LocalizationStore.labelFor("reference","refGestureTitle")}>{LocalizationStore.labelFor("reference","refGestureTitle")}</NavItem>);
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
                                                    source={self.state.dictionarySources[state.dictionarySourceKey].path}
                                                    language={self.state.dictionaryLanguage} />);
                break;
            case REFERENCE_PDF_VIEW:
                content = (<ReferencePdfView list={state.pdfSources} />);
                break;
            default:
                // no op
                break;
        }

        /*
         <button title={LocalizationStore.labelFor("header", "tooltipReference")}
         alt={LocalizationStore.labelFor("header", "tooltipReference")}
         onClick={this.openModal}
         type="button"
         className="btn btn-default btn-lg btn-link main-nav-bar-button"
         aria-label={LocalizationStore.labelFor("header", "tooltipReference")}
         >
         */

        return (
            <div id="referenceView">
                <Modal dialogClassName="referenceModal" bsSize="large" show={state.showModal} onHide={this.close}>
                    <Modal.Header>
                        <Modal.Title>{LocalizationStore.labelFor("reference", "refTitle")}</Modal.Title>
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
                    <span className="glyphicon glyphicon-education btn-icon btn-link" aria-hidden="true"></span>
            </div>
        );
    },
    _onChange: function() {
        this.setState(getSettingsState());
    },
    _onReferenceChange: function(){
        var self = this;
        var referenceJson = ReferenceStore.getData();
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
                showModal: ReferenceStore.shouldShow(),
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