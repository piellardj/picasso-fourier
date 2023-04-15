import * as fs from "fs";
import * as path from "path";
import { Demopage } from "webpage-templates";

const data = {
    title: "Picasso - Fourier",
    description: "Picasso's iconic single line drawings analyzed by Fourier Transform.",
    introduction: [
        "The Fourier Transform is a mathematical process that breaks a complex signal into a sum of sines and cosines, which can be represented as rotating circles. The more circles are used, the more precise the approximation is.",
        "This project uses this tool to analyze some of Picasso's single line drawings. I picked sketches mostly from his iconic animals series, as well as his take on the traditional Arlequin character.",
        "You can try to be your own Picasso by drawing on the canvas."
    ],
    githubProjectName: "picasso-fourier",
    readme: {
        filepath: path.join(__dirname, "..", "README.md"),
        branchName: "master"
    },
    additionalLinks: [],
    scriptFiles: [
        "script/main.min.js"
    ],
    indicators: [
        {
            id: "fourier-order",
            label: "Approximation order"
        }
    ],
    canvas: {
        width: 512,
        height: 512,
        enableFullscreen: true
    },
    controlsSections: [
        {
            title: "Input",
            controls: [
                {
                    type: Demopage.supportedControls.Picker,
                    title: "Drawing",
                    id: "preset-picker-id",
                    placeholder: "Custom",
                    options: [
                        {
                            value: "arlequin1",
                            label: "Arlequin 1",
                            checked: true
                        },
                        {
                            value: "bull",
                            label: "Bull"
                        },
                        {
                            value: "arlequin2",
                            label: "Arlequin 2"
                        },
                        {
                            value: "mouse",
                            label: "Mouse"
                        },
                        {
                            value: "camel",
                            label: "Camel"
                        },
                        {
                            value: "woman1",
                            label: "Woman 1"
                        },
                        {
                            value: "penguin",
                            label: "Penguin"
                        },
                        {
                            value: "dove",
                            label: "Dove"
                        },
                        {
                            value: "flamingo",
                            label: "Flamingo"
                        },
                        {
                            value: "horse",
                            label: "Horse"
                        },
                        {
                            value: "dog",
                            label: "Dog"
                        },
                        {
                            value: "woman2",
                            label: "Woman 2"
                        }
                    ]
                }
            ]
        },
        {
            title: "Animation",
            controls: [
                {
                    type: Demopage.supportedControls.Tabs,
                    title: "Mode",
                    id: "mode-picker-id",
                    unique: true,
                    options: [
                        {
                            value: "0",
                            label: "Draw",
                            checked: true
                        },
                        {
                            value: "1",
                            label: "Progressive"
                        }
                    ]
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Speed",
                    id: "speed-range-id",
                    min: 0,
                    max: 1,
                    value: 0.1,
                    step: 0.01
                },
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Persistence",
                    id: "persistence-checkbox-id",
                    checked: false
                },
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Smooth",
                    id: "smooth-checkbox-id",
                    checked: true
                },
                {
                    title: "Close loop",
                    type: Demopage.supportedControls.Checkbox,
                    id: "close-loop-checkbox-id",
                    checked: false
                },
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Repeat",
                    id: "loop-checkbox-id",
                    checked: false
                },
                {
                    type: Demopage.supportedControls.Button,
                    id: "reset-button-id",
                    label: "Reset",
                    flat: true
                }
            ]
        },
        {
            title: "Display",
            controls: [
                {
                    type: Demopage.supportedControls.Range,
                    title: "Fourier order",
                    id: "order-range-id",
                    min: 1,
                    max: 300,
                    value: 100,
                    step: 1
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Zoom",
                    id: "zoom-range-id",
                    min: 1,
                    max: 50,
                    value: 1,
                    step: 0.01
                },
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Circles",
                    id: "circles-checkbox-id",
                    checked: true
                },
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Segments",
                    id: "segments-checkbox-id",
                    checked: true
                },
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Curve",
                    id: "curve-checkbox-id",
                    checked: true
                },
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Original curve",
                    id: "original-curve-checkbox-id",
                    checked: false
                },
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Indicator",
                    id: "indicator-checkbox-id",
                    checked: true
                },
                {
                    type: Demopage.supportedControls.FileDownload,
                    id: "download-button-id",
                    label: "Download",
                    flat: true
                }
            ]
        }
    ]
};

const DEST_DIR = path.resolve(__dirname, "..", "docs");
const minified = true;

const buildResult = Demopage.build(data, DEST_DIR, {
    debug: !minified,
});

// disable linting on this file because it is generated
buildResult.pageScriptDeclaration = "/* tslint:disable */\n" + buildResult.pageScriptDeclaration;

const SCRIPT_DECLARATION_FILEPATH = path.resolve(__dirname, ".", "ts", "page-interface-generated.ts");
fs.writeFileSync(SCRIPT_DECLARATION_FILEPATH, buildResult.pageScriptDeclaration);
