import { Clock } from "./clock";
import { FourierSeries } from "./fourier-series";
import { LineDrawing } from "./line-drawing";
import { Parameters } from "./parameters";
import { IPoint } from "./point";
import { Presets } from "./presets";
import { TimeUnit } from "./units";

declare const Canvas: any;

function main(): void {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext("2d");

    function adjustCanvasSize(): void {
        if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }
    }

    function clearCanvas(): void {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    context.lineWidth = 1;

    let drawing: LineDrawing = null;
    let fourier: FourierSeries = null;

    const clock = new Clock();

    let needToRestart = true;
    Parameters.clearObservers.push(() => needToRestart = true);

    let needToRedraw = true;
    Parameters.redrawObservers.push(() => needToRedraw = true);

    const loopDuration = 2000; // milliseconds, at normal speed
    function mainLoop(): void {
        if (drawing !== null && fourier !== null) { // checks that preset is loaded
            let t: TimeUnit = clock.current / loopDuration;
            const maxT: TimeUnit = Parameters.closeLoop ? 1 : drawing.originalPathDuration;
            let finishedLoop = (t >= maxT);

            if (!finishedLoop && clock.isPaused) {
                clock.resume();
            }

            t = Math.min(t, maxT);

            if (finishedLoop) {
                if (Parameters.repeat) {
                    needToRestart = true;
                } else {
                    clock.pause();
                }
            }

            if (needToRestart) {
                needToRestart = false;
                clock.reset();
                fourier.resetCurve();
                t = 0;
                finishedLoop = false;
                Canvas.setIndicatorText("fourier-order", Parameters.order.toLocaleString());
                clearCanvas();
            }

            if (needToRedraw) {
                adjustCanvasSize();

                if (!Parameters.persistence) {
                    clearCanvas();
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

            needToRedraw = !finishedLoop;
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
