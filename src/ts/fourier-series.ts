import Point from "./point";

type FourierCoefficient = {
    magnitude: number;
    phase: number;
    n: number;
}

const TWO_PI = 2 * Math.PI;

class FourierSeries {
    private readonly _coefficients: FourierCoefficient[];

    public constructor(coefficients: FourierCoefficient[]) {
        this._coefficients = coefficients;
    }

    /* Assumes t is between 0 and 1 included. */
    public computePoint(t: number): Point {
        let x = 0, y = 0;

        for (const coefficient of this._coefficients) {
            const TWO_PI_N_T = TWO_PI * coefficient.n * t;
            x += coefficient.magnitude * Math.cos(TWO_PI_N_T + coefficient.phase);
            y += coefficient.magnitude * Math.sin(TWO_PI_N_T + coefficient.phase);
        }

        return { x, y };
    }

    public drawPathToPoint(context: CanvasRenderingContext2D, t: number): void {
        let x = 0, y = 0;
        context.beginPath();
        context.moveTo(x, y);

        for (const coefficient of this._coefficients) {
            const TWO_PI_N_T = TWO_PI * coefficient.n * t;
            x += coefficient.magnitude * Math.cos(TWO_PI_N_T + coefficient.phase);
            y += coefficient.magnitude * Math.sin(TWO_PI_N_T + coefficient.phase);

            context.lineTo(x, y);
        }

        context.stroke();
        context.closePath();
    }

    public drawCircles(context: CanvasRenderingContext2D, t: number): void {
        function drawCircle(centerX: number, centerY: number, radius: number) {
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, TWO_PI);
            context.closePath();
            context.stroke();
        }

        let x = 0, y = 0;
        
        for (const coefficient of this._coefficients) {
            drawCircle(x, y, coefficient.magnitude);

            const TWO_PI_N_T = TWO_PI * coefficient.n * t;
            x += coefficient.magnitude * Math.cos(TWO_PI_N_T + coefficient.phase);
            y += coefficient.magnitude * Math.sin(TWO_PI_N_T + coefficient.phase);
        }

        if (this._coefficients.length > 1) {
            const lastCoefficient = this._coefficients[this._coefficients.length - 1];
            drawCircle(x, y, lastCoefficient.magnitude);
        }
    }
}

export {
    FourierCoefficient,
    FourierSeries,
};
