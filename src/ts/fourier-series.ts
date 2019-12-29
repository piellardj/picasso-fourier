import { Parameters } from "./parameters";
import { IPoint } from "./point";
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
        this.coefficients = coefficients;

        this.partialCurve = [];
        this.curveStepSize = 1 / (Parameters.curvePrecision * totalLength);
    }

    public resetCurve(): void {
        this.partialCurve = [];
    }

    public drawCurve(context: CanvasRenderingContext2D, order: number, t: TimeUnit): void {
        if (order !== this.partialCurveOrder) {
            this.partialCurveOrder = order;
            this.resetCurve();
        }

        // Compute partial curve
        const currentPointIndex = t / this.curveStepSize;
        const lastConsolidatedPointIndex = Math.floor(currentPointIndex);
        const nextConsolidatedPointIndex = Math.ceil(currentPointIndex);
        let point: IPoint;

        for (let i = this.partialCurve.length; i <= lastConsolidatedPointIndex; i++) {
            point = this.computePoint(order, i * this.curveStepSize);
            this.partialCurve.push(point);
        }

        // Draw partial curve
        context.beginPath();
        context.moveTo(this.partialCurve[0].x, this.partialCurve[0].y);
        for (let i = 1; i < nextConsolidatedPointIndex; i++) {
            context.lineTo(this.partialCurve[i].x, this.partialCurve[i].y);
        }

        point = this.computePoint(order, t);
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
        const max = this.computeAmountOfCoefficients(order);
        if (max <= 0) {
            return;
        }

        let x = this.coefficients[0].magnitude * Math.cos(this.coefficients[0].phase);
        let y = this.coefficients[0].magnitude * Math.sin(this.coefficients[0].phase);

        const TWO_PI_T = TWO_PI * t;

        context.beginPath();
        context.moveTo(x, y);

        for (let i = 1; i < max; i++) {
            const coefficient = this.coefficients[i];
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
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, TWO_PI);
            context.closePath();
            context.stroke();
        }

        const max = this.computeAmountOfCoefficients(order);
        if (max < 2) {
            return;
        }

        const TWO_PI_T = TWO_PI * t;

        let x = 0;
        let y = 0;

        for (let i = 0; i < max; i++) {
            const coefficient = this.coefficients[i];

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

        const max = this.computeAmountOfCoefficients(order);
        for (let i = 0; i < max; i++) {
            const coefficient = this.coefficients[i];
            const TWO_PI_N_T = TWO_PI * coefficient.n * t;
            x += coefficient.magnitude * Math.cos(TWO_PI_N_T + coefficient.phase);
            y += coefficient.magnitude * Math.sin(TWO_PI_N_T + coefficient.phase);
        }

        return { x, y };
    }

    private computePointPartialOrder(order: number, t: number): IPoint {
        let x = 0;
        let y = 0;

        const floor = this.computeAmountOfCoefficients(Math.floor(order));
        for (let i = 0; i < floor; i++) {
            const coefficient = this.coefficients[i];
            const TWO_PI_N_T = TWO_PI * coefficient.n * t;
            x += coefficient.magnitude * Math.cos(TWO_PI_N_T + coefficient.phase);
            y += coefficient.magnitude * Math.sin(TWO_PI_N_T + coefficient.phase);
        }

        const f = order % 1;
        for (let i = 0; i < 2; i++) {
            const coefficient = this.coefficients[floor + i];
            const TWO_PI_N_T = TWO_PI * coefficient.n * t;
            x += f * coefficient.magnitude * Math.cos(TWO_PI_N_T + coefficient.phase);
            y += f * coefficient.magnitude * Math.sin(TWO_PI_N_T + coefficient.phase);
        }

        return {x, y};
    }

    private computeAmountOfCoefficients(order: number): number {
        return Math.min(this.coefficients.length, 1 + 2 * order);
    }
}

export {
    IFourierCoefficient,
    FourierSeries,
};
