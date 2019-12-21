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
} = {
    clear: [],
    redraw: [],
    speedChange: [],
};

/* === INTERFACE ====================================================== */
class Parameters {
    public static get speed(): number {
        return speed;
    }
    public static set speed(s: number) {
        speed = s;
        Range.setValue(controlId.SPEED, s);
    }

    public static get loop(): boolean {
        return loop;
    }
    public static set loop(l: boolean) {
        if (loop !== l) {
            loop = l;
            Checkbox.setChecked(controlId.LOOP, l);
        }
    }

    public static get displayCircles(): boolean {
        return displayCircles;
    }
    public static set displayCircles(display: boolean) {
        if (displayCircles !== display) {
            displayCircles = display;
            Checkbox.setChecked(controlId.DISPLAY_CIRCLES, display);
        }
    }

    public static get displaySegments(): boolean {
        return displaySegments;
    }
    public static set displaySegments(display: boolean) {
        if (displaySegments !== display) {
            displaySegments = display;
            Checkbox.setChecked(controlId.DISPLAY_SEGMENTS, display);
        }
    }

    public static get displayCurve(): boolean {
        return displayCurve;
    }
    public static set displayCurve(display: boolean) {
        if (displayCurve !== display) {
            displayCurve = display;
            Checkbox.setChecked(controlId.DISPLAY_CURVE, display);
        }
    }

    public static get displayOriginalCurve(): boolean {
        return displayOriginalCurve;
    }
    public static set displayOriginalCurve(display: boolean) {
        if (displayOriginalCurve !== display) {
            displayOriginalCurve = display;
            Checkbox.setChecked(controlId.DISPLAY_ORIGINAL_CURVE, display);
        }
    }

    public static get order(): number {
        return order;
    }
    public static set order(o: number) {
        order = o;
        Range.setValue(controlId.ORDER, o);
    }

    public static get integrationPrecision(): number {
        const integrationStepSize = 1; // one space-unit per integration step
        return 1 / integrationStepSize;
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

    private constructor() {}
}

/* === EVENTS BINDING ================================================= */

/* --- PARAMETERS ----------------------------------------------------- */
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
