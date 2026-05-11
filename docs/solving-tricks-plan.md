# Nonogram Solving Tricks — Integration Plan

## Current State

| File | What it does |
|------|-------------|
| `fullLengthTrick.ts` | If `sum(clues) + (n-1) == lineLength` → fill the unique placement |
| `extFullLengthTrick.ts` | Same, but first trims leading/trailing `crossed` cells from the line |
| `solutionUtilities.ts` | Entry point — currently only calls `solveFullLength_Extend` |

---

## Foundation: Line Trimming

All tricks below operate on a **trimmed line** — a sub-range of the original line
with known-dead cells removed from both ends.

### Two-pass trim

**Pass 1 — trim crossed cells** (already done in `extFullLengthTrick.ts`)
```
start = first index where cell != 'crossed'
end   = last  index where cell != 'crossed'
trimmedLine = cells[start..end]
```

**Pass 2 — trim confirmed filled groups** (new)
```
if cells[start..start+num[0]-1] are all 'filled'
  AND cells[start+num[0]] == 'crossed' (or out of range)
  → advance start by num[0]+1, remove num[0] from clues front
repeat symmetrically from end
```

This produces `trimmedLine`, `trimmedClues`, and the `offset` mapping back to the
original line's indices.

**File:** `src/utilities/solutions/trimLine.ts`

---

## Trick 1 — Simple Crosses

**Condition:** clue has N numbers; exactly N filled cells exist in the line;
the distance between any two adjacent filled cells is greater than the max of the
two clue numbers that could "bridge" them.

**Algorithm (for 2-clue case, generalises by induction):**
```
filled positions = [p1, p2, ..., pN]   (sorted)
gap(i, i+1) = p(i+1) - p(i) - 1

if gap > max(clue[i], clue[i+1]):
  → cells p(i) belongs to clue[i], p(i+1) belongs to clue[i+1]
  → cross everything outside [p(i) - clue[i] + 1 .. p(i) + clue[i] - 1]
     and         outside [p(i+1) - clue[i+1] + 1 .. p(i+1) + clue[i+1] - 1]
```

**Output:** in addition to marking crosses, this trick returns a `pins` array:
```typescript
type Pin = { pos: number; clueIdx: number };
// pos: cell index in trimmed line
// clueIdx: which clue number that cell is confirmed to belong to
```

This pin information feeds directly into the **Pin-constrained Overlapping** step below.

**File:** `src/utilities/solutions/simpleCrossTrick.ts`

---

## Trick 2 — Overlapping Trick

Slide each clue block from its leftmost to rightmost legal position. Any cell
covered in **all** legal positions is guaranteed `filled`.

### Mode A — Standard (no pins)

**Algorithm (on trimmed line):**
```
For first clue number num[0]:
  slack = trimmedLength - (sum of all clues + min spaces)
       = trimmedLength - (totalClues + clueCount - 1)
  leftStart  = 0
  rightStart = slack              (= leftStart + slack)
  overlap    = cells [rightStart .. leftStart + num[0] - 1]
             = cells [slack .. num[0] - 1]          (if slack < num[0])
  → mark overlap cells as 'filled'

Repeat symmetrically for last clue number from the right end.

For clues in the middle: accumulate left-offset for each preceding clue,
compute its window, and find its overlap.
```

Formally, the overlap for clue `i` at minimum offset `lo`:
```
lo = sum(clues[0..i-1]) + i          (min left boundary of clue i)
hi = trimmedLength - sum(clues[i..N-1]) - (N - 1 - i)  (max right boundary)
overlap = [hi - num[i] + 1 .. lo + num[i] - 1]   (if hi - num[i] + 1 <= lo + num[i] - 1)
```

### Mode B — Pin-constrained (uses Simple Crosses output)

When Simple Crosses has pinned cell `p(i)` to `clue[i]`, the block's slide range is
tightened by the adjacent pins. This exposes a larger overlap zone — the **center cells**.

