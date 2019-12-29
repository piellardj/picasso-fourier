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

    private readonly curveStepSize: SpaceUnit;
    private partialCurve: IPoint[];
    private partialCurveOrder: number;

    public constructor(coefficients: IFourierCoefficient[], totalLength: SpaceUnit) {
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
        this.completeCurve(order, t);

        const currentPointIndex = t / this.curveStepSize;
        const lastConsolidatedPointIndex = Math.floor(currentPointIndex);

        // Draw partial curve
        context.beginPath();
        context.moveTo(this.partialCurve[0].x, this.partialCurve[0].y);
        for (let i = 1; i <= lastConsolidatedPointIndex; i++) {
            context.lineTo(this.partialCurve[i].x, this.partialCurve[i].y);
        }

        const f = currentPointIndex % 1;
        const lastPoint = this.partialCurve[lastConsolidatedPointIndex];
        const nextPoint = this.partialCurve[lastConsolidatedPointIndex + 1];

        const point = interpolate(lastPoint, nextPoint, f);
        context.lineTo(point.x, point.y);

        context.stroke();
        context.closePath();
    }

    public drawCurvePartialOrder(context: CanvasRenderingContext2D, order: number, t: TimeUnit): void {
        order = Math.min(order, 0.5 * (this.coefficients.length - 1) - 0.001);

        context.beginPath();

        const firstPoint = this.computePointPartialOrder(order, 0);
        context.moveTo(firstPoint.x, firstPoint.y);

        const nbSteps = t / this.curveStepSize;
        for (let i = 1; i < nbSteps; i++) {
            const p = this.computePointPartialOrder(order, i * this.curveStepSize);
            context.lineTo(p.x, p.y);
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
            const TWO_PI_N_T = TWO_PI_T * coefficient.n;
            x += coefficient.magnitude * Math.cos(TWO_PI_N_T + coefficient.phase);
            y += coefficient.magnitude * Math.sin(TWO_PI_N_T + coefficient.phase);

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

            const TWO_PI_N_T = TWO_PI_T * coefficient.n;
            x += coefficient.magnitude * Math.cos(TWO_PI_N_T + coefficient.phase);
            y += coefficient.magnitude * Math.sin(TWO_PI_N_T + coefficient.phase);
        }
    }

    private completeCurve(order: number, t: TimeUnit): void {
        order = Math.floor(order);

        if (order !== this.partialCurveOrder) {
            this.partialCurveOrder = order;
            this.resetCurve();
        }

        // Compute partial curve
        const currentPointIndex = t / this.curveStepSize;
        const lastPointIndex = Math.floor(currentPointIndex);
        let point: IPoint;

        for (let i = this.partialCurve.length; i <= lastPointIndex + 1; i++) {
            point = this.computePoint(order, i * this.curveStepSize);
            this.partialCurve.push(point);
        }
    }

    /* Assumes t is between 0 and 1 included. */
    private computePoint(order: number, t: number): IPoint {
        let x = 0;
        let y = 0;

        const coefficients = this.getCoefficients(0, order);
        for (const coefficient of coefficients) {
            const TWO_PI_N_T = TWO_PI * coefficient.n * t;
            x += coefficient.magnitude * Math.cos(TWO_PI_N_T + coefficient.phase);
            y += coefficient.magnitude * Math.sin(TWO_PI_N_T + coefficient.phase);
        }

        return { x, y };
    }

    private computePointPartialOrder(order: number, t: number): IPoint {
        let x = 0;
        let y = 0;

        const coefficients = this.getCoefficients(0, Math.floor(order));
        for (const coefficient of coefficients) {
            const TWO_PI_N_T = TWO_PI * coefficient.n * t;
            x += coefficient.magnitude * Math.cos(TWO_PI_N_T + coefficient.phase);
            y += coefficient.magnitude * Math.sin(TWO_PI_N_T + coefficient.phase);
        }

        const additionalCoefficients = this.getCoefficients(Math.floor(order) + 1, Math.floor(order) + 1);
        const f = order % 1;
        for (const coefficient of additionalCoefficients) {
            const TWO_PI_N_T = TWO_PI * coefficient.n * t;
            x += f * coefficient.magnitude * Math.cos(TWO_PI_N_T + coefficient.phase);
            y += f * coefficient.magnitude * Math.sin(TWO_PI_N_T + coefficient.phase);
        }

        return { x, y };
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
