import { useState, useEffect, useRef, useCallback } from "react";

// ── Complexity data ────────────────────────────────────────────────────────
const COMPLEXITY = {
  bubble:    { name: "Bubble Sort",    best: "O(n)",        average: "O(n²)",      worst: "O(n²)"      },
  selection: { name: "Selection Sort", best: "O(n²)",       average: "O(n²)",      worst: "O(n²)"      },
  insertion: { name: "Insertion Sort", best: "O(n)",        average: "O(n²)",      worst: "O(n²)"      },
  merge:     { name: "Merge Sort",     best: "O(n log n)",  average: "O(n log n)", worst: "O(n log n)" },
  quick:     { name: "Quick Sort",     best: "O(n log n)",  average: "O(n log n)", worst: "O(n²)"      },
  heap:      { name: "Heap Sort",      best: "O(n log n)",  average: "O(n log n)", worst: "O(n log n)" },
  shell:     { name: "Shell Sort",     best: "O(n log n)",  average: "O(n log²n)", worst: "O(n²)"      },
  cocktail:  { name: "Cocktail Sort",  best: "O(n)",        average: "O(n²)",      worst: "O(n²)"      },
  comb:      { name: "Comb Sort",      best: "O(n log n)",  average: "O(n²/2ᵖ)",  worst: "O(n²)"      },
};

// ── Speed: slider 1-100 → ms per step (exponential for perceptual linearity) ──
function speedToMs(speed) {
  return Math.floor(1000 * Math.pow(0.955, speed - 1));
}

// ── Snapshot helper ────────────────────────────────────────────────────────
function snap(arr, comparing, swapping, sorted, comps, swps) {
  return {
    bars: [...arr],
    comparing,
    swapping,
    sorted: [...sorted],
    comparisons: comps,
    swaps: swps,
  };
}

// ── Algorithm generators (pure JS, no React) ───────────────────────────────
function generateBubbleSteps(input) {
  const arr = [...input];
  const steps = [];
  const sorted = new Set();
  let comps = 0, swps = 0;
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comps++;
      steps.push(snap(arr, [j, j + 1], [], [...sorted], comps, swps));
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swps++;
        steps.push(snap(arr, [], [j, j + 1], [...sorted], comps, swps));
      }
    }
    sorted.add(n - 1 - i);
    steps.push(snap(arr, [], [], [...sorted], comps, swps));
  }
  sorted.add(0);
  steps.push(snap(arr, [], [], [...sorted], comps, swps));
  return steps;
}

function generateSelectionSteps(input) {
  const arr = [...input];
  const steps = [];
  const sorted = new Set();
  let comps = 0, swps = 0;
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      comps++;
      steps.push(snap(arr, [minIdx, j], [], [...sorted], comps, swps));
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      swps++;
      steps.push(snap(arr, [], [i, minIdx], [...sorted], comps, swps));
    }
    sorted.add(i);
    steps.push(snap(arr, [], [], [...sorted], comps, swps));
  }
  sorted.add(n - 1);
  steps.push(snap(arr, [], [], [...sorted], comps, swps));
  return steps;
}

function generateInsertionSteps(input) {
  const arr = [...input];
  const steps = [];
  const sorted = new Set([0]);
  let comps = 0, swps = 0;
  steps.push(snap(arr, [], [], [...sorted], comps, swps));
  for (let i = 1; i < arr.length; i++) {
    let j = i;
    while (j > 0) {
      comps++;
      steps.push(snap(arr, [j - 1, j], [], [...sorted], comps, swps));
      if (arr[j] < arr[j - 1]) {
        [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]];
        swps++;
        steps.push(snap(arr, [], [j, j - 1], [...sorted], comps, swps));
        j--;
      } else {
        break;
      }
    }
    sorted.add(i);
    steps.push(snap(arr, [], [], [...sorted], comps, swps));
  }
  return steps;
}

