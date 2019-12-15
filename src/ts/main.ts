import { FourierSeries } from "./fourier-series";
import LineDrawing from "./line-drawing";
import IPoint from "./point";

import { Parameters } from "./parameters";

declare const Canvas: any;

function main() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    canvas.width = 512;
    canvas.height = 512;
    context.lineWidth = 1;

    const drawing = new LineDrawing();
    const fourier: FourierSeries = drawing.computeFourierSeries(300);
    let fourierPoints: IPoint[] = [];

    let animationLength: number; // in milliseconds

    let needToRestart: boolean = true;
    Parameters.clearObservers.push(() => needToRestart = true);

    let startTimestamp: DOMHighResTimeStamp = null;
    function mainLoop(timestamp: DOMHighResTimeStamp) {
        let t = (timestamp - startTimestamp) / animationLength;
        if (t > 1) {
            needToRestart = true;
        }

        if (needToRestart) {
            needToRestart = false;
            animationLength = 1000 * drawing.pathLength / (Parameters.speed + 0.001);
            startTimestamp = timestamp;
            t = 0;
            fourierPoints = [];
            Canvas.setIndicatorText("fourier-order", Parameters.order.toLocaleString());
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        fourierPoints.push(fourier.computePoint(Parameters.order, t));

        if (Parameters.displayCircles) {
            context.strokeStyle = "rgba(255,255,255,0.3)";
            fourier.drawCircles(context, Parameters.order, t);
        }

        if (Parameters.displayCurve) {
            context.strokeStyle = "white";
            context.beginPath();
            context.moveTo(fourierPoints[0].x, fourierPoints[0].y);
            for (const point of fourierPoints) {
                context.lineTo(point.x, point.y);
            }
            context.stroke();
            context.closePath();
        }

        // context.strokeStyle = "green";
        // drawing.draw(context, t);

        if (Parameters.displaySegments) {
            context.strokeStyle = "red";
            fourier.drawPathToPoint(context, Parameters.order, t);
        }

        requestAnimationFrame(mainLoop);
    }

    requestAnimationFrame(mainLoop);
}

main();
