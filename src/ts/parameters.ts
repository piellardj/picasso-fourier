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
    DISPLAY_CIRCLES: "circles-checkbox-id",
    DISPLAY_SEGMENTS: "segments-checkbox-id",
    DISPLAY_CURVE: "curve-checkbox-id",
    ORDER: "order-range-id",
};

/* === OBSERVERS ====================================================== */
type GenericObserver = () => void;

function callObservers(observersList: any[]): void {
    for (const observer of observersList) {
        observer();
    }
}

const observers: {
    clear: GenericObserver[];
} = {
    clear: [],
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

    public static get order(): number {
        return order;
    }
    public static set order(o: number) {
        order = o;
        Range.setValue(controlId.ORDER, o);
    }

    public static get clearObservers(): GenericObserver[] {
        return observers.clear;
    }

    private constructor() {}
}

/* === EVENTS BINDING ================================================= */

/* --- PARAMETERS ----------------------------------------------------- */
let speed: number = Range.getValue(controlId.SPEED);
Range.addObserver(controlId.SPEED, (s: number) => {
    speed = s;
});

let displayCircles: boolean = Checkbox.isChecked(controlId.DISPLAY_CIRCLES);
Checkbox.addObserver(controlId.DISPLAY_CIRCLES, (checked: boolean) => {
    displayCircles = checked;
});

let displaySegments: boolean = Checkbox.isChecked(controlId.DISPLAY_SEGMENTS);
Checkbox.addObserver(controlId.DISPLAY_SEGMENTS, (checked: boolean) => {
    displaySegments = checked;
});

let displayCurve: boolean = Checkbox.isChecked(controlId.DISPLAY_CURVE);
Checkbox.addObserver(controlId.DISPLAY_CURVE, (checked: boolean) => {
    displayCurve = checked;
});

let order: number = Range.getValue(controlId.ORDER);
Range.addObserver(controlId.ORDER, (o: number) => {
    order = o;
    callObservers(observers.clear);
});

export {
    Parameters,
};
