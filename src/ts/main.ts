import { Canvas2D } from "./canvas-2d";
import { Clock } from "./clock";
import { FourierSeries } from "./fourier-series";
import { LineDrawing } from "./line-drawing";
import { Parameters } from "./parameters";
import { Point } from "./point";
import { Presets } from "./presets";
import { TimeUnit } from "./units";

declare const Canvas: any;

function setOrderIndicator(value: number): void {
    value = Math.round(100 * value) / 100; // 2 digits max
    Canvas.setIndicatorText("fourier-order", value.toLocaleString());
}

function main(): void {
    const canvas2D = new Canvas2D("canvas");
    const context = canvas2D.context;
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
                setOrderIndicator(Parameters.order);
                canvas2D.clear();
            }

            if (needToRedraw) {
                canvas2D.adjustSize();

                if (!Parameters.persistence) {
                    canvas2D.clear();
                }

                if (Parameters.displayOriginalCurve) {
                    context.strokeStyle = "rgb(0,128,0)";
                    const previousWidth = context.lineWidth;
                    context.lineWidth = 2;

                    drawing.draw(context, Parameters.isProgressiveMode ? maxT : t);

                    context.lineWidth = previousWidth;
                }

                if (Parameters.displayCircles) {
                    context.strokeStyle = Parameters.persistence ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.3)";
                    fourier.drawCirclesToPoint(context, Parameters.order, t);
                }

                if (Parameters.displayCurve) {
                    context.strokeStyle = "white";
                    fourier.drawCurve(context, Parameters.order, t);
                }

                if (Parameters.displaySegments) {
                    context.strokeStyle = Parameters.persistence ? "rgba(255,0,0,0.01)" : "red";
                    fourier.drawSegmentsToPoint(context, Parameters.order, t);
                }

                if (Parameters.isProgressiveMode) {
                    context.strokeStyle = Parameters.persistence ? "rgba(255,255,255,0.01)" : "white";
                    const order = Parameters.order * t / maxT;
                    fourier.drawCurvePartialOrder(context, order, maxT);
                    setOrderIndicator(order);
                }
            }

            needToRedraw = !finishedLoop && Parameters.speed > 0;
        }

        requestAnimationFrame(mainLoop);
    }

    function loadPreset(): void {
        drawing = null;
        fourier = null;

        const canvasSize: number[] = Canvas.getSize();
        Canvas.showLoader(true);
        Presets.getPreset(Parameters.preset, canvasSize, (points: Point[]) => {
            drawing = new LineDrawing(points);
            fourier = drawing.computeFourierSeries(300 + 1); // one more to avoid out of bounds exceptions
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