function generateMergeSteps(input) {
  const arr = [...input];
  const steps = [];
  const sorted = new Set();
  let comps = 0, swps = 0;

  function merge(a, left, mid, right) {
    const leftArr = a.slice(left, mid);
    const rightArr = a.slice(mid, right);
    let i = 0, j = 0, k = left;
    while (i < leftArr.length && j < rightArr.length) {
      comps++;
      steps.push(snap(a, [left + i, mid + j], [], [...sorted], comps, swps));
      if (leftArr[i] <= rightArr[j]) {
        a[k] = leftArr[i]; i++;
      } else {
        a[k] = rightArr[j]; j++;
      }
      swps++;
      steps.push(snap(a, [], [k], [...sorted], comps, swps));
      k++;
    }
    while (i < leftArr.length) {
      a[k] = leftArr[i]; i++;
      swps++;
      steps.push(snap(a, [], [k], [...sorted], comps, swps));
      k++;
    }
    while (j < rightArr.length) {
      a[k] = rightArr[j]; j++;
      swps++;
      steps.push(snap(a, [], [k], [...sorted], comps, swps));
      k++;
    }
  }

  function mergeSort(a, left, right) {
    if (right - left <= 1) return;
    const mid = Math.floor((left + right) / 2);
    mergeSort(a, left, mid);
    mergeSort(a, mid, right);
    merge(a, left, mid, right);
  }

  mergeSort(arr, 0, arr.length);
  for (let x = 0; x < arr.length; x++) sorted.add(x);
  steps.push(snap(arr, [], [], [...sorted], comps, swps));
  return steps;
}

function generateQuickSteps(input) {
  const arr = [...input];
  const steps = [];
  const sorted = new Set();
  let comps = 0, swps = 0;

  function partition(a, low, high) {
    let i = low - 1;
    for (let j = low; j < high; j++) {
      comps++;
      steps.push(snap(a, [j, high], [], [...sorted], comps, swps));
      if (a[j] <= a[high]) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          swps++;
          steps.push(snap(a, [], [i, j], [...sorted], comps, swps));
        }
      }
    }
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    swps++;
    steps.push(snap(a, [], [i + 1, high], [...sorted], comps, swps));
    return i + 1;
  }

  function quickSort(a, low, high) {
    if (low >= high) {
      sorted.add(low);
      return;
    }
    const pi = partition(a, low, high);
    sorted.add(pi);
    steps.push(snap(a, [], [], [...sorted], comps, swps));
    quickSort(a, low, pi - 1);
    quickSort(a, pi + 1, high);
  }

  quickSort(arr, 0, arr.length - 1);
  for (let x = 0; x < arr.length; x++) sorted.add(x);
  steps.push(snap(arr, [], [], [...sorted], comps, swps));
  return steps;
}

