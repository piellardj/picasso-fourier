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

    const clock = new Clock();

    let needToRestart: boolean = true;
    Parameters.clearObservers.push(() => needToRestart = true);

    let needToRedraw: boolean = true;
    Parameters.redrawObservers.push(() => needToRedraw = true);

    const wantedLength = 2000; // milliseconds
    function mainLoop() {
        let t = clock.current / wantedLength;

        if (t >= 1 && Parameters.loop) {
            needToRestart = true;
        }

        if (needToRestart) {
            needToRestart = false;
            clock.reset();
            t = 0;
            Canvas.setIndicatorText("fourier-order", Parameters.order.toLocaleString());
        }

        if (needToRedraw) {
            context.clearRect(0, 0, canvas.width, canvas.height);

            if (Parameters.displayCircles) {
                context.strokeStyle = "rgba(255,255,255,0.3)";
                fourier.drawCircles(context, Parameters.order, t);
            }

            if (Parameters.displayCurve) {
                context.strokeStyle = "white";
                fourier.drawCurve(context, Parameters.order, t);
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
