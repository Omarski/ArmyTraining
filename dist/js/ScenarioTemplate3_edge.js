/*jslint */
/*global AdobeEdge: false, window: false, document: false, console:false, alert: false */
(function (compId) {

    "use strict";
    var im='images/',
        aud='media/',
        vid='media/',
        js='js/',
        fonts = {
        },
        opts = {
            'gAudioPreloadPreference': 'auto',
            'gVideoPreloadPreference': 'auto'
        },
        resources = [
        ],
        scripts = [
            "https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"
        ],
        symbols = {
            "stage": {
                version: "6.0.0",
                minimumCompatibleVersion: "5.0.0",
                build: "6.0.0.400",
                scaleToFit: "none",
                centerStage: "none",
                resizeInstances: false,
                content: {
                    dom: [
                        {
                            id: 'BgSymbol',
                            symbolName: 'BgSymbol',
                            type: 'rect',
                            rect: ['0', '0', '1240', '814', 'auto', 'auto']
                        },
                        {
                            id: 'SorayaSymbol',
                            symbolName: 'SorayaSymbol',
                            type: 'rect',
                            rect: ['469', '235', '208', '540', 'auto', 'auto']
                        },
                        {
                            id: 'ZhangSymbol',
                            symbolName: 'ZhangSymbol',
                            type: 'rect',
                            rect: ['718', '250', '200', '512', 'auto', 'auto']
                        }
                    ],
                    style: {
                        '${Stage}': {
                            isStage: true,
                            rect: ['null', 'null', '1240px', '814px', 'auto', 'auto'],
                            overflow: 'hidden',
                            fill: ["rgba(255,255,255,1)"]
                        }
                    }
                },
                timeline: {
                    duration: 7333,
                    autoPlay: true,
                    data: [

                    ]
                }
            },
			"BgSymbol": {
                version: "6.0.0",
                minimumCompatibleVersion: "5.0.0",
                build: "6.0.0.400",
                scaleToFit: "none",
                centerStage: "none",
                resizeInstances: false,
                content: {
                    dom: [
                        {
                            preload: 'auto',
                            rect: ['0px', '0px', '1240px', '814px', 'auto', 'auto'],
                            source: ['data/media/BGvid.mp4'],
                            id: 'Bg',
                            type: 'video',
                            tag: 'video'
                        }
                    ],
                    style: {
                        '${symbolSelector}': {
                            rect: [null, null, '1240px', '814px']
                        }
                    }
                },
                timeline: {
                    duration: 10733,
                    autoPlay: true,
                    data: [

                    ]
                }
            },
            "ZhangSymbol": {
                version: "6.0.0",
                minimumCompatibleVersion: "5.0.0",
                build: "6.0.0.400",
                scaleToFit: "none",
                centerStage: "none",
                resizeInstances: false,
                content: {
                    dom: [
                        {
                            preload: 'auto',
                            rect: ['0px', '0px', '200px', '512px', 'auto', 'auto'],
                            source: ['data/media/Zhang_Crop.mp4'],
                            id: 'Zhang_Crop',
                            type: 'video',
                            tag: 'video'
                        }
                    ],
                    style: {
                        '${symbolSelector}': {
                            rect: [null, null, '200px', '512px']
                        }
                    }
                },
                timeline: {
                    duration: 10733,
                    autoPlay: false,
                    labels: {
                        "Zhang1": 0,
                        "Zhang2": 1067,
                        "Zhang3": 3733,
                        "Zhang4": 7733,
                        "Zhang5": 10733
                    },
                    data: [

                    ]
                }
            },
            "SorayaSymbol": {
                version: "6.0.0",
                minimumCompatibleVersion: "5.0.0",
                build: "6.0.0.400",
                scaleToFit: "none",
                centerStage: "none",
                resizeInstances: false,
                content: {
                    dom: [
                        {
                            preload: 'metadata',
                            rect: ['0px', '0px', '208px', '540px', 'auto', 'auto'],
                            source: ['data/media/Soraya_Crop4.mp4'],
                            id: 'Soraya_Crop4',
                            type: 'video',
                            tag: 'video'
                        }
                    ],
                    style: {
                        '${symbolSelector}': {
                            rect: [null, null, '208px', '540px']
                        }
                    }
                },
                timeline: {
                    duration: 7333,
                    autoPlay: true,
                    labels: {
                        "Soraya1": 0,
                        "Soraya2": 1667,
                        "Soraya3": 4333,
                        "Soraya4": 5833,
                        "Soraya5": 7333
                    },
                    data: [

                    ]
                }
            },
            "Z_btn_1": {
                version: "6.0.0",
                minimumCompatibleVersion: "5.0.0",
                build: "6.0.0.400",
                scaleToFit: "none",
                centerStage: "none",
                resizeInstances: false,
                content: {
                    dom: [
                        {
                            rect: ['0px', '0px', '240px', '20px', 'auto', 'auto'],
                            type: 'rect',
                            id: 'Rectangle',
                            stroke: [0, 'rgb(0, 0, 0)', 'none'],
                            cursor: 'pointer',
                            fill: ['rgba(192,192,192,1)']
                        },
                        {
                            type: 'text',
                            id: 'Text',
                            text: '<p style=\"margin: 0px;\">​No</p>',
                            rect: ['17px', '0px', 'auto', 'auto', 'auto', 'auto'],
                            font: ['Arial, Helvetica, sans-serif', [14, 'px'], 'rgba(0,0,0,1)', 'normal', 'none', '', 'break-word', 'nowrap']
                        },
                        {
                            rect: ['0px', '0px', '240px', '20px', 'auto', 'auto'],
                            type: 'rect',
                            id: 'clickable',
                            stroke: [0, 'rgb(0, 0, 0)', 'none'],
                            cursor: 'pointer',
                            fill: ['rgba(215,86,86,0.00)']
                        }
                    ],
                    style: {
                        '${symbolSelector}': {
                            overflow: 'hidden',
                            rect: [null, null, '240px', '20px']
                        }
                    }
                },
                timeline: {
                    duration: 0,
                    autoPlay: true,
                    data: [

                    ]
                }
            }
        };

    AdobeEdge.registerCompositionDefn(compId, symbols, fonts, scripts, resources, opts);

    if (!window.edge_authoring_mode) AdobeEdge.getComposition(compId).load("dist/js/ScenarioTemplate3_edgeActions.js");
})("EDGE-20743566");
