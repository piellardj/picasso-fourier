import IPoint from "./point";

interface IFourierCoefficient {
    magnitude: number;
    phase: number;
    n: number;
}

const TWO_PI = 2 * Math.PI;

class FourierSeries {
    private readonly _coefficients: IFourierCoefficient[];

    public constructor(coefficients: IFourierCoefficient[]) {
        this._coefficients = coefficients;
    }

    /* Assumes t is between 0 and 1 included. */
    public computePoint(order: number, t: number): IPoint {
        let x = 0;
        let y = 0;

        const max = this.computeAmountOfCoefficients(order);
        for (let i = 0; i < max; i++) {
            const coefficient = this._coefficients[i];
            const TWO_PI_N_T = TWO_PI * coefficient.n * t;
            x += coefficient.magnitude * Math.cos(TWO_PI_N_T + coefficient.phase);
            y += coefficient.magnitude * Math.sin(TWO_PI_N_T + coefficient.phase);
        }

        return { x, y };
    }

    public drawPathToPoint(context: CanvasRenderingContext2D, order: number, t: number): void {
        let x = 0;
        let y = 0;
        context.beginPath();
        context.moveTo(x, y);

        const max = this.computeAmountOfCoefficients(order);
        for (let i = 0; i < max; i++) {
            const coefficient = this._coefficients[i];
            const TWO_PI_N_T = TWO_PI * coefficient.n * t;
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

        let x = 0;
        let y = 0;

        const max = this.computeAmountOfCoefficients(order);
        for (let i = 0; i < max; i++) {
            const coefficient = this._coefficients[i];
            drawCircle(x, y, coefficient.magnitude);

            const TWO_PI_N_T = TWO_PI * coefficient.n * t;
            x += coefficient.magnitude * Math.cos(TWO_PI_N_T + coefficient.phase);
            y += coefficient.magnitude * Math.sin(TWO_PI_N_T + coefficient.phase);
        }
    }

    private computeAmountOfCoefficients(order: number): number {
        return Math.min(this._coefficients.length, 1 + 2 * order);
    }
}

export {
    IFourierCoefficient,
    FourierSeries,
};
