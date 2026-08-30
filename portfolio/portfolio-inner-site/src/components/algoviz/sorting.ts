// Sorting algorithms as pure step generators.
//
// Every function here runs synchronously to completion over its own copy of the
// data and returns a step log. Nothing touches React, timers, or cancellation
// flags - the player replays the log at whatever speed the user picked. That is
// what makes pause / single-step / scrub possible, and it removes the whole
// class of bugs where a cancelled algorithm left its recursion half-applied.

import { SortKey, SortMeta, SortRun, SortStep } from './types';

class Recorder {
    steps: SortStep[] = [];
    a: number[];

    constructor(values: number[]) {
        this.a = values.slice();
    }

    /** Records a comparison of two live indices and returns a[i] - a[j]. */
    compare(i: number, j: number): number {
        this.steps.push({ t: 'compare', i, j });
        return this.a[i] - this.a[j];
    }

    /** Records a comparison without re-reading the array (merge reads its aux buffer). */
    noteCompare(i: number, j: number): void {
        this.steps.push({ t: 'compare', i, j });
    }

    swap(i: number, j: number): void {
        const tmp = this.a[i];
        this.a[i] = this.a[j];
        this.a[j] = tmp;
        this.steps.push({ t: 'swap', i, j });
    }

    write(i: number, v: number): void {
        this.a[i] = v;
        this.steps.push({ t: 'overwrite', i, v });
    }

    pivot(i: number): void {
        this.steps.push({ t: 'pivot', i });
    }

    range(lo: number, hi: number): void {
        this.steps.push({ t: 'range', lo, hi });
    }

    sorted(i: number): void {
        this.steps.push({ t: 'sorted', i });
    }

    markAllSorted(): void {
        for (let i = 0; i < this.a.length; i++) this.sorted(i);
    }

    done(note?: string): SortRun {
        return { steps: this.steps, complete: true, note };
    }
}

// -- quadratic sorts --------------------------------------------------------

function bubbleSort(values: number[]): SortRun {
    const r = new Recorder(values);
    const n = r.a.length;
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            if (r.compare(j, j + 1) > 0) {
                r.swap(j, j + 1);
                swapped = true;
            }
        }
        r.sorted(n - i - 1);
        // The early exit is what makes bubble sort linear on sorted input;
        // without it the "nearly sorted" distribution looks no different.
        if (!swapped) {
            for (let k = n - i - 2; k >= 0; k--) r.sorted(k);
            return r.done();
        }
    }
    if (n > 0) r.sorted(0);
    return r.done();
}

function insertionSort(values: number[]): SortRun {
    const r = new Recorder(values);
    const n = r.a.length;
    if (n > 0) r.sorted(0);
    for (let i = 1; i < n; i++) {
        r.range(0, i);
        let j = i;
        while (j > 0 && r.compare(j - 1, j) > 0) {
            r.swap(j - 1, j);
            j--;
        }
        r.sorted(i);
    }
    return r.done();
}

function selectionSort(values: number[]): SortRun {
    const r = new Recorder(values);
    const n = r.a.length;
    for (let i = 0; i < n; i++) {
        r.range(i, n - 1);
        let min = i;
        r.pivot(min);
        for (let j = i + 1; j < n; j++) {
            if (r.compare(j, min) < 0) {
                min = j;
                r.pivot(min);
            }
        }
        if (min !== i) r.swap(i, min);
        r.sorted(i);
    }
    return r.done();
}

function shellSort(values: number[]): SortRun {
    const r = new Recorder(values);
    const n = r.a.length;
    // Ciura's gap sequence, extended upward by the usual 2.25 factor.
    const gaps = [701, 301, 132, 57, 23, 10, 4, 1];
    while (gaps[0] < n) gaps.unshift(Math.floor(gaps[0] * 2.25));
    for (let g = 0; g < gaps.length; g++) {
        const gap = gaps[g];
        if (gap >= n) continue;
        for (let i = gap; i < n; i++) {
            let j = i;
            while (j >= gap && r.compare(j - gap, j) > 0) {
                r.swap(j - gap, j);
                j -= gap;
            }
        }
    }
    r.markAllSorted();
    return r.done();
}

// -- divide and conquer -----------------------------------------------------

function mergeSort(values: number[]): SortRun {
    const r = new Recorder(values);
    const aux = r.a.slice();
    mergeSortRange(r, aux, 0, r.a.length - 1);
    r.markAllSorted();
    return r.done();
}

function mergeSortRange(r: Recorder, aux: number[], lo: number, hi: number): void {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    mergeSortRange(r, aux, lo, mid);
    mergeSortRange(r, aux, mid + 1, hi);
    r.range(lo, hi);
    merge(r, aux, lo, mid, hi);
}

