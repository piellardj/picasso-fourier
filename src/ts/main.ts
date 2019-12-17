import { FourierSeries } from "./fourier-series";
import LineDrawing from "./line-drawing";
import IPoint from "./point";

import { Parameters } from "./parameters";

import { EPreset, Presets } from "./presets";

declare const Canvas: any;

function main() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    canvas.width = 512;
    canvas.height = 512;
    context.lineWidth = 1;

    let drawing: LineDrawing;
    let fourier: FourierSeries;
    let fourierPoints: IPoint[] = [];

    function display(): void {
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        if (Parameters.displayCircles) {
            context.strokeStyle = "rgba(255,255,255,0.3)";
            fourier.drawCircles(context, Parameters.order, t);
        }

        if (Parameters.displayCurve && fourierPoints.length >= 2) {
            context.strokeStyle = "white";
            context.beginPath();
            context.moveTo(fourierPoints[0].x, fourierPoints[0].y);
            for (const point of fourierPoints) {
                context.lineTo(point.x, point.y);
            }
            context.stroke();
            context.closePath();
        }

        if (Parameters.displayOriginalCurve) {
            context.strokeStyle = "green";
            drawing.draw(context, t);
        }

        if (Parameters.displaySegments) {
            context.strokeStyle = "red";
            fourier.drawPathToPoint(context, Parameters.order, t);
        }
    }

    let needToRestart: boolean = true;
    Parameters.clearObservers.push(() => needToRestart = true);

    let lastUpdate: DOMHighResTimeStamp = null;
    let t = 0;
    function mainLoop(timestamp: DOMHighResTimeStamp) {
        const dT = (lastUpdate) ? timestamp - lastUpdate : 0;
        lastUpdate = timestamp;

        if (t < 1) {
            const animationLength = 1000 * drawing.pathLength / (Parameters.speed + 0.001);
            t += dT / animationLength;
            fourierPoints.push(fourier.computePoint(Parameters.order, t));
        } else if (Parameters.loop) {
            needToRestart = true;
        }

        if (needToRestart) {
            needToRestart = false;
            t = 0;
            fourierPoints = [];
            Canvas.setIndicatorText("fourier-order", Parameters.order.toLocaleString());
        }

        fourierPoints.push(fourier.computePoint(Parameters.order, t));

        display();

        requestAnimationFrame(mainLoop);
    }

    Presets.getPreset(EPreset.ARLEQUIN, (points: IPoint[]) => {
        drawing = new LineDrawing(points);
        fourier = drawing.computeFourierSeries(300);

        requestAnimationFrame(mainLoop);
    });
}

main();
