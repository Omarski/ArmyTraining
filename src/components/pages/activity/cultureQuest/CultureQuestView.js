/**
 * Created by omaramer on 5/9/16.
 */
var React = require('react');
var CultureQuestMap = require('./CultureQuestMap');
var PageHeader = require('../../../widgets/PageHeader');

function getPageState(props) {

    var data = {
        page: "",
        sources: [],
        title: "",
        pageType: "",
        showQuiz: false,
        showPop: false
    } ;


    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
        data.imageData = JSON.parse(data.page.info.property[2].value);
        data.layersColl = [];
        
        if (props.page.note) {

        }

        if (props.page.media) {

        }
    }

    return data;
}

var CultureQuestView = React.createClass({
    getInitialState: function() {

        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        
        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        //PageStore.removeChangeListener(this._onChange);
    },

    onLayersReady:function(layersColl){
        this.setState({layersColl:layersColl});
    },

    onRegionClicked: function(canvasElement){

        this.updateLayersColl(canvasElement,'attributeAdd', [{'name':'lastClicked','value':true}]);
        console.log("In View - Clicked on: " + canvasElement.getAttribute('id'));
        // this.updateLayersColl({
        //
        //    'layerId': canvasElement,
        //    'attributeAdd':[
        //        {'lastClicked':true}],
        //    'classAdd': [],
        //    'classRemove': [],
        //    'classAddAll':[],
        //    'classRemoveAll':[]
        //    })
    },

    updateLayersColl:function(layer, changeMode, changesColl){

        var self = this;
        var state = self.state;
        var layerId = layer.getAttribute('id');

        switch(changeMode){

            case 'attributeAdd':
                for (var l = 0; l < state.layersColl.length; l++){
                    if (state.layersColl[l].getAttribute('id') == layerId){
                        for (var c = 0; c < changesColl.length; c++){
                            state.layersColl[l].setAttribute(changesColl[c].name, changesColl[c].value);
                        }
                    }

                }
                break;
        }


    },
    
    render: function() {
        var self = this;
        var state = self.state;
        var page = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;

        return (
            <div>
                <PageHeader sources={sources} title={title} key={state.page.xid} />
                <CultureQuestMap
                    imageData = {state.imageData}
                    onLayersReady = {self.onLayersReady}
                    onRegionClicked = {self.onRegionClicked}
                />
                {self.state.showQuiz? <CultureQuestQuiz
                    imageData={state.imageData}
                    layersColl={state.layersColl}
                />:null}
                {self.state.showPop? <CultureQuestPopup />:null}
            </div>
        );
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        this.setState(getPageState());
    }
});

module.exports = CultureQuestView;