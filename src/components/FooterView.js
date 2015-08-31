var React = require('react');
var CheckIcon = require('../components/widgets/CheckIcon');
var UnitStore = require('../stores/UnitStore');
var LoaderStore = require('../stores/LoaderStore');
var PageActions = require('../actions/PageActions');
var NotificationActions = require('../actions/NotificationActions');


function getUnitState() {
    var units = UnitStore.getAll();
    var data = [];

    var title = "";
    for (var key in units) {
        var unit = units[key];
        var chapters = [];
        for (var i = 0; i < unit.data.chapter.length; i++) {
            var c = unit.data.chapter[i];

            chapters.push({
                completed:false,
                title:c.title,
                percent:10,
                data: c
            });
        }

        data.push(
            {
                unit: unit,
                completed:true,
                title:unit.data.title,
                percent:100,
                rows:chapters
            }
        );
    }

    return {
        data: data,
        expanded: false
    };
}

var FooterView = React.createClass({
    next: function() {
        //NotificationActions.show({title:'Please wait', body:'Loading...', percent: ''});
        PageActions.loadNext({});
    },
    previous: function() {
        //NotificationActions.show({title:'Please wait', body:'Loading...', percent: ''});
        PageActions.loadPrevious({});
    },
    _onLoadChange: function() {
        this.setState(getUnitState());
    },

    getInitialState: function() {
        //var unitState = getUnitState();
        //return unitState;
        return {data: [], expanded:false};
    },

    componentWillMount: function() {
        LoaderStore.addChangeListener(this._onLoadChange);
    },

    componentDidMount: function() {
        LoaderStore.addChangeListener(this._onLoadChange);
    },

    componentWillUnmount: function() {
        LoaderStore.removeChangeListener(this._onLoadChange);
    },

    toggleTOC: function(event) {
        this.setState( { expanded : !this.state.expanded } );
    },
    render: function() {
        var items = this.state.data.map(function(item, index) {
            return (
                <div className="panel-group main-footer-accordian" id={'accordion' + index} role="tablist" aria-multiselectable="true" key={index}>
                    <div className="panel panel-default">
                        <div className="panel-heading" role="tab" id={'heading' + index}>
                            <table className="panel-title table table-condensed main-footer-accordian-table">
                                <tr>
                                    <td>
                                        <div className="main-footer-table-icon-col">
                                            <CheckIcon checked={item.completed} />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="main-footer-table-icon-col">
                                            <a role="button" data-toggle="collapse" data-parent={'#accordion' + index} href={'#collapse' + index} aria-expanded="true" aria-controls={'collapse' + index}>
                                                <span className="glyphicon glyphicon-plus-sign" aria-hidden="true"></span>
                                            </a>
                                        </div>
                                    </td>
                                    <td>
                                        <h4>{item.title}</h4>
                                    </td>
                                    <td width="100%">
                                        <div className="dots">&nbsp;</div>
                                    </td>
                                    <td width="55">
                                        <h4>{item.completed ? "Complete" : ""}</h4>
                                    </td>
                                    <td>
                                        <div className="main-footer-table-icon-col">
                                            <h4>{item.percent}%</h4>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div id={'collapse' + index} className="panel-collapse collapse" role="tabpanel" aria-labelledby={'heading' + index}>
                            <div className="panel-body main-footer-panel-body">
                                <TOCDetails data={item.rows} unit={item.unit}/>
                            </div>
                        </div>
                    </div>
                </div>
            )
        });
        return (
            <footer className={this.state.expanded ? "footer main-footer expanded" : "footer main-footer"}>
                <div className="container-fluid footer-nav">
                    <div className={this.state.expanded ? "row hide" : "row"}>
                        <div className="col-md-2"></div>
                        <div className="col-md-4">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-md-2">Lessons</div>
                                    <div className="col-md-9">
                                        <div className="progress">
                                            <div className="progress-bar progress-bar-success main-footer-index-progress-stage-1">
                                                <span className="sr-only">35% Complete (success)</span>
                                            </div>
                                            <div className="progress-bar progress-bar-warning progress-bar-striped main-footer-index-progress-stage-2">
                                                <span className="sr-only main-footer-index-progress-stage-2">20% Complete (warning)</span>
                                            </div>
                                            <div className="progress-bar progress-bar-danger main-footer-index-progress-stage-3">
                                                <span className="sr-only main-footer-index-progress-stage-3">10% Complete (danger)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-1">2/5</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-md-2">Pages</div>
                                    <div className="col-md-9">
                                        <div className="progress">
                                            <div className="progress-bar progress-bar-success main-footer-pages-progress-stage-1">
                                                <span className="sr-only">35% Complete (success)</span>
                                            </div>
                                            <div className="progress-bar progress-bar-warning progress-bar-striped main-footer-pages-progress-stage-2">
                                                <span className="sr-only main-footer-index-progress-stage-2">20% Complete (warning)</span>
                                            </div>
                                            <div className="progress-bar progress-bar-danger main-footer-pages-progress-stage-3">
                                                <span className="sr-only main-footer-index-progress-stage-3">10% Complete (danger)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-1">2/5</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-2"></div>
                    </div>
                    <div id="mainFooterPageNav" className="row main-footer-page-nav">
                        <div className={this.state.expanded ? "container-fluid main-footer-page-nav-buttons-expanded" : "container-fluid"}>
                            <div className="row">
                                <div className="col-md-3">
                                    <button id="lessonsIndexBtn" type="button" className="btn btn-default btn-lg btn-link btn-text-icon" aria-label="Left Align" onClick={this.toggleTOC}>
                                        <span id="lessonsIndexBtnIcon" className={this.state.expanded ? "glyphicon glyphicon-download btn-icon" : "glyphicon glyphicon-upload btn-icon"} aria-hidden="true"></span>
                                        Lessons | Index
                                    </button>
                                </div>
                                <div className="col-md-7"></div>
                                <div className="col-md-1">
                                    <button type="button" onClick={this.previous} className="btn btn-default btn-lg btn-link" aria-label="Left Align">
                                        <span className="glyphicon glyphicon-circle-arrow-left btn-icon" aria-hidden="true"></span>
                                    </button>
                                </div>
                                <div className="col-md-1">
                                    <button type="button" onClick={this.next} className="btn btn-default btn-lg btn-link" aria-label="Left Align">
                                        <span className="glyphicon glyphicon-circle-arrow-right btn-icon" aria-hidden="true"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className={this.state.expanded ? "main-footer-tab-container-expanded" : "main-footer-tab-container"}>
                            <ul className="nav nav-tabs nav-justified main-footer-tab" role="tablist">
                                <li role="presentation" className="active"><a href="#mainFooterLessonsTab" aria-controls="mainFooterLessonsTab" role="tab" data-toggle="tab">Home</a></li>
                                <li role="presentation"><a href="#mainFooterCoursesTab" aria-controls="mainFooterCoursesTab" role="tab" data-toggle="tab">Profile</a></li>
                            </ul>
                            <div className="tab-content main-footer-tab-content">
                                <div role="tabpanel" className="tab-pane active main-footer-tab-pane" id="mainFooterLessonsTab">
                                    {items}
                                </div>
                                <div role="tabpanel" className="tab-pane main-footer-tab-pane" id="mainFooterCoursesTab">...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        );
    }
});

