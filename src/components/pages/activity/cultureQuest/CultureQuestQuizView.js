/**
 * Created by omaramer on 5/13/16.
 */

var React = require('react');
var TimerCountdownView = require('../../../widgets/TimerCountdownView');
var CultureQuestInputBlocksView = require('./CultureQuestInputBlocksView');

var CultureQuestQuiz = React.createClass({

    getInitialState: function() {

        return {
            mediaPath:'data/media/',
            timerController: {},
            btnRespondHovered: "",
            btnSkipHovered: ""
        };
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

    getSelectedJSON: function(){

        if (this.props.lastSelected) {
            var layerIndex = parseInt(this.props.lastSelected.getAttribute('id').substring(18));
            return this.props.imageData.regions[layerIndex];
        }
        return false;
    },

    render: function() {

        var self = this;

        var quizPopClasses = (self.props.showQuiz) ? "cultureQuestQuizView-fade-in" : ".cultureQuestQuizView-fade-out";

        var btnRespondClasses = "btn btn-primary " + self.state.btnRespondHovered;
        var btnSkipClasses = "btn btn-primary " + self.state.btnSkipHovered;

        var instImg = self.state.mediaPath + self.getSelectedJSON()['face'];
        var instStyle = {background:"#000 url("+instImg+") no-repeat 100% 100%"};

        var timerStyle = {};

        return (
                <div className={"cultureQuestQuizView-quizPop "+quizPopClasses}>

                    <TimerCountdownView
                        styling     = {timerStyle}
                        startTime   = {60}
                        controller  = {self.state.timerController}
                    />

                    <div className="cultureQuestQuizView-quizCont" id="cultureQuestQuizView-quizCont">

                        {this.props.lastSelected ? <div style={instStyle} className="cultureQuestQuizView-instructorImg"></div> : null}

                        <div className="cultureQuestQuizView-quizBody" id="cultureQuestQuizView-quizBody">

                            <div className="cultureQuestQuizView-quizText" id="cultureQuestQuizView-quizText"></div>

                            <CultureQuestInputBlocksView
                                selectedJSON={self.getSelectedJSON()}
                            />
                            
                            <button type="button" className={btnRespondClasses}>Respond</button>
                            <button type="button" className={btnSkipClasses}>Skip question</button>
                        </div>

                    </div>

                    <div className="cultureQuestQuiz-puzzleCont" id="cultureQuestQuiz-puzzleCont">
                    </div>
                </div>

        );
    }
});

module.exports = CultureQuestQuiz;