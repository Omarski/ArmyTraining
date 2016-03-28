var React = require('react');
var PageStore = require('../stores/PageStore');
var UnitStore = require('../stores/UnitStore');

function getUnitState() {
    var units = UnitStore.getAll();
    var totalUnits = 0;
    var totalUnitsComplete = 0;
    var totalUnitPagesComplete = 0;
    var totalUnitPages = 0;
    var currentUnitIndex = 0;
    var currentPageIndex = 1;
    var currentUnitTotalPages = 1;
    var currentUnitCompletedCount = 0;

    for (var key in units) {
        totalUnits++;
        var unit = units[key];
        var completed = true;
        var completedCount = 0;
        var totalPages = 0;

        if (PageStore.unit() && PageStore.unit().data.xid === unit.data.xid) {
            currentUnitIndex = totalUnits;
        }

        for (var i = 0; i < unit.data.chapter.length; i++) {
            var c = unit.data.chapter[i];
            if (PageStore.unit() && PageStore.unit().data.xid === unit.data.xid) {
                currentUnitTotalPages += c.pages.length;
                for( var j = 0; j < c.pages.length; j++) {
                    var page = c.pages[j];
                    if (PageStore.page() && PageStore.page().xid === page.xid) {
                        currentPageIndex = j + 1;
                    }

                    if (page.state && page.state.visited) {
                        currentUnitCompletedCount++;
                    }

                }
            }


            // check pages to see if everything has been
            // viewed in the chapter to determine unit
            // complete state

            var pages = c.pages;
            var pagesLen = pages.length;

            for( var j = 0; j < pagesLen; j++) {
                totalPages++;
                var page = pages[j];

                if (!page.state || !page.state.visited) {
                    completed = false;
                } else {
                    completedCount++;
                }
            }

            totalUnitPagesComplete += completedCount;
            totalUnitPages += pagesLen;

        }

        if (completed) {
            totalUnitsComplete++;
        }
    }

    var st = {
        //data: data,
        currentUnitIndex: currentUnitIndex,
        totalUnits: totalUnits,
        totalUnitPagesComplete: totalUnitPagesComplete,
        totalUnitPages: totalUnitPages,
        totalProgressPercent: Math.round((totalUnitPagesComplete / totalUnitPages) * 100),
        currentUnitCompletedPercent: Math.round((currentUnitCompletedCount / currentUnitTotalPages) * 100),
        currentPageIndex: currentPageIndex,
        currentUnitTotalPages: currentUnitTotalPages,
        totalPages: totalPages,
        unitsPercent: Math.round((totalUnitsComplete / totalUnits) * 100),
        pagesPercent: Math.round((currentPageIndex / currentUnitTotalPages) * 100)
    };



    return st;
}

var ProgressView = React.createClass({
    getInitialState: function() {
        var unitState = getUnitState();
        return unitState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
    },
    render: function() {

        return (
            <div className="row">
                <div className="col-md-2"></div>
                <div className="col-md-4">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-2">Lessons</div>
                            <div className="col-md-9">
                                <div className="progress">
                                    <div className="progress-bar progress-bar-unit" style={{width: this.state.unitsPercent + '%'}}>
                                        <span className="sr-only">{this.state.unitsPercent}% Complete (success)</span>
                                    </div>
                                    <div className="progress-bar progress-bar-total" style={{width: this.state.totalProgressPercent + '%'}}>
                                        <span className="sr-only">{this.state.totalProgressPercent}% Complete (success)</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-1">{this.state.currentUnitIndex}/{this.state.totalUnits}</div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-2">Pages</div>
                            <div className="col-md-9">
                                <div className="progress">
                                    <div className="progress-bar progress-bar-pages" style={{width: this.state.pagesPercent + '%'}}>
                                        <span className="sr-only">{this.state.pagesPercent}% Complete (success)</span>
                                    </div>
                                    <div className="progress-bar progress-bar-unit-complete" style={{width: this.state.currentUnitCompletedPercent + '%'}}>
                                        <span className="sr-only">{this.state.currentUnitCompletedPercent}% Complete (success)</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-1">{this.state.currentPageIndex}/{this.state.currentUnitTotalPages}</div>
                        </div>
                    </div>
                </div>
                <div className="col-md-2"></div>
            </div>

        );
    },
    _onChange: function() {
        this.setState(getUnitState());
    }
});

module.exports = ProgressView;