function generateHeapSteps(input) {
  const arr = [...input];
  const steps = [];
  const sorted = new Set();
  let comps = 0, swps = 0;
  const n = arr.length;

  function heapify(size, root) {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;
    if (left < size) {
      comps++;
      steps.push(snap(arr, [largest, left], [], [...sorted], comps, swps));
      if (arr[left] > arr[largest]) largest = left;
    }
    if (right < size) {
      comps++;
      steps.push(snap(arr, [largest, right], [], [...sorted], comps, swps));
      if (arr[right] > arr[largest]) largest = right;
    }
    if (largest !== root) {
      [arr[root], arr[largest]] = [arr[largest], arr[root]];
      swps++;
      steps.push(snap(arr, [], [root, largest], [...sorted], comps, swps));
      heapify(size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);

  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    swps++;
    sorted.add(i);
    steps.push(snap(arr, [], [0, i], [...sorted], comps, swps));
    heapify(i, 0);
  }
  sorted.add(0);
  steps.push(snap(arr, [], [], [...sorted], comps, swps));
  return steps;
}

function generateShellSteps(input) {
  const arr = [...input];
  const steps = [];
  const sorted = new Set();
  let comps = 0, swps = 0;
  const n = arr.length;

  let gap = Math.floor(n / 2);
  while (gap > 0) {
    for (let i = gap; i < n; i++) {
      let j = i;
      while (j >= gap) {
        comps++;
        steps.push(snap(arr, [j - gap, j], [], [...sorted], comps, swps));
        if (arr[j] < arr[j - gap]) {
          [arr[j], arr[j - gap]] = [arr[j - gap], arr[j]];
          swps++;
          steps.push(snap(arr, [], [j, j - gap], [...sorted], comps, swps));
          j -= gap;
        } else {
          break;
        }
      }
    }
    gap = Math.floor(gap / 2);
  }
  for (let x = 0; x < n; x++) sorted.add(x);
  steps.push(snap(arr, [], [], [...sorted], comps, swps));
  return steps;
}

function generateCocktailSteps(input) {
  const arr = [...input];
  const steps = [];
  const sorted = new Set();
  let comps = 0, swps = 0;
  const n = arr.length;

  let start = 0, end = n - 1;
  while (start < end) {
    for (let i = start; i < end; i++) {
      comps++;
      steps.push(snap(arr, [i, i + 1], [], [...sorted], comps, swps));
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swps++;
        steps.push(snap(arr, [], [i, i + 1], [...sorted], comps, swps));
      }
    }
    sorted.add(end);
    end--;
    steps.push(snap(arr, [], [], [...sorted], comps, swps));

    for (let i = end; i > start; i--) {
      comps++;
      steps.push(snap(arr, [i - 1, i], [], [...sorted], comps, swps));
      if (arr[i] < arr[i - 1]) {
        [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
        swps++;
        steps.push(snap(arr, [], [i - 1, i], [...sorted], comps, swps));
      }
    }
    sorted.add(start);
    start++;
    steps.push(snap(arr, [], [], [...sorted], comps, swps));
  }
  sorted.add(start);
  steps.push(snap(arr, [], [], [...sorted], comps, swps));
  return steps;
}

function generateCombSteps(input) {
  const arr = [...input];
  const steps = [];
  const sorted = new Set();
  let comps = 0, swps = 0;
  const n = arr.length;

  let gap = n;
  let done = false;
  while (!done) {
    gap = Math.floor(gap / 1.3);
    if (gap <= 1) { gap = 1; done = true; }
    for (let i = 0; i + gap < n; i++) {
      comps++;
      steps.push(snap(arr, [i, i + gap], [], [...sorted], comps, swps));
      if (arr[i] > arr[i + gap]) {
        [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
        swps++;
        done = false;
        steps.push(snap(arr, [], [i, i + gap], [...sorted], comps, swps));
      }
    }
  }
  for (let x = 0; x < n; x++) sorted.add(x);
  steps.push(snap(arr, [], [], [...sorted], comps, swps));
  return steps;
}

const ALGORITHM_MAP = {
  bubble:    generateBubbleSteps,
  selection: generateSelectionSteps,
  insertion: generateInsertionSteps,
  merge:     generateMergeSteps,
  quick:     generateQuickSteps,
  heap:      generateHeapSteps,
  shell:     generateShellSteps,
  cocktail:  generateCocktailSteps,
  comb:      generateCombSteps,
};

// ── Helpers ────────────────────────────────────────────────────────────────
function randomArray(size) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 88) + 8);
}

function getBarColor(idx, step) {
  if (!step)                        return "bg-indigo-500";
  if (step.sorted.includes(idx))    return "bg-green-500";
  if (step.swapping.includes(idx))  return "bg-red-500";
  if (step.comparing.includes(idx)) return "bg-yellow-400";
  return "bg-indigo-500";
}