**Algorithm for each pin `{pos: p, clueIdx: i, num: clue[i]}`:**
```
// Tightest left boundary: can't start before trimmedStart, and must start
// after the previous pinned block has ended (+ 1 gap cell).
leftBound = max(
  p - num + 1,                        // leftmost start that still covers p
  trimmedStart,
  pins[i-1].pos + 2                   // after previous pin (if exists)
)

// Tightest right boundary: must start at most at p (to cover p),
// and must end before the next pinned block begins (- 1 gap cell).
rightBound = min(
  p,                                  // rightmost start that still covers p
  trimmedEnd - num + 1,
  pins[i+1].pos - num - 1             // must end before next pin (if exists)
)

// Overlap: cells covered by ALL legal placements of this block
overlapStart = rightBound
overlapEnd   = leftBound + num - 1

if overlapStart <= overlapEnd:
  → mark cells [overlapStart .. overlapEnd] as 'filled'   // center cells!
```

**Concrete example:**

```
Line (length 10):  _ F _ _ _ _ _ _ F _
                   0 1 2 3 4 5 6 7 8 9
Clues: [4, 4]
Filled at: p1=1, p2=8
Gap = 6 > max(4,4)=4  ✓  → Simple Crosses pins: {p=1, num=4}, {p=8, num=4}

Block 0 (p=1, num=4):
  leftBound  = max(1-4+1=−2 → 0,  no prev pin)  = 0
  rightBound = min(1,  8-4-1=3)                  = 1
  overlap    = [1, 0+4−1=3]  → cells 1,2,3 filled  (cells 2,3 are new ✓)

Block 1 (p=8, num=4):
  leftBound  = max(8-4+1=5,  1+4+1=6)            = 6
  rightBound = min(8,  9-4+1=6)                  = 6
  overlap    = [6, 6+4−1=9]  → cells 6,7,8,9 filled  (cells 6,7,9 are new ✓)

Result: _ F F F _ _ F F F F   (5 new filled cells from pins alone)
```

**File:** `src/utilities/solutions/overlappingTrick.ts`

---

## Trick 3 — Spreading Trick

When a filled cell is near the edge of the trimmed line and must be part of
the first (or last) clue, the clue extends further inward.

**Algorithm:**
```
firstFilled = first 'filled' index in trimmedLine
x = firstFilled - trimmedStart        (distance from left edge)
ac = clues[0] - x
if ac > 0:
  → mark cells [firstFilled + 1 .. firstFilled + ac - 1] as 'filled'

Symmetrically from right:
lastFilled = last 'filled' index in trimmedLine
x = trimmedEnd - lastFilled
ac = clues[last] - x
if ac > 0:
  → mark cells [lastFilled - ac + 1 .. lastFilled - 1] as 'filled'
```

**File:** `src/utilities/solutions/spreadingTrick.ts`

---

## Trick 4 — Forcing Trick

When a crossed cell is close to the edge, no clue block can fit before it, so
all cells between the edge and the cross must also be crossed.

**Algorithm:**
```
firstCrossed = first 'crossed' index in trimmedLine
x = firstCrossed - trimmedStart
if x < clues[0]:
  → mark cells [trimmedStart .. firstCrossed - 1] as 'crossed'
  → recurse with updated trimmedStart

Symmetrically from right:
lastCrossed = last 'crossed' index in trimmedLine
x = trimmedEnd - lastCrossed
if x < clues[last]:
  → mark cells [lastCrossed + 1 .. trimmedEnd] as 'crossed'
  → recurse with updated trimmedEnd
```

**File:** `src/utilities/solutions/forcingTrick.ts`

---

## Trick 5 — Joining and Splitting Trick

When two filled cells are separated by exactly one empty cell, that gap cell
may force a cross or a fill.

**Split (cross the gap):**
```
if cells[i] == 'filled' AND cells[i+1] == 'empty' AND cells[i+2] == 'filled':
  groupLeft  = run length ending at i
  groupRight = run length starting at i+2
  merged     = groupLeft + 1 + groupRight
  if merged > clues[0] (for a left group) OR merged > clues[last] (for right group):
    → cells[i+1] = 'crossed'
```

**Join (fill the gap → now two known groups):**
```
After the gap is confirmed 'crossed':
  groupLeft  corresponds to clues[j]   for some j
  groupRight corresponds to clues[j+1]
  → fill/extend each group to match its clue value
    using overlapping / spreading logic on the sub-ranges
```

**File:** `src/utilities/solutions/joiningTrick.ts`

---

## Trick 6 — Remain Trick

When all clue blocks have been placed (filled cells already form the exact
pattern described by the clues), every remaining `empty` cell must be `crossed`.

