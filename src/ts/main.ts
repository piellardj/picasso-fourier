import LineDrawing from "./line-drawing";

function main() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    canvas.width = 512;//canvas.clientWidth;
    canvas.height = 512;//canvas.clientHeight;
    context.strokeStyle = "white";
    context.lineWidth = 1.5;

    const drawing = new LineDrawing();

    let startTimestamp: DOMHighResTimeStamp = null;
    function mainLoop(timestamp: DOMHighResTimeStamp) {
        if (startTimestamp === null) {
            startTimestamp = timestamp;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        let t = (timestamp - startTimestamp) / 5000;
        t = t % 1;
        
        drawing.draw(context, t);

        context.beginPath();
        context.arc(400, 400, 75, 0, 2 * Math.PI);
        context.stroke();

        requestAnimationFrame(mainLoop);
    }

    requestAnimationFrame(mainLoop);
}

main();
