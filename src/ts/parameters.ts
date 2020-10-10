import { EPreset } from "./presets";

import "./page-interface-generated";

/* === IDs ============================================================ */
const controlId = {
    PRESET: "preset-picker-id",
    MODE: "mode-picker-id",
    SPEED: "speed-range-id",
    PERSISTENCE: "persistence-checkbox-id",
    SMOOTH: "smooth-checkbox-id",
    CLOSE_LOOP: "close-loop-checkbox-id",
    REPEAT: "loop-checkbox-id",
    RESET: "reset-button-id",
    DISPLAY_CIRCLES: "circles-checkbox-id",
    DISPLAY_SEGMENTS: "segments-checkbox-id",
    DISPLAY_CURVE: "curve-checkbox-id",
    DISPLAY_ORIGINAL_CURVE: "original-curve-checkbox-id",
    ORDER: "order-range-id",
    ZOOM: "zoom-range-id",
    INDICATOR: "indicator-checkbox-id",
    DOWNLOAD: "download-button-id",
};

enum EMode {
    INSTANT = "0",
    PROGRESSIVE = "1",
}

/* === OBSERVERS ====================================================== */
type GenericObserver = () => void;

function callObservers(observersList: GenericObserver[]): void {
    for (const observer of observersList) {
        observer();
    }
}

const observers: {
    clear: GenericObserver[];
    redraw: GenericObserver[];
    speedChange: GenericObserver[];
    presetChange: GenericObserver[];
    download: GenericObserver[];
} = {
    clear: [],
    redraw: [],
    speedChange: [],
    presetChange: [],
    download: [],
};

/* === EVENTS BINDING ================================================= */

/* --- PARAMETERS ----------------------------------------------------- */
let preset: EPreset;
function tryParsePreset(p: string): void {
    const previousValue = preset;
    preset = p as EPreset;

    if (preset !== previousValue) {
        callObservers(observers.presetChange);
    }
}
Page.Picker.addObserver(controlId.PRESET, tryParsePreset);
tryParsePreset(Page.Picker.getValue(controlId.PRESET));

let mode: EMode;
function parseAndApplyMode(newModes: string[]): void {
    if (newModes.length !== 1) {
        return;
    }

    const newMode = newModes[0] as EMode;
    if (newMode !== mode) {
        mode = newMode;

        const isInstant = (mode === EMode.INSTANT);
        Page.Controls.setVisibility(controlId.SMOOTH, !isInstant);
        Page.Controls.setVisibility(controlId.DISPLAY_CIRCLES, isInstant);
        Page.Controls.setVisibility(controlId.DISPLAY_SEGMENTS, isInstant);
        Page.Controls.setVisibility(controlId.DISPLAY_CURVE, isInstant);
        Page.Controls.setVisibility(controlId.ZOOM, isInstant);

        callObservers(observers.clear);
    }
}
parseAndApplyMode(Page.Tabs.getValues(controlId.MODE));
Page.Tabs.addObserver(controlId.MODE, parseAndApplyMode);

let speed: number = Page.Range.getValue(controlId.SPEED);
Page.Range.addObserver(controlId.SPEED, (s: number) => {
    speed = s;
    callObservers(observers.speedChange);
});

let persistence: boolean = Page.Checkbox.isChecked(controlId.PERSISTENCE);
Page.Checkbox.addObserver(controlId.PERSISTENCE, (checked: boolean) => {
    persistence = checked;
});

let smooth: boolean = Page.Checkbox.isChecked(controlId.SMOOTH);
Page.Checkbox.addObserver(controlId.SMOOTH, (checked: boolean) => {
    smooth = checked;
});

let closeLoop: boolean = Page.Checkbox.isChecked(controlId.CLOSE_LOOP);
Page.Checkbox.addObserver(controlId.CLOSE_LOOP, (checked: boolean) => {
    closeLoop = checked;

    if (mode === EMode.PROGRESSIVE) {
        callObservers(observers.clear);
    }
});

let repeat: boolean = Page.Checkbox.isChecked(controlId.REPEAT);
Page.Checkbox.addObserver(controlId.REPEAT, (checked: boolean) => {
    repeat = checked;
});

Page.Button.addObserver(controlId.RESET, () => callObservers(observers.clear));

let displayCircles: boolean = Page.Checkbox.isChecked(controlId.DISPLAY_CIRCLES);
Page.Checkbox.addObserver(controlId.DISPLAY_CIRCLES, (checked: boolean) => {
    displayCircles = checked;
    callObservers(observers.redraw);
});