**Algorithm:**
```
runs = extract consecutive 'filled' runs from line
if runs == clues (exact sequence match):
  → mark all 'empty' cells as 'crossed'
```

**File:** `src/utilities/solutions/remainTrick.ts`

---

## Trick 7 — Contradictions (Backtracking)

Last resort after deterministic tricks converge. Only triggered when at least
one cell remains `empty` after `max(rows, cols)` full passes.

**Algorithm:**
```
snapshot = deepCopy(cells)
for each 'empty' cell in reading order:
  try cells[r][c] = 'crossed'
  propagate all deterministic tricks
  if valid (no contradictions):
    continue to next empty cell
  else:
    restore from snapshot
    cells[r][c] = 'filled'
    propagate all deterministic tricks
    if valid:
      continue
    else:
      backtrack: pop snapshot stack, mark previous cell 'filled', reset all later cells to 'empty'
```

Uses an explicit snapshot stack (no recursion limit risk).

**File:** `src/utilities/solutions/contradictionTrick.ts`

---

## Solver Pipeline

### Loop structure (`solutionUtilities.ts`)

```typescript
function solveNonogram(model): SolveResult {
  let current = applyHints(model);        // already in extFullLengthTrick
  const passes = Math.max(model.rows, model.cols);

  for (let i = 0; i < passes; i++) {
    let changed = false;
    for each row and column:
      current = trimLine(current)
      current = applyFullLengthTrick(current)
      current = applyRemainTrick(current)
      current = applyOverlappingTrick(current)          // Mode A: standard
      current = applySpreadingTrick(current)
      current = applyForcingTrick(current)
      const { line, pins } = applySimpleCrossTrick(current)
      current = line
      current = applyOverlappingTrick(current, pins)    // Mode B: pin-constrained
      current = applyJoiningTrick(current)
      changed |= anyCellChanged
    if (!changed) break;
  }

  if (!isSolved(current)):
    current = applyContradictionTrick(current)

  return buildResult(current)
}
```

### Execution order rationale

| Order | Trick | Why here |
|-------|-------|----------|
| 1 | Trim line | Prerequisite — narrows search space for all others |
| 2 | Full length | Cheapest complete solver; eliminates lines immediately |
| 3 | Remain | Cheaply closes fully-solved lines |
| 4 | Overlapping (Mode A) | Standard arithmetic pass; no prior cell info needed |
| 5 | Spreading | Extends overlapping results using existing fills |
| 6 | Forcing | Extends trimming using existing crosses |
| 7 | Simple crosses | Requires N fills to already exist; produces `pins[]` |
| 8 | Overlapping (Mode B) | Pin-constrained; uses `pins[]` from step 7 to fill center cells |
| 9 | Joining/splitting | Requires adjacent fills to already exist |
| 10 | Contradictions | Expensive; last resort only |

> Steps 7 → 8 are always run back-to-back: Simple Crosses produces pins, and
> pin-constrained Overlapping immediately consumes them before the pins become stale.

---

## Proposed File Structure

```
src/utilities/solutions/
  fullLengthTrick.ts          ✅ exists
  extFullLengthTrick.ts       ✅ exists (trim crossed + full-length)
  trimLine.ts                 🆕 trim crossed + trim confirmed filled groups
  overlappingTrick.ts         🆕 overlap / slack trick
  spreadingTrick.ts           🆕 spreading trick
  forcingTrick.ts             🆕 forcing trick
  simpleCrossTrick.ts         🆕 simple crosses trick
  joiningTrick.ts             🆕 joining and splitting trick
  remainTrick.ts              🆕 remain trick
  contradictionTrick.ts       🆕 backtracking trick
src/utilities/
  solutionUtilities.ts        🔧 update to orchestrate all tricks
```

Each file exports a function with the signature:
```typescript
function applyXxxTrick(
  line: CellState[],
  clues: number[],
): CellState[]
```

`solutionUtilities.ts` maps each trick over all rows then all columns per pass.

---

## References

- [Tips for solving — Nonograms Katana Wiki](https://nonograms-katana.fandom.com/wiki/Tips_for_solving)
- [How to Solve Nonogram — NonogramOnline](https://nonogramonline.app/blog/how-to-solve-nonogram-step-by-step-guide-for-beginners)
