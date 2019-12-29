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

function equals(p1: IPoint, p2: IPoint): boolean {
    return p1.x === p2.x && p1.y === p2.y;
}

function copy(point: IPoint): IPoint {
    return {
        x: point.x,
        y: point.y,
    };
}

export {
    copy,
    distance,
    equals,
    interpolate,
    IPoint,
};
