import Point from "./point";

type FourierCoefficient = {
    magnitude: number;
    phase: number;
    n: number;
}

class FourierSeries {
    private readonly _coefficients: FourierCoefficient[];

    public constructor(coefficients: FourierCoefficient[]) {
        this._coefficients = coefficients;
    }

    /* Assumes t is between 0 and 1 included. */
    public computePoint(t: number): Point {
        let x = 0, y = 0;

        const TWO_PI = 2 * Math.PI;

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

        const TWO_PI = 2 * Math.PI;

        for (const coefficient of this._coefficients) {
            const TWO_PI_N_T = TWO_PI * coefficient.n * t;
            x += coefficient.magnitude * Math.cos(TWO_PI_N_T + coefficient.phase);
            y += coefficient.magnitude * Math.sin(TWO_PI_N_T + coefficient.phase);

            context.lineTo(x, y);
        }

        context.stroke();
        context.closePath();
    }
}

export {
    FourierCoefficient,
    FourierSeries,
};
