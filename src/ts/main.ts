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

    context.lineWidth = 1;

    let drawing: LineDrawing = null;
    let fourier: FourierSeries = null;

    const clock = new Clock();

    let needToRestart = true;
    Parameters.clearObservers.push(() => needToRestart = true);

    let needToRedraw = true;
    Parameters.redrawObservers.push(() => needToRedraw = true);

    const wantedLength = 2000; // milliseconds
    function mainLoop(): void {
        if (drawing !== null && fourier !== null) { // checks that preset is loaded
            let t: TimeUnit = clock.current / wantedLength;
            const maxT: TimeUnit = Parameters.closeLoop ? 1 : drawing.originalPathLength;

            t = Math.min(t, maxT);

            if (t >= maxT && Parameters.repeat) {
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

            needToRedraw = t < maxT;
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
