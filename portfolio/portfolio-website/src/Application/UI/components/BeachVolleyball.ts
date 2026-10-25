// Pixel-art beach volleyball scene for the loading screen. Pure drawing code:
// everything is derived from a tick counter and drawn with fillRect on a
// W x H pixel grid (the canvas is scaled up with image-rendering: pixelated).
// Monochrome (white / greys) to keep the retro look.

export const W = 128;
export const H = 56;
export const TICK_MS = 50;

const GROUND_Y = 46; // feet line
const HORIZON_Y = 25;
const SAND_Y = 32;
const NET_X = 64;
const NET_TOP = GROUND_Y - 22;
const PLAYER_X = [36, 92];
const PLAYER_FACING = [1, -1];

const C = {
    white: '#ffffff',
    bright: '#d8d8d8',
    light: '#aaaaaa',
    mid: '#7a7a7a',
    dim: '#555555',
    dark: '#3a3a3a',
    darker: '#2a2a2a',
    sand: '#444444',
    sandLight: '#5a5a5a',
    sandDark: '#333333',
    shadow: '#2b2b2b',
};

type Ctx = Pick<CanvasRenderingContext2D, 'fillRect'> & { fillStyle: any };
type Pt = [number, number];

const px = (ctx: Ctx, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
};

const rect = (
    ctx: Ctx,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string
) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
};

// Bresenham line, 1 pixel thick
const line = (
    ctx: Ctx,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string
) => {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
        px(ctx, x0, y0, color);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) {
            err += dy;
            x0 += sx;
        }
        if (e2 <= dx) {
            err += dx;
            y0 += sy;
        }
    }
};

// ---------------------------------------------------------------- scenery

const drawCloud = (ctx: Ctx, x: number, y: number) => {
    rect(ctx, x + 2, y, 6, 1, C.dim);
    rect(ctx, x, y + 1, 12, 1, C.dark);
    rect(ctx, x + 1, y + 2, 10, 1, C.darker);
};

const drawSky = (ctx: Ctx, tick: number) => {
    // clouds drift left, wrapping around
    const wrap = W + 24;
    drawCloud(ctx, ((((20 - tick * 0.12) % wrap) + wrap) % wrap) - 12, 6);
    drawCloud(ctx, ((((84 - tick * 0.08) % wrap) + wrap) % wrap) - 12, 14);

    // sun with a dotted halo that flickers
    const sx = 108;
    const sy = 9;
    for (let y = -5; y <= 5; y++) {
        for (let x = -5; x <= 5; x++) {
            const d = Math.sqrt(x * x + y * y);
            if (d <= 3.6) px(ctx, sx + x, sy + y, C.bright);
            else if (d <= 4.4) px(ctx, sx + x, sy + y, C.light);
            else if (d <= 5.4 && (x + y + Math.floor(tick / 6)) % 2 === 0) {
                px(ctx, sx + x, sy + y, C.dim);
            }
        }
    }

    // a seagull
    const gx = W + 6 - ((tick * 0.45) % (W + 24));
    const gy = 15 + Math.round(Math.sin(tick / 7) * 2);
    if (Math.floor(tick / 5) % 2 === 0) {
        [[-3, 0], [-2, -1], [-1, 0], [0, 0], [1, -1], [2, 0], [3, 1]].forEach(
            ([dx, dy]) => px(ctx, gx + dx, gy + dy, C.light)
        );
    } else {
        [[-3, -1], [-2, 0], [-1, 1], [0, 0], [1, 1], [2, 0], [3, -1]].forEach(
            ([dx, dy]) => px(ctx, gx + dx, gy + dy, C.light)
        );
    }
};