function merge(r: Recorder, aux: number[], lo: number, mid: number, hi: number): void {
    for (let k = lo; k <= hi; k++) aux[k] = r.a[k];
    let i = lo;
    let j = mid + 1;
    for (let k = lo; k <= hi; k++) {
        if (i > mid) {
            r.write(k, aux[j++]);
        } else if (j > hi) {
            r.write(k, aux[i++]);
        } else {
            // The comparison is between the two run heads; the write lands at k.
            // The prototype reported k as if it were a compared index, so merge
            // sort's highlighting never lined up with what it actually read.
            r.noteCompare(i, j);
            if (aux[j] < aux[i]) r.write(k, aux[j++]);
            else r.write(k, aux[i++]);
        }
    }
}

function quickSort(values: number[]): SortRun {
    const r = new Recorder(values);
    quickSortRange(r, 0, r.a.length - 1);
    return r.done();
}

function quickSortRange(r: Recorder, lo: number, hi: number): void {
    if (lo > hi) return;
    if (lo === hi) {
        r.sorted(lo);
        return;
    }
    r.range(lo, hi);
    const p = partition(r, lo, hi);
    r.sorted(p);
    quickSortRange(r, lo, p - 1);
    quickSortRange(r, p + 1, hi);
}

function partition(r: Recorder, lo: number, hi: number): number {
    // Median-of-three pivot, parked at hi. A plain last-element pivot degrades
    // to quadratic on sorted and reversed input, which are two of the four
    // distributions the UI offers.
    const mid = (lo + hi) >> 1;
    if (r.compare(mid, lo) < 0) r.swap(mid, lo);
    if (r.compare(hi, lo) < 0) r.swap(hi, lo);
    if (r.compare(mid, hi) < 0) r.swap(mid, hi);

    r.pivot(hi);
    const pivotValue = r.a[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
        r.noteCompare(j, hi);
        if (r.a[j] < pivotValue) {
            if (i !== j) r.swap(i, j);
            i++;
        }
    }
    if (i !== hi) r.swap(i, hi);
    return i;
}

function heapSort(values: number[]): SortRun {
    const r = new Recorder(values);
    const n = r.a.length;
    for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(r, i, n);
    for (let end = n - 1; end > 0; end--) {
        r.swap(0, end);
        r.sorted(end);
        siftDown(r, 0, end);
    }
    if (n > 0) r.sorted(0);
    return r.done();
}

function siftDown(r: Recorder, root: number, n: number): void {
    let node = root;
    for (;;) {
        const left = 2 * node + 1;
        const right = left + 1;
        let largest = node;
        if (left < n && r.compare(left, largest) > 0) largest = left;
        if (right < n && r.compare(right, largest) > 0) largest = right;
        if (largest === node) return;
        r.swap(node, largest);
        node = largest;
    }
}

// -- non-comparison sorts ---------------------------------------------------

function radixSort(values: number[]): SortRun {
    const r = new Recorder(values);
    const n = r.a.length;
    if (n === 0) return r.done();

    let max = 0;
    for (let i = 0; i < n; i++) if (r.a[i] > max) max = r.a[i];

    const out = new Array<number>(n);
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        const count = new Array<number>(10).fill(0);
        for (let i = 0; i < n; i++) count[Math.floor(r.a[i] / exp) % 10]++;
        for (let d = 1; d < 10; d++) count[d] += count[d - 1];
        for (let i = n - 1; i >= 0; i--) {
            const d = Math.floor(r.a[i] / exp) % 10;
            out[--count[d]] = r.a[i];
        }
        for (let i = 0; i < n; i++) r.write(i, out[i]);
    }
    r.markAllSorted();
    return r.done('Radix never compares two elements, so the comparison counter stays at zero.');
}

function countingSort(values: number[]): SortRun {
    const r = new Recorder(values);
    const n = r.a.length;
    if (n === 0) return r.done();

    let max = 0;
    for (let i = 0; i < n; i++) if (r.a[i] > max) max = r.a[i];

    const count = new Array<number>(max + 1).fill(0);
    for (let i = 0; i < n; i++) count[r.a[i]]++;

    let k = 0;
    for (let v = 0; v <= max; v++) {
        for (let c = 0; c < count[v]; c++) {
            r.write(k, v);
            r.sorted(k);
            k++;
        }
    }
    return r.done('Counting sort is linear in n plus the key range, not in n log n.');
}

