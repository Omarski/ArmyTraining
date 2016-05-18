/**
 * Created by omaramer on 5/9/16.
 */
var React = require('react');
var CultureQuestMapView = require('./CultureQuestMapView');
var CultureQuestQuizView = require('./CultureQuestQuizView');
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
        data.lastSelected = null;

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

    onHideQuiz: function(){
        self.setState({showQuiz:false});
    },

    onRegionClicked: function(canvasElement){

            this.updateLayersColl(canvasElement,'attributeAdd', [{'name':'lastClicked','value':true}]);
            this.setState({'lastSelected': canvasElement, showQuiz:true});

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

            case 'attributeAddExcept':
                for (var l = 0; l < state.layersColl.length; l++){
                    if (state.layersColl[l].getAttribute('id') != layerId){
                        for (var c = 0; c < changesColl.length; c++){
                            state.layersColl[l].setAttribute(changesColl[c].name, changesColl[c].value);
                        }
                    }
                }
                break;

            case 'attributeAddAll':
                for (var l = 0; l < state.layersColl.length; l++){
                    for (var c = 0; c < changesColl.length; c++){
                        state.layersColl[l].setAttribute(changesColl[c].name, changesColl[c].value);
                    }
                }
                break;

            case 'attributeRemove':
                for (var l = 0; l < state.layersColl.length; l++){
                    if (state.layersColl[l].getAttribute('id') == layerId){
                        for (var c = 0; c < changesColl.length; c++){
                            state.layersColl[l].removeAttribute(changesColl[c].name);
                        }
                    }

                }
                break;

            case 'attributeRemoveExcept':
                for (var l = 0; l < state.layersColl.length; l++){
                    if (state.layersColl[l].getAttribute('id') != layerId){
                        for (var c = 0; c < changesColl.length; c++){
                            state.layersColl[l].removeAttribute(changesColl[c].name);
                        }
                    }
                }
                break;

            case 'attributeRemoveAll':
                for (var l = 0; l < state.layersColl.length; l++){
                        for (var c = 0; c < changesColl.length; c++) {
                            state.layersColl[l].removeAttribute(changesColl[c].name);
                        }
                }
                break;

            case 'classAdd':
                for (var l = 0; l < state.layersColl.length; l++){
                    if (state.layersColl[l].getAttribute('id') == layerId){
                        for (var c = 0; c < changesColl.length; c++){
                            state.layersColl[l].classList.add(changesColl[c].name);
                        }
                    }

                }
                break;

            case 'classAddExcept':
                for (var l = 0; l < state.layersColl.length; l++){
                    if (state.layersColl[l].getAttribute('id') != layerId){
                        for (var c = 0; c < changesColl.length; c++){
                            state.layersColl[l].classList.add(changesColl[c].name);
                        }
                    }

                }
                break;

            case 'classAddAll':
                for (var l = 0; l < state.layersColl.length; l++){
                        for (var c = 0; c < changesColl.length; c++){
                            state.layersColl[l].classList.add(changesColl[c].name);
                        }
                }
                break;

            case 'classRemove':
                for (var l = 0; l < state.layersColl.length; l++){
                    if (state.layersColl[l].getAttribute('id') == layerId){
                        for (var c = 0; c < changesColl.length; c++){
                            state.layersColl[l].classList.remove(changesColl[c].name);
                        }
                    }

                }
                break;

            case 'classRemoveExcept':
                for (var l = 0; l < state.layersColl.length; l++){
                    if (state.layersColl[l].getAttribute('id') != layerId){
                        for (var c = 0; c < changesColl.length; c++){
                            state.layersColl[l].classList.remove(changesColl[c].name);
                        }
                    }

                }
                break;

            case 'classRemoveAll':
                for (var l = 0; l < state.layersColl.length; l++){
                        for (var c = 0; c < changesColl.length; c++){
                            state.layersColl[l].classList.remove(changesColl[c].name);
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
            <div id="CultureQuestViewBlock" onclick={self.onHideQuiz}>
               
                <PageHeader sources={sources} title={title} key={state.page.xid} />
                
                <CultureQuestMapView
                    imageData = {state.imageData}
                    onLayersReady = {self.onLayersReady}
                    onRegionClicked = {self.onRegionClicked}
                    showQuiz = {state.showQuiz}>
                    </CultureQuestMapView>

                    {self.state.showQuiz? <CultureQuestQuizView
                    imageData={state.imageData}
                    layersColl={state.layersColl}
                    lastSelected={state.lastSelected}
                    showQuiz = {state.showQuiz}
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