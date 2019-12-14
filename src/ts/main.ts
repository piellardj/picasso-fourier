import LineDrawing from "./line-drawing";
import Point from "./point";
import { FourierSeries } from "./fourier-series";

function main() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    canvas.width = 512;//canvas.clientWidth;
    canvas.height = 512;//canvas.clientHeight;
    context.lineWidth = 1;

    const animationLength = 10000; // in milliseconds

    const drawing = new LineDrawing();
    const fourier: FourierSeries = drawing.computeFourierSeries(100);
    let fourierPoints: Point[] = [];

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

        context.strokeStyle = "rgba(255,255,255,0.1)";
        fourier.drawCircles(context, t);

        context.strokeStyle = "white";
        context.beginPath();
        context.moveTo(fourierPoints[0].x, fourierPoints[0].y);
        for (let i = 0; i < fourierPoints.length; i++) {
            context.lineTo(fourierPoints[i].x, fourierPoints[i].y);
        }
        context.stroke();
        context.closePath();

        context.strokeStyle = "green";
        drawing.draw(context, t);

        context.strokeStyle = "red";
        fourier.drawPathToPoint(context, t);

        requestAnimationFrame(mainLoop);
    }

    requestAnimationFrame(mainLoop);
}

main();