const drawOcean = (ctx: Ctx, tick: number) => {
    for (let y = HORIZON_Y; y < SAND_Y; y++) {
        rect(ctx, 0, y, W, 1, y % 2 === 0 ? C.darker : C.dark);
    }
    // horizon line
    rect(ctx, 0, HORIZON_Y, W, 1, C.dim);
    // drifting wave glints
    for (let row = 0; row < SAND_Y - HORIZON_Y - 1; row++) {
        const dir = row % 2 === 0 ? 1 : -1;
        const shift = Math.floor(tick / 4) * dir;
        for (let x = 0; x < W; x++) {
            if ((((x * 3 + row * 7 + shift) % 13) + 13) % 13 === 0) {
                // short horizontal wave dash
                px(ctx, x, HORIZON_Y + 1 + row, C.mid);
                px(ctx, x + 1, HORIZON_Y + 1 + row, C.mid);
            }
        }
    }
    // foam where the water meets the sand
    for (let x = 0; x < W; x++) {
        const foam = (x + Math.floor(tick / 3)) % 5 < 3;
        px(ctx, x, SAND_Y - 1, foam ? C.bright : C.light);
    }
};

const drawSand = (ctx: Ctx) => {
    rect(ctx, 0, SAND_Y, W, H - SAND_Y, C.sand);
    for (let y = SAND_Y; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if ((x * 7 + y * 13) % 17 === 0) px(ctx, x, y, C.sandLight);
            else if ((x * 5 + y * 11) % 23 === 0) px(ctx, x, y, C.sandDark);
        }
    }
    // wet sand strip along the shoreline
    rect(ctx, 0, SAND_Y, W, 1, C.sandDark);
};

const drawNet = (ctx: Ctx) => {
    // mesh
    for (let y = NET_TOP; y < NET_TOP + 11; y++) {
        for (let x = NET_X - 3; x <= NET_X + 3; x++) {
            if (x === NET_X) continue;
            px(ctx, x, y, (x + y) % 2 === 0 ? C.light : C.dim);
        }
    }
    // tape on top, pole, base
    rect(ctx, NET_X - 3, NET_TOP, 7, 1, C.white);
    rect(ctx, NET_X - 3, NET_TOP + 11, 7, 1, C.bright);
    rect(ctx, NET_X, NET_TOP - 1, 1, GROUND_Y - NET_TOP + 2, C.bright);
    rect(ctx, NET_X - 1, GROUND_Y + 1, 3, 1, C.mid);
    rect(ctx, NET_X - 3, GROUND_Y + 2, 7, 1, C.shadow);
};

// ---------------------------------------------------------------- players

type Pose = {
    head: Pt;
    shoulder: Pt;
    hip: Pt;
    kneeF: Pt;
    footF: Pt;
    kneeB: Pt;
    footB: Pt;
    elbowF: Pt;
    handF: Pt;
    elbowB: Pt;
    handB: Pt;
};

// Coordinates are relative to the feet line, +x = facing direction, -y = up.
const POSES: { [k: string]: Pose } = {
    ready: {
        head: [1, -18], shoulder: [1, -15], hip: [0, -8],
        kneeF: [2, -4], footF: [3, 0], kneeB: [-1, -4], footB: [-3, 0],
        elbowF: [3, -12], handF: [5, -10], elbowB: [0, -12], handB: [-1, -9],
    },
    crouch: {
        head: [2, -15], shoulder: [2, -12], hip: [-1, -6],
        kneeF: [3, -3], footF: [4, 0], kneeB: [0, -3], footB: [-3, 0],
        elbowF: [4, -9], handF: [6, -6], elbowB: [3, -9], handB: [5, -6],
    },
    bump: {
        head: [2, -15], shoulder: [2, -12], hip: [-1, -6],
        kneeF: [3, -3], footF: [4, 0], kneeB: [0, -3], footB: [-3, 0],
        elbowF: [5, -11], handF: [8, -9], elbowB: [4, -10], handB: [7, -9],
    },
    follow: {
        head: [1, -16], shoulder: [1, -13], hip: [0, -7],
        kneeF: [2, -3], footF: [3, 0], kneeB: [-1, -3], footB: [-3, 0],
        elbowF: [4, -14], handF: [6, -17], elbowB: [3, -13], handB: [5, -16],
    },
    jump: {
        head: [0, -19], shoulder: [0, -16], hip: [0, -9],
        kneeF: [2, -5], footF: [1, -2], kneeB: [-1, -5], footB: [-3, -3],
        elbowF: [1, -20], handF: [3, -24], elbowB: [2, -15], handB: [4, -13],
    },
};

