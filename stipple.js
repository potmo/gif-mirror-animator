'use strict';

// Copied from https://github.com/pshihn/stipple

import { Voronoi } from './voronoi.js';
// Adapted from https://observablehq.com/@mbostock/voronoi-stippling
export function stipple(imageDataBuffer, width, height, pointCount, iterations, invert_colors, callback) {
    const n = pointCount || (width * height / 50);
    iterations = iterations || [80];
    const highestIteration = Math.max(...iterations);
    const points = new Float32Array(n * 2);
    const rgba = new Uint8ClampedArray(imageDataBuffer);
    const c = new Float64Array(n * 2);
    const s = new Float64Array(n);
    for (let i = 0; i < n; ++i) {
        for (let j = 0; j < 60; ++j) {
            const x = points[i * 2] = Math.floor(Math.random() * width);
            const y = points[i * 2 + 1] = Math.floor(Math.random() * height);
            if (Math.random() < grayValue(y * width + x, rgba, invert_colors))
                break;
        }
    }
    const voronoi = new Voronoi(points, [0, 0, width, height]);
    for (let k = 0; k <= highestIteration; ++k) {
        c.fill(0);
        s.fill(0);
        for (let y = 0, i = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                const w = grayValue(y * width + x, rgba, invert_colors);
                i = voronoi.find(x + 0.5, y + 0.5, i);
                s[i] += w;
                c[i * 2] += w * (x + 0.5);
                c[i * 2 + 1] += w * (y + 0.5);
            }
        }
        // Relax the diagram by moving points to the weighted centroid.
        // Wiggle the points a little bit so they don’t get stuck.
        const w = Math.pow(k + 1, -0.8) * 10;
        for (let i = 0; i < n; ++i) {
            const x0 = points[i * 2], y0 = points[i * 2 + 1];
            const x1 = s[i] ? c[i * 2] / s[i] : x0, y1 = s[i] ? c[i * 2 + 1] / s[i] : y0;
            points[i * 2] = x0 + (x1 - x0) * 1.8 + (Math.random() - 0.5) * w;
            points[i * 2 + 1] = y0 + (y1 - y0) * 1.8 + (Math.random() - 0.5) * w;
        }
        voronoi.update();
        if (callback && (iterations.indexOf(k) >= 0)) {
            callback({ points, width, height, iteration: k });
        }
    }
    return { points, width, height, iteration: highestIteration };
}
function grayValue(i, rgba, invert_colors) {
    const offset = i * 4;
    let gray = 1 - (0.299 * rgba[offset] + 0.587 * rgba[offset + 1] + 0.114 * rgba[offset + 2]) / 254;
    if (invert_colors) {
        gray = 1 - gray;
    }
    return gray;
}
