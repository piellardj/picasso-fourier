import { Parameters } from "./parameters";
import { interpolate, IPoint } from "./point";
import { SpaceUnit, TimeUnit } from "./units";

interface IFourierCoefficient {
    magnitude: number;
    phase: number;
    n: number;
}

const TWO_PI = 2 * Math.PI;

/**
 * Represents the Fourier development of a 1-periodic [0,1] -> RxR signal.
 * The 1D input is called Time (or t).
 * The 2D output is called Space.
 */
class FourierSeries {
    private readonly coefficients: IFourierCoefficient[];
    private readonly maxOrder: number;
    private readonly curveStepSize: SpaceUnit;

    private partialCurve: IPoint[];
    private partialCurveOrder: number;

    public constructor(coefficients: IFourierCoefficient[], totalLength: SpaceUnit) {
        if (coefficients.length % 2 !== 0) { // coefficients must go in pairs of 2: 0, 1, -1, 2, -2, ...
            coefficients.length--;
        }
        this.maxOrder = Math.max(0, 0.5 * (coefficients.length - 1));

        if (coefficients.length === 0) {
            throw new Error("Fourier series must have at least one coefficient.");
        }

        // Sort the coefs in that order: 0, 1, -1, 2, -2, 3, -3, ...
        coefficients.sort((a: IFourierCoefficient, b: IFourierCoefficient) => {
            const absA = Math.abs(a.n);
            const absB = Math.abs(b.n);
            if (absA !== absB) {
                return absA - absB;
            }
            return b.n - a.n;
        });
        this.coefficients = coefficients;

        this.partialCurve = [];
        this.curveStepSize = 1 / (Parameters.curvePrecision * totalLength);
    }

    public resetCurve(): void {
        this.partialCurve = [];
    }

    public drawCurve(context: CanvasRenderingContext2D, order: number, t: TimeUnit): void {
        const lastPointIndex = this.completeCurve(order, t);

        // Draw partial curve
        context.beginPath();
        context.moveTo(this.partialCurve[0].x, this.partialCurve[0].y);
        for (let i = 1; i < lastPointIndex; i++) {
            context.lineTo(this.partialCurve[i].x, this.partialCurve[i].y);
        }

        const f = lastPointIndex % 1;
        const lastPoint = this.partialCurve[Math.floor(lastPointIndex)];
        const nextPoint = this.partialCurve[Math.floor(lastPointIndex) + 1];

        const point = interpolate(lastPoint, nextPoint, f);
        context.lineTo(point.x, point.y);

        context.stroke();
        context.closePath();
    }