let displaySegments: boolean = Page.Checkbox.isChecked(controlId.DISPLAY_SEGMENTS);
Page.Checkbox.addObserver(controlId.DISPLAY_SEGMENTS, (checked: boolean) => {
    displaySegments = checked;
    callObservers(observers.redraw);
});

let displayCurve: boolean = Page.Checkbox.isChecked(controlId.DISPLAY_CURVE);
Page.Checkbox.addObserver(controlId.DISPLAY_CURVE, (checked: boolean) => {
    displayCurve = checked;
    callObservers(observers.redraw);
});

let displayOriginalCurve: boolean = Page.Checkbox.isChecked(controlId.DISPLAY_ORIGINAL_CURVE);
Page.Checkbox.addObserver(controlId.DISPLAY_ORIGINAL_CURVE, (checked: boolean) => {
    displayOriginalCurve = checked;
    callObservers(observers.redraw);
});

let order: number = Page.Range.getValue(controlId.ORDER);
Page.Range.addObserver(controlId.ORDER, (o: number) => {
    order = o;
    callObservers(observers.clear);
});

let zoom: number = Page.Range.getValue(controlId.ZOOM);
function updateZoom(z: number): void {
    zoom = z;
    callObservers(observers.redraw);
    callObservers(observers.speedChange);
}
Page.Range.addObserver(controlId.ZOOM, updateZoom);
Page.Canvas.Observers.mouseWheel.push((delta: number) => {
    const rawNewZoom = zoom * (1 + 0.1 * delta);
    console.log(`${zoom}  -  ${rawNewZoom}`);
    Page.Range.setValue(controlId.ZOOM, rawNewZoom);
    updateZoom(Page.Range.getValue(controlId.ZOOM));
    console.log(Page.Range.getValue(controlId.ZOOM));
});

function updateIndicatorVisibility(): void {
    const visible = Page.Checkbox.isChecked(controlId.INDICATOR);
    Page.Canvas.setIndicatorsVisibility(visible);
}
updateIndicatorVisibility();
Page.Checkbox.addObserver(controlId.INDICATOR, updateIndicatorVisibility);

Page.FileControl.addDownloadObserver(controlId.DOWNLOAD, () => callObservers(observers.download));

/* === INTERFACE ====================================================== */
/**
 * Class giving access to all the parameters of the application. Also gives access to event handlers.
 */
class Parameters {
    public static get preset(): EPreset {
        return preset;
    }
    public static setCustomPreset(): void {
        Page.Picker.setValue(controlId.PRESET, null);
        preset = EPreset.CUSTOM;
        callObservers(observers.presetChange);
    }

    public static get isProgressiveMode(): boolean {
        return mode === EMode.PROGRESSIVE;
    }

    public static get speed(): number {
        if (this.isProgressiveMode) {
            return 0.1 * speed;
        }
        return speed;
    }

    public static get persistence(): boolean {
        return persistence;
    }

    public static get smooth(): boolean {
        return smooth;
    }

    public static get closeLoop(): boolean {
        return closeLoop;
    }

    public static get repeat(): boolean {
        return repeat;
    }

    public static get displayCircles(): boolean {
        return mode === EMode.INSTANT && displayCircles;
    }

    public static get displaySegments(): boolean {
        return mode === EMode.INSTANT && displaySegments;
    }

    public static get displayCurve(): boolean {
        return mode === EMode.INSTANT && displayCurve;
    }

    public static get displayOriginalCurve(): boolean {
        return displayOriginalCurve;
    }

    public static get order(): number {
        return order;
    }

    public static get zoom(): number {
        return zoom;
    }
    public static resetZoom(): void {
        zoom = 1;
        Page.Range.setValue(controlId.ZOOM, zoom);
    }

    public static get integrationPrecision(): number {
        const integrationStepSize = 1; // one space-unit per integration step
        return 1 / integrationStepSize;
    }

    public static get curvePrecision(): number {
        const stepSize = 2; // sampling every two space-units
        return 1 / stepSize;
    }

    public static get clearObservers(): GenericObserver[] {
        return observers.clear;
    }
    public static get redrawObservers(): GenericObserver[] {
        return observers.redraw;
    }
    public static get speedChangeObservers(): GenericObserver[] {
        return observers.speedChange;
    }
    public static get presetObservers(): GenericObserver[] {
        return observers.presetChange;
    }
    public static get downloadObservers(): GenericObserver[] {
        return observers.download;
    }

    private constructor() { }
}

export {
    Parameters,
};
