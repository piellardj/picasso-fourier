/**
 * Simple data class representing a 2D point.
 */
class Point {
    /* Assumes t is between 0 and 1 included. */
    public static interpolate(p1: Point, p2: Point, t: number): Point {
        return {
            x: p1.x * (1 - t) + p2.x * t,
            y: p1.y * (1 - t) + p2.y * t,
        };
    }

    public static distance(p1: Point, p2: Point): number {
        const dX = p1.x - p2.x;
        const dY = p1.y - p2.y;
        return Math.sqrt(dX * dX + dY * dY);
    }

    public static equals(p1: Point, p2: Point): boolean {
        return p1.x === p2.x && p1.y === p2.y;
    }

    public static copy(point: Point): Point {
        return {
            x: point.x,
            y: point.y,
        };
    }

    public x: number;
    public y: number;
}

export {
    Point,
};
