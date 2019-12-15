import { FourierSeries } from "./fourier-series";
import LineDrawing from "./line-drawing";
import IPoint from "./point";

import { Parameters } from "./parameters";

function main() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    canvas.width = 512;
    canvas.height = 512;
    context.lineWidth = 1;

    const animationLength = 10000; // in milliseconds

    const drawing = new LineDrawing();
    const fourier: FourierSeries = drawing.computeFourierSeries(100);
    let fourierPoints: IPoint[] = [];

    let startTimestamp: DOMHighResTimeStamp = null;
    function mainLoop(timestamp: DOMHighResTimeStamp) {
        if (startTimestamp === null) {
            startTimestamp = timestamp;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        let t = (timestamp - startTimestamp) / animationLength;
        if (t > 1) {
            startTimestamp = timestamp;
            t = 0;
            fourierPoints = [];
        }

        fourierPoints.push(fourier.computePoint(t));

        if (Parameters.displayCircles) {
            context.strokeStyle = "rgba(255,255,255,0.3)";
            fourier.drawCircles(context, t);
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
            fourier.drawPathToPoint(context, t);
        }

        requestAnimationFrame(mainLoop);
    }

    requestAnimationFrame(mainLoop);
}

main();