var TOCDetails = React.createClass({

    render: function() {
        var unit = this.props.unit;
        var items = this.props.data.map(function(item, index) {
            return (
                <div key={index}>
                <TOCChapterRow item={item} />
                <TOCPages data={item.data.pages} chapter={item} unit={unit}/>
                    </div>
            );
        });

        return (
            <div>{items}</div>
        );

    }
});

var TOCChapterRow = React.createClass({
    render: function() {
        return (
            <table className="panel-title table table-condensed main-footer-accordian-table">
                <tr>
                    <td>
                        <div className="main-footer-table-icon-col">
                            <CheckIcon completed={this.props.item.completed} />
                        </div>
                    </td>
                    <td>
                        <h4>{this.props.item.title}</h4>
                    </td>
                    <td width="100%">
                        <div className="dots">&nbsp;</div>
                    </td>
                    <td width="55">
                        <h4>{this.props.item.completed ? "Complete" : ""}</h4>
                    </td>
                    <td>
                        <div className="main-footer-table-icon-col">
                            <h4>{this.props.item.percent}%</h4>
                        </div>
                    </td>
                </tr>
            </table>
        );
    }
});

var TOCPages = React.createClass({

    render: function() {
        if (!this.props.data) {
            return (<div></div>);
        }

        var chapter = this.props.chapter;
        var unit = this.props.unit;

        var items = this.props.data.map(function(item, index) {
            return (
                <TOCPageRow item={item} key={index} chapter={chapter} unit={unit} />
            );
        });

        return (
            <div>{items}</div>
        );

    }
});

var TOCPageRow = React.createClass({
    loadPage: function(item, chapter, unit) {
        PageActions.jump({page:item.xid, chapter:chapter.data.xid, unit:unit.id});

    },
    render: function() {
        return (
            <div>
                <table onClick={this.loadPage.bind(this, this.props.item, this.props.chapter, this.props.unit)} className="panel-title table table-condensed table-hover main-footer-accordian-table main-footer-accordian-table-pages">
                    <tr className="main-footer-accordian-table-row">
                        <td>
                            <div className="main-footer-table-icon-col">
                                <CheckIcon completed={true} />
                            </div>
                        </td>
                        <td>
                            <h4>{this.props.item.title}</h4>
                        </td>
                        <td width="100%">
                            <div className="dots">&nbsp;</div>
                        </td>
                        <td width="55">
                            <h4></h4>
                        </td>
                        <td>
                            <div className="main-footer-table-icon-col">
                                <h4>&nbsp;</h4>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        );
    }
});

module.exports = FooterView;