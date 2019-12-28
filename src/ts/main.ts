import { FourierSeries } from "./fourier-series";
import LineDrawing from "./line-drawing";
import { IPoint } from "./point";

import Clock from "./clock";
import { Parameters } from "./parameters";

import { EPreset, Presets } from "./presets";

declare const Canvas: any;

function main() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    function adjustCanvasSize() {
        if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }
    }

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
        if (drawing && fourier) { // checks that preset is loaded
            let t = clock.current / wantedLength;

            if (t >= 1 && Parameters.repeat) {
                needToRestart = true;
            }

            if (needToRestart) {
                needToRestart = false;
                clock.reset();
                fourier.resetCurve();
                t = 0;
                Canvas.setIndicatorText("fourier-order", Parameters.order.toLocaleString());
                context.clearRect(0, 0, canvas.width, canvas.height);
            }

            if (needToRedraw) {
                adjustCanvasSize();

                if (!Parameters.persistence) {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                }

                if (Parameters.displayOriginalCurve) {
                    context.strokeStyle = "rgb(0,128,0)";
                    const previousWidth = context.lineWidth;
                    context.lineWidth = 2;

                    drawing.draw(context, t);

                    context.lineWidth = previousWidth;
                }

                if (Parameters.displayCircles) {
                    context.strokeStyle = Parameters.persistence ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.3)";
                    fourier.drawCircles(context, Parameters.order, t);
                }

                if (Parameters.displayCurve) {
                    context.strokeStyle = "white";
                    fourier.drawCurve(context, Parameters.order, t);
                }

                if (Parameters.displaySegments) {
                    context.strokeStyle = Parameters.persistence ? "rgba(255,0,0,0.01)" : "red";
                    fourier.drawPathToPoint(context, Parameters.order, t);
                }
            }

            needToRedraw = t < 1;
        }

        requestAnimationFrame(mainLoop);
    }

    function loadPreset(): void {
        drawing = null;
        fourier = null;

        const canvasSize: number[] = Canvas.getSize();
        Canvas.showLoader(true);
        Presets.getPreset(Parameters.preset, canvasSize, (points: IPoint[]) => {
            drawing = new LineDrawing(points);
            fourier = drawing.computeFourierSeries(300);
            needToRestart = true;
            clock.reset();
            Canvas.showLoader(false);
        });
    }

    Parameters.presetObservers.push(loadPreset);
    Canvas.Observers.canvasResize.push(loadPreset);

    loadPreset();
    requestAnimationFrame(mainLoop);
}

main();
