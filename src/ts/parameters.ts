import { EPreset } from "./presets";

declare const Button: any;
// declare const Canvas: any;
declare const Checkbox: any;
declare const Controls: any;
// declare const FileControl: any;
declare const Picker: any;
declare const Range: any;
declare const Tabs: any;

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
};

enum EMode {
    INSTANT = "0",
    PROGRESSIVE = "1",
}

/* === OBSERVERS ====================================================== */
type GenericObserver = () => void;
type SpeedObserver = (previousSpeed: number) => void;

function callObservers(observersList: GenericObserver[]): void {
    for (const observer of observersList) {
        observer();
    }
}

const observers: {
    clear: GenericObserver[];
    redraw: GenericObserver[];
    speedChange: SpeedObserver[];
    presetChange: GenericObserver[];
} = {
    clear: [],
    redraw: [],
    speedChange: [],
    presetChange: [],
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
Picker.addObserver(controlId.PRESET, tryParsePreset);
tryParsePreset(Picker.getValue(controlId.PRESET));

let mode: EMode;
function parseAndApplyMode(newModes: string[]): void {
    if (newModes.length !== 1) {
        return;
    }

    const newMode = newModes[0] as EMode;
    if (newMode !== mode) {
        mode = newMode;

        const isInstant = (mode === EMode.INSTANT);
        Controls.setVisibility(controlId.SMOOTH, !isInstant);
        Controls.setVisibility(controlId.DISPLAY_CIRCLES, isInstant);
        Controls.setVisibility(controlId.DISPLAY_SEGMENTS, isInstant);
        Controls.setVisibility(controlId.DISPLAY_CURVE, isInstant);

        callObservers(observers.clear);
    }
}
parseAndApplyMode(Tabs.getValues(controlId.MODE));
Tabs.addObserver(controlId.MODE, parseAndApplyMode);

let speed: number = Range.getValue(controlId.SPEED);
Range.addObserver(controlId.SPEED, (s: number) => {
    const previous = speed;
    speed = s;

    for (const observer of observers.speedChange) {
        observer(previous);
    }
});

let persistence: boolean = Checkbox.isChecked(controlId.PERSISTENCE);
Checkbox.addObserver(controlId.PERSISTENCE, (checked: boolean) => {
    persistence = checked;
});

let smooth: boolean = Checkbox.isChecked(controlId.SMOOTH);
Checkbox.addObserver(controlId.SMOOTH, (checked: boolean) => {
    smooth = checked;
});

let closeLoop: boolean = Checkbox.isChecked(controlId.CLOSE_LOOP);
Checkbox.addObserver(controlId.CLOSE_LOOP, (checked: boolean) => {
    closeLoop = checked;

    if (mode === EMode.PROGRESSIVE) {
        callObservers(observers.clear);
    }
});

let repeat: boolean = Checkbox.isChecked(controlId.REPEAT);
Checkbox.addObserver(controlId.REPEAT, (checked: boolean) => {
    repeat = checked;
});

Button.addObserver(controlId.RESET, () => callObservers(observers.clear));

let displayCircles: boolean = Checkbox.isChecked(controlId.DISPLAY_CIRCLES);
Checkbox.addObserver(controlId.DISPLAY_CIRCLES, (checked: boolean) => {
    displayCircles = checked;
    callObservers(observers.redraw);
});

let displaySegments: boolean = Checkbox.isChecked(controlId.DISPLAY_SEGMENTS);
Checkbox.addObserver(controlId.DISPLAY_SEGMENTS, (checked: boolean) => {
    displaySegments = checked;
    callObservers(observers.redraw);
});

let displayCurve: boolean = Checkbox.isChecked(controlId.DISPLAY_CURVE);
Checkbox.addObserver(controlId.DISPLAY_CURVE, (checked: boolean) => {
    displayCurve = checked;
    callObservers(observers.redraw);
});

let displayOriginalCurve: boolean = Checkbox.isChecked(controlId.DISPLAY_ORIGINAL_CURVE);
Checkbox.addObserver(controlId.DISPLAY_ORIGINAL_CURVE, (checked: boolean) => {
    displayOriginalCurve = checked;
    callObservers(observers.redraw);
});

let order: number = Range.getValue(controlId.ORDER);
Range.addObserver(controlId.ORDER, (o: number) => {
    order = o;
    callObservers(observers.clear);
});

/* === INTERFACE ====================================================== */
/**
 * Class giving access to all the parameters of the application. Also gives access to event handlers.
 */
class Parameters {
    public static get preset(): EPreset {
        return preset;
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
    public static get speedChangeObservers(): SpeedObserver[] {
        return observers.speedChange;
    }
    public static get presetObservers(): GenericObserver[] {
        return observers.presetChange;
    }

    private constructor() {}
}

export {
    Parameters,
};