// ── Component ──────────────────────────────────────────────────────────────
export default function SortingVisualizer() {
  const [array, setArray]             = useState(() => randomArray(50));
  const [displayStep, setDisplayStep] = useState(null);
  const [isSorting, setIsSorting]     = useState(false);
  const [isPaused, setIsPaused]       = useState(false);
  const [isComplete, setIsComplete]   = useState(false);
  const [algorithm, setAlgorithm]     = useState("bubble");
  const [speed, setSpeed]             = useState(50);
  const [arraySize, setArraySize]     = useState(50);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps]             = useState(0);
  const [elapsedTime, setElapsedTime] = useState("0.0");

  const stepIndexRef     = useRef(0);
  const stepsRef         = useRef([]);
  const speedRef         = useRef(speed);
  const animFrameRef     = useRef(null);
  const isPausedRef      = useRef(false);
  const lastFrameTimeRef = useRef(0);
  const startTimeRef      = useRef(0);
  const timerIntervalRef  = useRef(null);
  const pausedElapsedRef  = useRef(0);
  const originalArrayRef = useRef([...array]);

  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(timerIntervalRef.current);
    };
  }, []);

  const stopAll = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    clearInterval(timerIntervalRef.current);
  }, []);

  const runAnimationLoop = useCallback(() => {
    function frame(timestamp) {
      animFrameRef.current = requestAnimationFrame(frame);

      if (isPausedRef.current) {
        lastFrameTimeRef.current = timestamp;
        return;
      }

      if (timestamp - lastFrameTimeRef.current < speedToMs(speedRef.current)) return;
      lastFrameTimeRef.current = timestamp;

      const idx = stepIndexRef.current;
      const allSteps = stepsRef.current;

      if (idx >= allSteps.length) {
        cancelAnimationFrame(animFrameRef.current);
        clearInterval(timerIntervalRef.current);
        setIsSorting(false);
        setIsComplete(true);
        return;
      }

      const step = allSteps[idx];
      setArray(step.bars);
      setDisplayStep(step);
      setComparisons(step.comparisons);
      setSwaps(step.swaps);
      stepIndexRef.current = idx + 1;
    }

    lastFrameTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(frame);
  }, []);

  const handleNewArray = useCallback(() => {
    stopAll();
    const newArr = randomArray(arraySize);
    originalArrayRef.current = [...newArr];
    setArray(newArr);
    setDisplayStep(null);
    setIsSorting(false);
    setIsPaused(false);
    setIsComplete(false);
    setComparisons(0);
    setSwaps(0);
    setElapsedTime("0.0");
    stepIndexRef.current = 0;
    stepsRef.current = [];
    isPausedRef.current = false;
  }, [arraySize, stopAll]);

  const handleSort = useCallback(() => {
    stopAll();
    const currentArr = [...array];
    const generatedSteps = ALGORITHM_MAP[algorithm](currentArr);
    stepsRef.current = generatedSteps;
    stepIndexRef.current = 0;
    isPausedRef.current = false;

    setIsSorting(true);
    setIsPaused(false);
    setIsComplete(false);
    setComparisons(0);
    setSwaps(0);
    setElapsedTime("0.0");
    setDisplayStep(null);

    startTimeRef.current = Date.now();
    pausedElapsedRef.current = 0;
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(((Date.now() - startTimeRef.current) / 1000).toFixed(1));
    }, 100);

    runAnimationLoop();
  }, [algorithm, array, stopAll, runAnimationLoop]);

  const handlePauseResume = useCallback(() => {
    const next = !isPausedRef.current;
    isPausedRef.current = next;
    setIsPaused(next);

    if (next) {
      // Pausing — stop the timer and save elapsed ms so far
      clearInterval(timerIntervalRef.current);
      pausedElapsedRef.current = Date.now() - startTimeRef.current;
    } else {
      // Resuming — shift startTime forward so elapsed continues from where it stopped
      startTimeRef.current = Date.now() - pausedElapsedRef.current;
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime(((Date.now() - startTimeRef.current) / 1000).toFixed(1));
      }, 100);
    }
  }, []);

  const handleReset = useCallback(() => {
    stopAll();
    setArray([...originalArrayRef.current]);
    setDisplayStep(null);
    setIsSorting(false);
    setIsPaused(false);
    setIsComplete(false);
    setComparisons(0);
    setSwaps(0);
    setElapsedTime("0.0");
    stepIndexRef.current = 0;
    stepsRef.current = [];
    isPausedRef.current = false;
  }, [stopAll]);

  const handleSizeChange = useCallback((e) => {
    const size = Number(e.target.value);
    setArraySize(size);
    if (!isSorting) {
      const newArr = randomArray(size);
      originalArrayRef.current = [...newArr];
      setArray(newArr);
      setDisplayStep(null);
      setIsComplete(false);
      setComparisons(0);
      setSwaps(0);
      setElapsedTime("0.0");
    }
  }, [isSorting]);

  const btn = "px-4 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center p-4 gap-4">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
        <h1 className="text-2xl font-bold tracking-tight text-indigo-400">Sorting Visualizer</h1>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          disabled={isSorting}
          className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <option value="bubble">Bubble Sort</option>
          <option value="selection">Selection Sort</option>
          <option value="insertion">Insertion Sort</option>
          <option value="merge">Merge Sort</option>
          <option value="quick">Quick Sort</option>
          <option value="heap">Heap Sort</option>
          <option value="shell">Shell Sort</option>
          <option value="cocktail">Cocktail Sort</option>
          <option value="comb">Comb Sort</option>
        </select>
      </div>

      {/* Bar visualizer */}
      <div className="flex items-end gap-px w-full max-w-5xl h-72 bg-zinc-900 rounded-lg px-2 py-1">
        {array.map((value, idx) => (
          <div
            key={idx}
            className={`flex-1 rounded-t-sm transition-all duration-75 ${getBarColor(idx, displayStep)}`}
            style={{ height: `${value}%` }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-center items-center">
        <label className="flex flex-col items-center gap-1 text-xs text-zinc-400">
          Speed
          <input
            type="range" min={1} max={100} value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="accent-indigo-500 w-32 cursor-pointer"
          />
        </label>
        <label className="flex flex-col items-center gap-1 text-xs text-zinc-400">
          Array Size
          <input
            type="range" min={10} max={120} value={arraySize}
            onChange={handleSizeChange}
            disabled={isSorting}
            className="accent-indigo-500 w-32 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </label>
        <button onClick={handleNewArray} disabled={isSorting} className={`${btn} bg-zinc-700 hover:bg-zinc-600`}>
          New Array
        </button>
        <button onClick={handleSort} disabled={isSorting} className={`${btn} bg-indigo-600 hover:bg-indigo-500`}>
          Sort
        </button>
        {isSorting && (
          <button onClick={handlePauseResume} className={`${btn} bg-amber-600 hover:bg-amber-500`}>
            {isPaused ? "Resume" : "Pause"}
          </button>
        )}
        <button onClick={handleReset} disabled={isSorting && !isPaused} className={`${btn} bg-zinc-700 hover:bg-zinc-600`}>
          Reset
        </button>
      </div>

      {/* Stats + Complexity */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-5xl justify-center items-start">

        {/* Live stats */}
        <div className="bg-zinc-900 rounded-lg p-4 flex gap-6 flex-wrap justify-center">
          <div className="flex flex-col items-center">
            <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Comparisons</span>
            <span className="text-2xl font-mono font-semibold text-yellow-400">{comparisons.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Swaps</span>
            <span className="text-2xl font-mono font-semibold text-red-400">{swaps.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Time</span>
            <span className="text-2xl font-mono font-semibold text-green-400">{elapsedTime}s</span>
          </div>
          {isComplete && (
            <div className="flex items-center">
              <span className="text-green-400 font-semibold text-sm">Sorted!</span>
            </div>
          )}
        </div>

        {/* Complexity table */}
        <div className="bg-zinc-900 rounded-lg p-4 overflow-x-auto flex-1">
          <table className="text-sm w-full min-w-[340px]">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
                <th className="text-left pb-2 pr-4">Algorithm</th>
                <th className="text-center pb-2 px-3">Best</th>
                <th className="text-center pb-2 px-3">Average</th>
                <th className="text-center pb-2 px-3">Worst</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(COMPLEXITY).map(([key, val]) => (
                <tr key={key} className={algorithm === key ? "bg-zinc-700 text-white" : "text-zinc-400"}>
                  <td className="py-1.5 pr-4 font-medium pl-2 rounded-l-md">{val.name}</td>
                  <td className="text-center py-1.5 px-3 font-mono text-xs">{val.best}</td>
                  <td className="text-center py-1.5 px-3 font-mono text-xs">{val.average}</td>
                  <td className="text-center py-1.5 px-3 font-mono text-xs rounded-r-md">{val.worst}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
