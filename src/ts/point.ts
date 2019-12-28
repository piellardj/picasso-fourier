interface IPoint {
    x: number;
    y: number;
}

/* Assumes t is between 0 and 1 included. */
function interpolate(p1: IPoint, p2: IPoint, t: number): IPoint {
    return {
        x: p1.x * (1 - t) + p2.x * t,
        y: p1.y * (1 - t) + p2.y * t,
    };
}

function distance(p1: IPoint, p2: IPoint): number {
    const dX = p1.x - p2.x;
    const dY = p1.y - p2.y;
    return Math.sqrt(dX * dX + dY * dY);
}

export {
    distance,
    interpolate,
    IPoint,
};
