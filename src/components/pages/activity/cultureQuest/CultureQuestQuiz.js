/**
 * Created by omaramer on 5/13/16.
 */

var React = require('react');
var TimerCountdownView = require('../../../widgets/TimerCountdownView');


var CultureQuestQuiz = React.createClass({

    getInitialState: function() {

        return {
            mediaPath:'data/media/'
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

    getSelected: function(){

        for (var i=0; i < this.props.layerColl.length; i++){
            if (this.props.layersColl[i].getAttribute('lastClicked') == true){
                return this.props.layerColl[i];
            }
        }
        return false;
    },

    render: function() {

        var self = this;
        var btnRespondClasses = "btn btn-primary " + self.state.btnRespondHovered;
        var btnSkipClasses = "btn btn-primary " + self.state.btnSkipHovered;
        var instImg = self.state.mediaPath + self.getSelected()['face'];
        var instStyle = {background:"#000 url("+instImg+") no-repeat 100% 100%"};
        
        return (
            <div class="modal fade" tabindex="-1" role="dialog">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-body">
                            <TimerCountdownView
                                styling     = {self.timerStyle}
                                startTime   = {self.timerStart}
                                controller  = {self.controller}
                            />
                            <div style={instStyle} className="CultureQuestQuiz-instructorImg">
                            </div>
                            <div className="CultureQuestQuiz-quizBody">
                            <button type="button" className={btnRespondClasses}>Respond</button>
                            <button type="button" className={btnSkipClasses}>Skip question</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        )
    }
});

module.exports = CultureQuestQuiz;