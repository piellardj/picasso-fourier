import { FourierSeries } from "./fourier-series";
import LineDrawing from "./line-drawing";
import IPoint from "./point";

import Clock from "./clock";
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

    function display(t: number): void {
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

    const clock = new Clock();

    let needToRestart: boolean = true;
    Parameters.clearObservers.push(() => needToRestart = true);

    let needToRedraw: boolean = true;
    Parameters.redrawObservers.push(() => needToRedraw = true);

    let wantedLength = 2000; // milliseconds
    function mainLoop() {
        let t = clock.current / wantedLength;

        if (t < 1) {
            fourierPoints.push(fourier.computePoint(Parameters.order, t));
        } else if (Parameters.loop) {
            needToRestart = true;
        }

        if (needToRestart) {
            needToRestart = false;
            clock.reset();
            t = 0;
            fourierPoints = [];
            Canvas.setIndicatorText("fourier-order", Parameters.order.toLocaleString());
        }

        if (needToRedraw) {
            display(t);
        }

        needToRedraw = t < 1;
        requestAnimationFrame(mainLoop);
    }

    Presets.getPreset(EPreset.ARLEQUIN, (points: IPoint[]) => {
        drawing = new LineDrawing(points);
        fourier = drawing.computeFourierSeries(300);
        clock.reset();

        requestAnimationFrame(mainLoop);
    });
}

main();
