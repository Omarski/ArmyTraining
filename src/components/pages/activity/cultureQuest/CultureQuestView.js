/**
 * Created by omaramer on 5/9/16.
 */
var React = require('react');
var CultureQuestMapView = require('./CultureQuestMapView');
var CultureQuestQuizView = require('./CultureQuestQuizView');
var CultureQuestPuzzleAwardView = require('./CultureQuestPuzzleAwardView');
var CultureQuestPuzzleGameView = require('./CultureQuestPuzzleGameView');
var PageHeader = require('../../../widgets/PageHeader');

function getPageState(props) {

    var data = {
        page: "",
        sources: [],
        title: "",
        pageType: "",
        showQuiz: false,
        showPopup: false,
        showPuzzle: false,
        showPuzzleGame: true
    };


    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
        data.imageData = JSON.parse(data.page.info.property[2].value);
        data.layersColl = [];
        data.lastSelected = null;
        data.answersColl = [];
    }

    return data;
}

var CultureQuestView = React.createClass({
    getInitialState: function() {

        var pageState = getPageState(this.props);
        return pageState;
    },

    // shouldComponentUpdate: function(nextProps, nextState) {
    //     //return nextProps.email != this.props.email;
    // },

    componentWillMount: function() {
    },

    componentDidMount: function() {
    },

    componentWillUnmount: function() {
    },

    onLayersReady:function(layersColl){
        this.setState({layersColl:layersColl});
        this.prepAnswersColl();
    },

    prepAnswersColl: function() {
         //populate from previous data if any - otherwise init here:
        var objColl = [];
        for (var l = 0; l < this.state.layersColl.length; l++){
            var obj = {'layerNumber': l, 'completed': false, onQuestion:1,
                'question1':{'answered':false, attempts:0},
                'question2':{'answered':false, attempts:0}};
            objColl.push(obj);
        }
        this.setState({answersColl:objColl});
    },

    showQuizUpdate: function(mode){

        var self = this;

        if (mode === "show") {
            self.setState({showQuiz: true});
            $("#cultureQuestQuizView-quizCont").animate({opacity:'1'}, 500, 'linear', function(){
                $("#imageLayerView-back-image").children().addClass("CultureQuestQuizView-killInteraction");
            });
        } else {
            $("#cultureQuestQuizView-quizCont").animate({opacity:'0'}, 500, 'linear', function(){
                self.setState({showQuiz: false});
                $("#imageLayerView-back-image").children().removeClass("CultureQuestQuizView-killInteraction");
            });
        }
    },

    showPuzzleUpdate: function(mode){

        var self = this;

        if (mode === "show") {
            self.setState({showPuzzle:true});
            $("#CultureQuestPuzzleAwardView-puzzleCont").animate({opacity: '1'}, 300, 'linear', function () {
            });
        } else {
            $("#CultureQuestPuzzleAwardView-puzzleCont").animate({opacity: '0'}, 300, 'linear', function () {
                self.setState({showPuzzle:false});
            });
        }
    },

    onRegionClicked: function(canvasElement){

        this.updateLayersColl(canvasElement,'attributeAdd', [{'name':'lastClicked','value':true}]);
        this.setState({'lastSelected': canvasElement});//, showQuiz:true
        this.showQuizUpdate("show");
    },

    updateLayersColl:function(layer, changeMode, changesColl){

        var self = this;
        var state = self.state;
        var layerId = layer.getAttribute('id');
        var applyToAll  = changeMode.indexOf("All") !== -1;
        var applyExcept = changeMode.indexOf("Except") !== -1;

        for (var l = 0; l < state.layersColl.length; l++){

            if ((state.layersColl[l].getAttribute('id') === layerId && !applyExcept) || applyToAll){
                for (var c = 0; c < changesColl.length; c++){

                    switch(changeMode){
                        case 'attributeAdd': case 'attributeAddAll':
                            state.layersColl[l].setAttribute(changesColl[c].name, changesColl[c].value);
                            break;
                        case 'attributeRemove': case 'attributeRemoveAll':
                            state.layersColl[l].removeAttribute(changesColl[c].name);
                            break;
                        case 'classAdd': case 'classAddAll':
                            if (!state.layersColl[l].classList.contains(changesColl[c].name))
                                 state.layersColl[l].classList.add(changesColl[c].name);
                            break;
                        case 'classRemove': case 'classRemoveAll':
                            state.layersColl[l].classList.remove(changesColl[c].name);
                            break;
                    }
                }

            }else if (applyExcept) {

                if (state.layersColl[l].getAttribute('id') !== layerId){
                    for (var c = 0; c < changesColl.length; c++){

                        switch(changeMode){
                            case 'attributeAddExcept':
                                state.layersColl[l].setAttribute(changesColl[c].name, changesColl[c].value);
                                break;
                            case 'attributeRemoveExcept':
                                state.layersColl[l].removeAttribute(changesColl[c].name);
                                break;
                            case 'classAddExcept':
                                state.layersColl[l].classList.add(changesColl[c].name);
                                break;
                            case 'classRemoveExcept':
                                state.layersColl[l].classList.remove(changesColl[c].name);
                            break;
                        }
                    }
                }
            }
        }
    },

    saveAnswersColl: function(answersColl){
        this.state.answersColl = answersColl;
    },
    
    render: function() {
        var self = this;
        var state = self.state;
        var page = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        var blockStyle = {position:'relative', width:'768px', height:'504px', marginLeft:'auto', marginRight:'auto'};
        
        return (
            <div style={blockStyle}>
                <PageHeader sources={sources} title={title} key={state.page.xid} />

                <div id="CultureQuestViewBlock">

                    <CultureQuestMapView
                        imageData = {state.imageData}
                        layersColl = {state.layersColl}
                        onLayersReady = {self.onLayersReady}
                        onRegionClicked = {self.onRegionClicked}
                        answersColl = {state.answersColl}
                        lastSelected = {state.lastSelected}
                        updateLayersColl = {self.updateLayersColl}
                    >

                    </CultureQuestMapView>

                        {self.state.showQuiz? <CultureQuestQuizView
                        imageData={state.imageData}
                        layersColl={state.layersColl}
                        lastSelected={state.lastSelected}
                        showQuiz = {state.showQuiz}
                        showQuizUpdate = {self.showQuizUpdate}
                        showPuzzleUpdate = {self.showPuzzleUpdate}
                        answersColl = {state.answersColl}
                        saveAnswersColl = {self.saveAnswersColl}
                        />:null}

                    {self.state.showPopup? <CultureQuestPopup />:null}
                    {self.state.showPuzzle? <CultureQuestPuzzleAwardView
                        imageData = {state.imageData}
                        lastSelected = {state.lastSelected}
                        answersColl = {state.answersColl}
                        showQuizUpdate = {self.showQuizUpdate}
                        showPuzzleUpdate = {self.showPuzzleUpdate}
                    />:null}

                    {self.state.showPuzzleGame? <CultureQuestPuzzleGameView
                    imageData={state.imageData}
                    />:null}

                </div>
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