    public drawCurvePartialOrder(context: CanvasRenderingContext2D, order: number, t: TimeUnit): void {
        order = Math.min(order, this.maxOrder - 0.001);
        const f = order % 1;

        this.completeCurve(order, t);

        const additionalCoefficients = this.getCoefficients(Math.floor(order) + 1, Math.floor(order) + 1);

        context.beginPath();

        const nbSteps = t / this.curveStepSize;
        for (let i = 0; i < nbSteps; i++) {
            const localT = i * this.curveStepSize;
            const TWO_PI_T = TWO_PI * localT;

            let x = this.partialCurve[i].x;
            let y = this.partialCurve[i].y;

            for (const coefficient of additionalCoefficients) {
                const currentPhase = TWO_PI_T * coefficient.n + coefficient.phase;
                x += f * coefficient.magnitude * Math.cos(currentPhase);
                y += f * coefficient.magnitude * Math.sin(currentPhase);
            }

            if (i === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        }

        context.stroke();
        context.closePath();
    }

    /**
     * Draws the [0, t] portion of the approximated curve.
     * @param order Maximum Fourier order to use. Coefficients -order, -order+1, ..., 0, ..., +order will be used.
     * @param t Expected to be in [0, 1]
     */
    public drawPathToPoint(context: CanvasRenderingContext2D, order: number, t: TimeUnit): void {
        const constantCoefficient = this.getCoefficients(0, 0)[0];
        let x = constantCoefficient.magnitude * Math.cos(constantCoefficient.phase);
        let y = constantCoefficient.magnitude * Math.sin(constantCoefficient.phase);

        const TWO_PI_T = TWO_PI * t;

        context.beginPath();
        context.moveTo(x, y);

        const coefficients = this.getCoefficients(1, order);
        for (const coefficient of coefficients) {
            const currentPhase = TWO_PI_T * coefficient.n + coefficient.phase;
            x += coefficient.magnitude * Math.cos(currentPhase);
            y += coefficient.magnitude * Math.sin(currentPhase);

            context.lineTo(x, y);
        }

        context.stroke();
        context.closePath();
    }

    /**
     * Draws the circles representing the Fourier coefficients used to compute the point position at t.
     * @param order Maximum Fourier order to use. Coefficients -order, -order+1, ..., 0, ..., +order will be used.
     * @param t Expected to be in [0, 1]
     */
    public drawCircles(context: CanvasRenderingContext2D, order: number, t: TimeUnit): void {
        function drawCircle(centerX: number, centerY: number, radius: number): void {
            if (radius > 0.5) {
                context.beginPath();
                context.arc(centerX, centerY, radius, 0, TWO_PI);
                context.closePath();
                context.stroke();
            }
        }

        let x = 0;
        let y = 0;

        const coefficients = this.getCoefficients(0, order);
        if (coefficients.length < 2) {
            return;
        }

        const TWO_PI_T = TWO_PI * t;
        for (const coefficient of coefficients) {
            if (coefficient.n !== 0 && coefficient.n !== 1) {
                drawCircle(x, y, coefficient.magnitude);
            }

            const currentPhase = TWO_PI_T * coefficient.n + coefficient.phase;
            x += coefficient.magnitude * Math.cos(currentPhase);
            y += coefficient.magnitude * Math.sin(currentPhase);
        }
    }

    /**
     * Computes the partial curve between 0 and t in the given order.
     * The partial curve serves as cache and is as reused as possible.
     * Returns the index of the 't' point in the partial curve.
     * If this index is not an integer, it means an interpolation should be performed.
     */
    private completeCurve(order: number, t: TimeUnit): number {
        function completePoint(point: IPoint, coefficients: IFourierCoefficient[], localT: TimeUnit): void {
            const TWO_PI_T = TWO_PI * localT;
            for (const coefficient of coefficients) {
                const currentPhase = TWO_PI_T * coefficient.n + coefficient.phase;
                point.x += coefficient.magnitude * Math.cos(currentPhase);
                point.y += coefficient.magnitude * Math.sin(currentPhase);
            }
        }

        order = Math.floor(order);

        if (order < this.partialCurveOrder) {
            // Existing points are computed with too high order. Restart from scratch.
            this.resetCurve();
        } else if (order > this.partialCurveOrder) {
            // Existing points are computed with too low order. Complete existing points with missing orders.
            const missingCoefficients = this.getCoefficients(this.partialCurveOrder + 1, order);

            for (let i = 0; i < this.partialCurve.length; i++) {
                const localT = i * this.curveStepSize;
                completePoint(this.partialCurve[i], missingCoefficients, localT);
            }
        }

        // Compute new points if needed
        const currentPointIndex = t / this.curveStepSize;
        const nextPointIndex = Math.ceil(currentPointIndex);

        const neededCoefficients = this.getCoefficients(0, order);
        for (let i = this.partialCurve.length; i <= nextPointIndex + 1; i++) {
            const point: IPoint = { x: 0, y: 0 };
            completePoint(point, neededCoefficients, i * this.curveStepSize);
            this.partialCurve.push(point);
        }

        this.partialCurveOrder = order;
        return currentPointIndex;
    }

    /**
     * Returns an array of coefficients containing, in that order:
     * if orderFrom > 0: orderFrom, -orderFrom, orderFrom+1, -(orderFrom+1), ..., orderTo, -orderTo
     * if orderFrom == 0: 0, 1, -1, ... orderTo, -orderTo
     * If orderFrom > orderTo, or if one of the parameters is out of range, only returns the valid coefficients.
     */
    private getCoefficients(orderFrom: number, orderTo: number): IFourierCoefficient[] {
        orderFrom = Math.min(orderFrom, orderTo);

        const firstIndex = Math.max(0, 2 * orderFrom - 1);
        const lastIndex = Math.min(this.coefficients.length, 2 * orderTo + 1);

        return this.coefficients.slice(firstIndex, lastIndex);
    }
}

export {
    IFourierCoefficient,
    FourierSeries,
};