const drawPlayer = (
    ctx: Ctx,
    x: number,
    facing: number,
    pose: Pose,
    hop: number
) => {
    const P = ([jx, jy]: Pt): Pt => [x + facing * jx, GROUND_Y - hop + jy];
    const L = (a: Pt, b: Pt, color: string) => {
        const [ax, ay] = P(a);
        const [bx, by] = P(b);
        line(ctx, ax, ay, bx, by, color);
    };

    // shadow on the sand (shrinks while airborne)
    const sw = Math.max(3, 9 - Math.round(hop / 2));
    rect(ctx, x - Math.floor(sw / 2), GROUND_Y + 1, sw, 1, C.shadow);

    // back limbs (slightly dimmer for depth)
    L(pose.hip, pose.kneeB, C.light);
    L(pose.kneeB, pose.footB, C.light);
    L(pose.shoulder, pose.elbowB, C.light);
    L(pose.elbowB, pose.handB, C.light);

    // torso
    L(pose.shoulder, pose.hip, C.white);

    // shorts
    const [hx, hy] = P(pose.hip);
    rect(ctx, hx - 1, hy - 1, 3, 2, C.mid);

    // front limbs
    L(pose.hip, pose.kneeF, C.white);
    L(pose.kneeF, pose.footF, C.white);
    L(pose.shoulder, pose.elbowF, C.white);
    L(pose.elbowF, pose.handF, C.white);

    // head: 4x4 rounded, with a headband stripe
    const [cx, cy] = P(pose.head);
    const x0 = Math.round(cx) - 2 + (facing > 0 ? 1 : 0);
    const y0 = Math.round(cy) - 2;
    rect(ctx, x0 + 1, y0, 2, 1, C.white);
    rect(ctx, x0, y0 + 1, 4, 2, C.white);
    rect(ctx, x0 + 1, y0 + 3, 2, 1, C.white);
    rect(ctx, x0, y0 + 1, 4, 1, C.mid); // headband
    px(ctx, x0 + (facing > 0 ? 3 : 0), y0 + 2, C.dark); // eye
};

// ---------------------------------------------------------------- the rally
//
// Four hits per cycle, repeating:
//   0  player A jumps and spikes at B
//   1  B receives it (bump) and pops the ball up
//   2  B jumps and spikes at A
//   3  A receives it (bump) and pops the ball up
// then back to 0.

const CYCLE = 96; // ticks per full cycle
const HITS = [0, 22, 48, 70]; // tick of each hit within the cycle
const HIT_PLAYER = [0, 1, 1, 0];

const mod = (n: number, m: number) => ((n % m) + m) % m;
const hitTime = (k: number) => Math.floor(k / 4) * CYCLE + HITS[mod(k, 4)];
const hitPlayer = (k: number) => HIT_PLAYER[mod(k, 4)];
const isSpike = (k: number) => mod(k, 2) === 0;

// index of the hit that most recently happened (the ball is flying away
// from it)
const eventAt = (tick: number) => {
    let k = Math.floor(tick / CYCLE) * 4;
    while (hitTime(k + 1) <= tick) k++;
    while (hitTime(k) > tick) k--;
    return k;
};

// contact point of a hit relative to the player's feet
const CONTACT = {
    bump: { dx: 8, dy: -9 },
    spike: { dx: 3, dy: -30 }, // hand height (-24) plus peak hop (6)
};

const contactPoint = (k: number): Pt => {
    const p = hitPlayer(k);
    const c = isSpike(k) ? CONTACT.spike : CONTACT.bump;
    return [PLAYER_X[p] + PLAYER_FACING[p] * c.dx, GROUND_Y + c.dy];
};

