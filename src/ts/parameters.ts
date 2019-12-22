import { EPreset } from "./presets";

declare const Button: any;
declare const Canvas: any;
declare const Checkbox: any;
declare const Controls: any;
declare const FileControl: any;
declare const Picker: any;
declare const Range: any;
declare const Tabs: any;

/* === IDs ============================================================ */
const controlId = {
    PRESET: "preset-picker-id",
    SPEED: "speed-range-id",
    LOOP: "loop-checkbox-id",
    RESET: "reset-button-id",
    DISPLAY_CIRCLES: "circles-checkbox-id",
    DISPLAY_SEGMENTS: "segments-checkbox-id",
    DISPLAY_CURVE: "curve-checkbox-id",
    DISPLAY_ORIGINAL_CURVE: "original-curve-checkbox-id",
    ORDER: "order-range-id",
};

/* === OBSERVERS ====================================================== */
type GenericObserver = () => void;
type SpeedObserver = (previousSpeed: number) => void;

function callObservers(observersList: any[]): void {
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

/* === INTERFACE ====================================================== */
class Parameters {
    public static get preset(): EPreset {
        return preset;
    }

    public static get speed(): number {
        return speed;
    }

    public static get loop(): boolean {
        return loop;
    }

    public static get displayCircles(): boolean {
        return displayCircles;
    }

    public static get displaySegments(): boolean {
        return displaySegments;
    }

    public static get displayCurve(): boolean {
        return displayCurve;
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

/* === EVENTS BINDING ================================================= */

/* --- PARAMETERS ----------------------------------------------------- */
let preset: EPreset;
function tryParsePreset(p: string): void {
    const previousValue = preset;

    if (p === "arlequin") {
        preset = EPreset.ARLEQUIN;
    } else if (p === "dog") {
        preset = EPreset.DOG;
    } else if (p === "triangle") {
        preset = EPreset.TRIANGLE;
    } else if (p === "round") {
        preset = EPreset.ROUND;
    }

    if (preset !== previousValue) {
        callObservers(observers.presetChange);
    }
}
Picker.addObserver(controlId.PRESET, tryParsePreset);
tryParsePreset(Picker.getValue(controlId.PRESET));

let speed: number = Range.getValue(controlId.SPEED);
Range.addObserver(controlId.SPEED, (s: number) => {
    const previous = speed;
    speed = s;

    for (const observer of observers.speedChange) {
        observer(previous);
    }
});

let loop: boolean = Checkbox.isChecked(controlId.LOOP);
Checkbox.addObserver(controlId.LOOP, (checked: boolean) => {
    loop = checked;
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

export {
    Parameters,
};
