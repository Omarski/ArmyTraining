var FooterActions = require('../../../actions/FooterActions');
var LocalizationStore = require('../../../stores/LocalizationStore');
var PageHeader = require('../../widgets/PageHeader');
var PageStore = require('../../../stores/PageStore');
var React = require('react');
var SCORMActions = require('../../../actions/SCORMActions');
var UnitStore = require('../../../stores/UnitStore');
var ReferenceStore = require('../../../stores/ReferenceStore');


function getPageState(props) {
    var data = {
        page: "",
        pageFeedback: "",
        pageFeedbackHeader: "",
        pageFeedbackImage: "",
        pageType: "",
        title: ""
    };

    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
    }


    // check if current chapter is completed
    if (!PageStore.isChapterComplete()) {
        data.pageFeedback = LocalizationStore.labelFor("sectionEnd", "lblSectionFailed");
    }
    else if (UnitStore.areAllRequiredComplete()) {
        data.pageFeedback = LocalizationStore.labelFor("sectionEnd", "lblCourseComplete");
        data.pageFeedbackHeader = LocalizationStore.labelFor("sectionEnd", "lblCongratulations");
        data.pageFeedbackImage = LocalizationStore.labelFor("sectionEnd", "imageComplete");
    }
    else if (PageStore.isUnitComplete()) {
        data.pageFeedback = LocalizationStore.labelFor("sectionEnd", "lblLessonComplete");
        data.pageFeedbackHeader = LocalizationStore.labelFor("sectionEnd", "lblCongratulations");
        data.pageFeedbackImage = LocalizationStore.labelFor("sectionEnd", "imageComplete");
    } else {
        data.pageFeedback = LocalizationStore.labelFor("sectionEnd", "lblSectionComplete");
        data.pageFeedbackHeader = LocalizationStore.labelFor("sectionEnd", "lblCongratulations");
        data.pageFeedbackImage = LocalizationStore.labelFor("sectionEnd", "imageComplete");
    }

    return data;
}


var SectionEndView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        var self = this;

        // send course completion HACK
        if (UnitStore.areAllRequiredComplete()) {
            SCORMActions.complete();
        }

        // disable next button
        setTimeout(function() {
            if (!PageStore.isChapterComplete()) {
                FooterActions.disableNext();
            }
            if(UnitStore.areAllRequiredComplete()) {
                FooterActions.disableNext();
            }
        }, 0.1);


        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    getPDF: function(){
        var pdfPath = ReferenceStore.getPDF(PageStore.chapter().xid);
        return pdfPath;
    },

    render: function() {
        var self = this;
        var state = self.state;
        var title = state.title;
        var feedback = state.pageFeedback;
        var feedbackHeader = state.pageFeedbackHeader;
        var feedbackImageSrc = state.pageFeedbackImage;
        var feedbackImage = "";

        if (feedbackImageSrc !== "") {
            feedbackImage = <img className="" src={feedbackImageSrc}></img>;
        }


        var PDFcontent = "";
        if (PageStore.isChapterComplete()) {
            var pdfPath = self.getPDF();
            if (pdfPath) {
                var pdfText = PageStore.unit().data.title + " PDF Takeaways";
                PDFcontent = <div className = "row"><a href={pdfPath} target="_blank">{pdfText}</a></div>;
            }
        }

        return (
            <div>
                <PageHeader sources={state.sources} title={title} key={state.page.xid}/>
                <div className="container section-end-container">
                    <div className="container-fluid">
                        <div className="row">
                            {feedbackHeader}
                        </div>
                        <div className="row">
                            {feedbackImage}
                        </div>
                        <div className="row">
                            {feedback}
                        </div>
                        {PDFcontent}
                    </div>
                </div>
            </div>
        );
    },

    _onChange: function() {
        if (this.isMounted()) {
            this.setState(getPageState(this.props));
        }
    }
});

module.exports = SectionEndView;