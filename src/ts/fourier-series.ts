import { Parameters } from "./parameters";
import IPoint from "./point";

interface IFourierCoefficient {
    magnitude: number;
    phase: number;
    n: number;
}

const TWO_PI = 2 * Math.PI;

class FourierSeries {
    private readonly _coefficients: IFourierCoefficient[];
    private readonly _length: number;

    private _partialCurve: IPoint[];
    private _partialCurveOrder: number;
    private _partialCurveStepSize: number;

    public constructor(coefficients: IFourierCoefficient[], length: number, pathLength: number) {
        this._coefficients = coefficients;
        this._length = length;

        this._partialCurve = [];
        this._partialCurveStepSize = length / (Parameters.curvePrecision * pathLength);
    }

    public resetCurve(): void {
        this._partialCurve = [];
    }

    public drawCurve(context: CanvasRenderingContext2D, order: number, t: number): void {
        t = Math.min(1, Math.max(0, t));

        if (order !== this._partialCurveOrder) {
            this._partialCurveOrder = order;
            this.resetCurve();
        }

        // Compute partial curve
        const currentPointIndex = t / this._partialCurveStepSize;
        const lastConsolidatedPointIndex = Math.floor(currentPointIndex);
        const nextConsolidatedPointIndex = Math.ceil(currentPointIndex);
        let point: IPoint;

        for (let i = this._partialCurve.length; i <= lastConsolidatedPointIndex; i++) {
            point = this.computePoint(order, i * this._partialCurveStepSize);
            this._partialCurve.push(point);
        }

        // Draw partial curve
        context.beginPath();
        context.moveTo(this._partialCurve[0].x, this._partialCurve[0].y);
        for (let i = 1; i < nextConsolidatedPointIndex; i++) {
            context.lineTo(this._partialCurve[i].x, this._partialCurve[i].y);
        }

        point = this.computePoint(order, t);
        context.lineTo(point.x, point.y);

        context.stroke();
        context.closePath();
    }

    public drawPathToPoint(context: CanvasRenderingContext2D, order: number, t: number): void {
        const max = this.computeAmountOfCoefficients(order);
        if (max <= 0) {
            return;
        }

        let x = this._coefficients[0].magnitude * Math.cos(this._coefficients[0].phase);
        let y = this._coefficients[0].magnitude * Math.sin(this._coefficients[0].phase);

        const TWO_PI_T = TWO_PI * this.computeRealT(t);

        context.beginPath();
        context.moveTo(x, y);

        for (let i = 1; i < max; i++) {
            const coefficient = this._coefficients[i];
            const TWO_PI_N_T = TWO_PI_T * coefficient.n;
            x += coefficient.magnitude * Math.cos(TWO_PI_N_T + coefficient.phase);
            y += coefficient.magnitude * Math.sin(TWO_PI_N_T + coefficient.phase);

            context.lineTo(x, y);
        }

        context.stroke();
        context.closePath();
    }

    public drawCircles(context: CanvasRenderingContext2D, order: number, t: number): void {
        function drawCircle(centerX: number, centerY: number, radius: number) {
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, TWO_PI);
            context.closePath();
            context.stroke();
        }

        const max = this.computeAmountOfCoefficients(order);
        if (max < 2) {
            return;
        }

        const TWO_PI_T = TWO_PI * this.computeRealT(t);

        let x = 0;
        let y = 0;

        for (let i = 0; i < max; i++) {
            const coefficient = this._coefficients[i];

            if (i > 1) {
                drawCircle(x, y, coefficient.magnitude);
            }

            const TWO_PI_N_T = TWO_PI_T * coefficient.n;
            x += coefficient.magnitude * Math.cos(TWO_PI_N_T + coefficient.phase);
            y += coefficient.magnitude * Math.sin(TWO_PI_N_T + coefficient.phase);
        }
    }

    /* Assumes t is between 0 and 1 included. */
    private computePoint(order: number, t: number): IPoint {
        let x = 0;
        let y = 0;

        t = this.computeRealT(t);

        const max = this.computeAmountOfCoefficients(order);
        for (let i = 0; i < max; i++) {
            const coefficient = this._coefficients[i];
            const TWO_PI_N_T = TWO_PI * coefficient.n * t;
            x += coefficient.magnitude * Math.cos(TWO_PI_N_T + coefficient.phase);
            y += coefficient.magnitude * Math.sin(TWO_PI_N_T + coefficient.phase);
        }

        return { x, y };
    }

    private computeAmountOfCoefficients(order: number): number {
        return Math.min(this._coefficients.length, 1 + 2 * order);
    }

    private computeRealT(t: number): number {
        t = Math.min(1, Math.max(0, t));

        if (Parameters.closeLoop) {
            return t;
        }
        return t * this._length;
    }
}

export {
    IFourierCoefficient,
    FourierSeries,
};