function bogoSort(values: number[]): SortRun {
    const r = new Recorder(values);
    const n = r.a.length;
    const STEP_BUDGET = 200000; // hard cap so the window can never hang
    let shuffles = 0;

    for (;;) {
        let ordered = true;
        for (let i = 0; i + 1 < n; i++) {
            if (r.compare(i, i + 1) > 0) {
                ordered = false;
                break;
            }
        }
        if (ordered) {
            r.markAllSorted();
            const s = shuffles === 1 ? '' : 's';
            return r.done('Sorted by luck after ' + shuffles + ' shuffle' + s + '.');
        }
        if (r.steps.length >= STEP_BUDGET) {
            return {
                steps: r.steps,
                complete: false,
                note:
                    'Gave up after ' +
                    shuffles +
                    ' shuffles. That is the point of Bogo sort.',
            };
        }
        for (let i = n - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            if (i !== j) r.swap(i, j);
        }
        shuffles++;
    }
}

// -- registry ---------------------------------------------------------------

const RUNNERS: { [K in SortKey]: (values: number[]) => SortRun } = {
    bubble: bubbleSort,
    insertion: insertionSort,
    selection: selectionSort,
    shell: shellSort,
    merge: mergeSort,
    quick: quickSort,
    heap: heapSort,
    radix: radixSort,
    counting: countingSort,
    bogo: bogoSort,
};

export const SORT_META: SortMeta[] = [
    {
        key: 'bubble',
        label: 'Bubble Sort',
        best: 'O(n)',
        average: 'O(n^2)',
        worst: 'O(n^2)',
        space: 'O(1)',
        stable: true,
        note: 'Swaps neighbours until a full pass makes no swap. The early exit is why nearly-sorted input finishes almost immediately.',
    },
    {
        key: 'insertion',
        label: 'Insertion Sort',
        best: 'O(n)',
        average: 'O(n^2)',
        worst: 'O(n^2)',
        space: 'O(1)',
        stable: true,
        note: 'Grows a sorted prefix one element at a time. The fastest thing here on small or nearly-sorted arrays.',
    },
    {
        key: 'selection',
        label: 'Selection Sort',
        best: 'O(n^2)',
        average: 'O(n^2)',
        worst: 'O(n^2)',
        space: 'O(1)',
        stable: false,
        note: 'Always scans the whole remaining range, so the distribution changes nothing: the comparison count is identical every run.',
    },
    {
        key: 'shell',
        label: 'Shell Sort',
        best: 'O(n log n)',
        average: 'approx O(n^1.3)',
        worst: 'O(n^1.5)',
        space: 'O(1)',
        stable: false,
        note: 'Insertion sort over shrinking gaps (Ciura sequence), so distant elements move early instead of creeping one slot at a time.',
    },
    {
        key: 'merge',
        label: 'Merge Sort',
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n log n)',
        space: 'O(n)',
        stable: true,
        note: 'Splits, sorts, then merges through an auxiliary buffer. Watch the writes sweep left to right across each merged range.',
    },
    {
        key: 'quick',
        label: 'Quick Sort',
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n^2)',
        space: 'O(log n)',
        stable: false,
        note: 'Median-of-three pivot with a Lomuto partition. The amber bar is the pivot, and each one lands in its final slot.',
    },
    {
        key: 'heap',
        label: 'Heap Sort',
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n log n)',
        space: 'O(1)',
        stable: false,
        note: 'Builds a max-heap in place, then repeatedly swaps the root to the end. The sorted region grows from the right.',
    },
    {
        key: 'radix',
        label: 'Radix Sort (LSD)',
        best: 'O(nk)',
        average: 'O(nk)',
        worst: 'O(nk)',
        space: 'O(n + b)',
        stable: true,
        note: 'Buckets by one digit at a time, least significant first. It beats n log n by never comparing two elements at all.',
    },
    {
        key: 'counting',
        label: 'Counting Sort',
        best: 'O(n + k)',
        average: 'O(n + k)',
        worst: 'O(n + k)',
        space: 'O(n + k)',
        stable: true,
        note: 'Tallies how many of each value exist, then writes them back in order. Linear, but only for small integer keys.',
    },
    {
        key: 'bogo',
        label: 'Bogo Sort',
        best: 'O(n)',
        average: 'O(n * n!)',
        worst: 'unbounded',
        space: 'O(1)',
        stable: false,
        maxN: 8,
        note: 'Shuffle, check, repeat. Capped at eight elements and a fixed step budget, because the average case really is factorial.',
    },
];

export function sortMeta(key: SortKey): SortMeta {
    const found = SORT_META.filter((m) => m.key === key)[0];
    return found || SORT_META[0];
}

export function runSort(key: SortKey, values: number[]): SortRun {
    return RUNNERS[key](values);
}