const ballPos = (tick: number): Pt => {
    const k = eventAt(tick);
    const t = (tick - hitTime(k)) / (hitTime(k + 1) - hitTime(k));
    const [x0, y0] = contactPoint(k);
    const [x1, y1] = contactPoint(k + 1);
    const x = x0 + (x1 - x0) * t;
    const arc = 4 * t * (1 - t);
    const y = isSpike(k)
        ? // hard, accelerating spike that just clears the net
          y0 + (y1 - y0) * Math.pow(t, 2.2) - 3 * arc
        : // high pop straight up and back down to the same player
          y0 + (y1 - y0) * t - 22 * arc;
    return [x, y];
};

const poseFor = (tick: number, player: number): { pose: Pose; hop: number } => {
    const base = eventAt(tick);
    for (let k = base - 3; k <= base + 4; k++) {
        if (hitPlayer(k) !== player) continue;
        const u = tick - hitTime(k); // ticks relative to this player's hit
        if (isSpike(k)) {
            if (u >= -10 && u < -6) return { pose: POSES.crouch, hop: 0 };
            if (u >= -6 && u < 6) {
                const hop = Math.round(6 * Math.sin((Math.PI * (u + 6)) / 12));
                return { pose: POSES.jump, hop };
            }
            if (u >= 6 && u < 10) return { pose: POSES.crouch, hop: 0 };
        } else {
            if (u >= -9 && u < 0) return { pose: POSES.crouch, hop: 0 };
            if (u >= 0 && u < 3) return { pose: POSES.bump, hop: 0 };
            if (u >= 3 && u < 8) return { pose: POSES.follow, hop: 0 };
        }
    }
    return { pose: POSES.ready, hop: 0 };
};

const drawRally = (ctx: Ctx, tick: number) => {
    for (let p = 0; p < 2; p++) {
        const { pose, hop } = poseFor(tick, p);
        drawPlayer(ctx, PLAYER_X[p], PLAYER_FACING[p], pose, hop);
    }

    // net sits in front of the shadows but behind the ball
    drawNet(ctx);

    const k = eventAt(tick);
    const sinceHit = tick - hitTime(k);
    const [x, y] = ballPos(tick);

    // speed trail behind a spiked ball
    if (isSpike(k)) {
        for (let i = 1; i <= 2; i++) {
            if (sinceHit - i < 0) break;
            const [tx, ty] = ballPos(tick - i);
            rect(ctx, Math.round(tx), Math.round(ty), 1, 1, i === 1 ? C.light : C.dim);
            px(ctx, Math.round(tx) + 1, Math.round(ty) + 1, i === 1 ? C.light : C.dim);
        }
    }

    // ball shadow on the sand, smaller the higher the ball is
    const height = GROUND_Y - y;
    const sw = height > 30 ? 3 : height > 14 ? 5 : 7;
    rect(ctx, Math.round(x) - Math.floor(sw / 2), GROUND_Y + 3, sw, 1, C.shadow);

    // the ball: 3x3 with a seam
    const bx = Math.round(x);
    const by = Math.round(y);
    rect(ctx, bx - 1, by - 1, 3, 3, C.white);
    px(ctx, bx, by, C.mid);
    px(ctx, bx - 1, by - 1, C.light);
    px(ctx, bx + 1, by + 1, C.light);

    // little impact sparks right after each hit
    if (sinceHit < 4) {
        const [hx, hy] = contactPoint(k);
        const f = PLAYER_FACING[hitPlayer(k)];
        const reach = isSpike(k) ? 1 : 0;
        [[f * (3 + reach), -2], [f * (4 + reach), 0], [0, -3], [f * 2, 3]].forEach(
            ([dx, dy]) => px(ctx, hx + dx, hy + dy, C.bright)
        );
    }
};

export const drawScene = (ctx: Ctx, tick: number) => {
    rect(ctx, 0, 0, W, H, '#000');
    drawSky(ctx, tick);
    drawOcean(ctx, tick);
    drawSand(ctx);
    drawRally(ctx, tick);
};
