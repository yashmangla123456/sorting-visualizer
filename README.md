# Sorting Visualizer

An interactive sorting algorithm visualizer built with React and Vite. Watch algorithms sort arrays in real time with live stats for comparisons, swaps, and elapsed time.

## Features

- 9 sorting algorithms with step-by-step visualization
- Adjustable speed (1–100) and array size (10–120)
- Live comparisons, swaps, and elapsed time tracking
- Pause / Resume / Reset controls
- Color-coded bars: yellow = comparing, red = swapping, green = sorted
- Complexity reference table highlighting the active algorithm

## Getting Started

```bash
npm install
npm run dev
```

---

## Algorithms

### 1. Bubble Sort
Repeatedly steps through the array, compares adjacent elements, and swaps them if they are in the wrong order. Each full pass "bubbles" the largest unsorted element to its correct position at the end.

| Best | Average | Worst |
|------|---------|-------|
| O(n) | O(n²)   | O(n²) |

- **Space:** O(1)
- **Stable:** Yes
- Best case occurs when the array is already sorted (no swaps needed in any pass).

---

### 2. Selection Sort
Finds the minimum element in the unsorted portion and swaps it into the next position. After each pass, the sorted region at the front grows by one.

| Best  | Average | Worst |
|-------|---------|-------|
| O(n²) | O(n²)   | O(n²) |

- **Space:** O(1)
- **Stable:** No
- Always makes exactly n−1 swaps regardless of input, making it useful when write operations are expensive.

---

### 3. Insertion Sort
Builds a sorted sub-array one element at a time by taking each new element and inserting it into its correct position within the already-sorted portion.

| Best | Average | Worst |
|------|---------|-------|
| O(n) | O(n²)   | O(n²) |

- **Space:** O(1)
- **Stable:** Yes
- Extremely efficient on small or nearly-sorted arrays. Used internally by many hybrid algorithms (e.g., Timsort) for small partitions.

---

### 4. Merge Sort
A divide-and-conquer algorithm. Recursively splits the array in half, sorts each half, then merges them back together in sorted order.

| Best       | Average    | Worst      |
|------------|------------|------------|
| O(n log n) | O(n log n) | O(n log n) |

- **Space:** O(n)
- **Stable:** Yes
- Guarantees O(n log n) in all cases. Preferred for linked lists and external sorting (e.g., sorting data on disk).

---

### 5. Quick Sort
Picks a pivot element, partitions the array so that elements less than the pivot are on the left and greater elements are on the right, then recursively sorts each partition.

| Best       | Average    | Worst |
|------------|------------|-------|
| O(n log n) | O(n log n) | O(n²) |

- **Space:** O(log n) average (recursion stack)
- **Stable:** No
- Worst case occurs on already-sorted or reverse-sorted input with a naive pivot choice. In practice it is often the fastest comparison sort due to cache efficiency.

---

### 6. Heap Sort
Builds a max-heap from the array, then repeatedly extracts the maximum element (root) and places it at the end. The heap is rebuilt after each extraction.

| Best       | Average    | Worst      |
|------------|------------|------------|
| O(n log n) | O(n log n) | O(n log n) |

- **Space:** O(1)
- **Stable:** No
- Guaranteed O(n log n) with no extra memory. Slower in practice than Quick Sort due to poor cache locality, but useful when worst-case guarantees matter.

---

### 7. Shell Sort
A generalization of Insertion Sort. Instead of comparing adjacent elements, it first sorts elements far apart (using a "gap"), then progressively reduces the gap until it reaches 1 (a final insertion sort pass).

| Best       | Average    | Worst |
|------------|------------|-------|
| O(n log n) | O(n log²n) | O(n²) |

- **Space:** O(1)
- **Stable:** No
- Performance depends on the gap sequence used. This visualizer uses the simple halving sequence (gap = n/2, n/4, …, 1). Significantly faster than plain Insertion Sort for medium-sized arrays.

---

### 8. Cocktail Shaker Sort (Bidirectional Bubble Sort)
An extension of Bubble Sort that alternates direction each pass — one forward pass bubbles the largest element to the right, then one backward pass bubbles the smallest element to the left.

| Best | Average | Worst |
|------|---------|-------|
| O(n) | O(n²)   | O(n²) |

- **Space:** O(1)
- **Stable:** Yes
- Slightly more efficient than Bubble Sort because it reduces the effect of "turtles" — small values near the end of the array that move very slowly with standard Bubble Sort.

---

### 9. Comb Sort
Improves on Bubble Sort by eliminating small values (turtles) near the end early. Uses a gap larger than 1 that shrinks by a factor of 1.3 on each pass until it reaches 1.

| Best       | Average   | Worst |
|------------|-----------|-------|
| O(n log n) | O(n²/2ᵖ) | O(n²) |

- **Space:** O(1)
- **Stable:** No
- The shrink factor of 1.3 is empirically optimal. Much faster than Bubble Sort in practice, especially on random data.

---

## Color Legend

| Color  | Meaning             |
|--------|---------------------|
| Indigo | Unsorted / default  |
| Yellow | Being compared      |
| Red    | Being swapped       |
| Green  | In final sorted position |
