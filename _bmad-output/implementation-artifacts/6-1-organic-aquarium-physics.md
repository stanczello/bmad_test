# Story 6-1: Organic Aquarium Physics

Status: done

## Story

As a participant,
I want aquarium shapes to drift freely and organically within the aquarium,
so that the shared experience feels alive, calm, and visually engaging.

## Acceptance Criteria

1. Given connected participants viewing the aquarium, when shapes are rendered, then each shape moves with an independent velocity vector within a defined 3D bounding box.

2. Given a shape approaching the bounding box boundary, when physics simulation runs, then the shape curves smoothly back inward without teleporting or hard-snapping.

3. Given multiple shapes in proximity, when the simulation detects potential overlap, then shapes deflect smoothly to avoid collision rather than stacking.

4. Given the aquarium displays all active team shapes, when up to 50 shapes are rendered, then animation maintains stable performance at ≥30 fps on mid-tier workplace hardware.

5. Given the physics simulation runs each frame, when velocity changes occur, then changes are gradual and damped with bounded per-frame acceleration to preserve calm, organic visual tone.

6. Given a client running organic physics simulation, when shapes move and change position, then no velocity or position data is transmitted to the server or persisted.

7. Given a participant observing the aquarium, when new shapes are added to the synchronized feed, then they join the active physics simulation at their synchronized position with randomized initial velocity.

8. Given the aquarium experiences a reset event, when the cycle resets, then all shapes are cleared and the physics system reinitializes for the new cycle.

## Dev Agent Context

### Epic 6: Aquarium Polish

This is the first story in Epic 6, which focuses on visual enhancement and organic behavior refinement of the aquarium experience. Epic 6 is built on top of fully-completed Epics 1–5 and requires no server-side changes.

**Epics 1–5 are complete.** This story depends on a stable, functional aquarium baseline already receiving synchronized shape data from the server.

### Current AquariumCanvas Implementation Analysis

**Location:** `emotional-aquarium-client/src/renderer/src/components/aquarium/AquariumCanvas.tsx`

**Current Behavior:**
- Shapes are rendered in a static grid layout using predefined grid positions.
- Each shape performs simple sine-wave bobbing animation in the Y axis.
- Shapes rotate based on elapsed time.
- No physics simulation, no velocity vectors, no collision detection, no bounding box constraints.
- Uses React Three Fiber `useFrame` hook for animation loop.
- Currently supports up to 8 shapes per shape-type rendered in 4 columns.

**Key Component Properties:**
```typescript
type FloatingShapeProps = {
  shape: string           // circle | triangle | square | wave | arc
  position: [number, number, number]  // Initial render position [x, y, z]
  color: string           // Hex color code
  speed: number           // Animation speed multiplier
  phase: number           // Animation phase offset (radians)
  isOwn: boolean          // Whether this is user's own submission
}
```

**Current Rendering Pattern:**
- Grid layout with 4 columns and automatic row calculation.
- Spacing: 1.6 units between positions.
- Simple animation: `position.y = position[1] + Math.sin(t) * 0.3` (bobbing)
- Rotation applied every frame based on time.

**What Must Be Preserved:**
- React Three Fiber and Canvas setup
- Geometry creation for each shape type (sphere, cone, box, torus, torus knot)
- Material color and metadata (isOwn detection for gold metalness)
- Shape color palette and isOwn highlighting
- Empty-state wireframe sphere display when no shapes exist
- Responsiveness to snapshot updates from server

---

## Requirements Breakdown

### FR58: Independent Velocity Vectors and Free Drifting

**Requirement:** Each shape must have an independent 3D velocity vector that allows it to drift freely throughout a defined bounding box.

**Implementation Strategy:**
- **Bounding Box:** Define a realistic aquarium viewing volume:
  - X range: [-8, 8] (16 units wide)
  - Y range: [0, 12] (12 units tall, visible above and below center)
  - Z range: [-4, 4] (8 units deep for parallax effect)
  - Camera positioned at [0, 6, 10] looking toward [0, 6, 0] to keep box centered in view.

- **Velocity System:**
  - Each shape maintains a velocity vector: `{ vx, vy, vz }` in units/second.
  - Initialize new shapes with random velocity: `vx, vy, vz ∈ [-2.0, 2.0]` units/second.
  - Update positions each frame: `position += velocity * deltaTime`.

- **State Management:**
  - Store velocity vectors in a mutable ref or Zustand store scoped to the AquariumCanvas component.
  - Create shape physics state: `Map<shapeId, { position: [x, y, z], velocity: [vx, vy, vz] }>`.
  - Sync this state with the mesh positions each frame in `useFrame`.

### FR59: Soft Wall Repulsion

**Requirement:** When a shape approaches a bounding box edge, it must curve smoothly back inward without teleporting or hard-snapping.

**Implementation Strategy:**
- **Soft Boundary Detection:**
  - Define a repulsion zone: 1.5 units from each boundary.
  - When a shape enters the repulsion zone, apply a smooth inward force.

- **Repulsion Algorithm (Spring-like):**
  ```typescriptish
  // Pseudo-code for soft wall repulsion
  const boundary = { min: -8, max: 8 };  // example for x-axis
  const repulsionZone = 1.5;
  const repulsionStrength = 0.8;  // Damped spring-like behavior
  
  if (position.x < boundary.min + repulsionZone) {
    // Near minimum boundary, push inward
    acceleration.x += (boundary.min + repulsionZone - position.x) * repulsionStrength;
  } else if (position.x > boundary.max - repulsionZone) {
    // Near maximum boundary, push inward
    acceleration.x -= (position.x - (boundary.max - repulsionZone)) * repulsionStrength;
  }
  ```

- **Velocity Damping on Boundary:**
  - When force is applied, also dampen velocity component toward the boundary.
  - Damping factor: `0.98` (per frame), to prevent oscillation.

- **No Hard Clamps:**
  - Never directly clamp position to boundary.
  - Always use smooth acceleration/repulsion to create organic curving behavior.

### FR60: Proximity-Based Deflection

**Requirement:** Shapes must deflect smoothly to avoid visual overlap, using smooth re-routing rather than hard collision response.

**Implementation Strategy:**
- **Proximity Check:**
  - For each shape, check distance to all other shapes within a detection radius.
  - Detection radius: `0.8` units (roughly 2× shape visual size).
  - Use spatial partitioning (grid-based) to avoid O(n²) checks for 50 shapes:
    - Divide bounding box into 4×6×2 grid cells (48 cells total).
    - Each frame, assign shapes to cells and only check proximity within neighboring cells.

- **Deflection Algorithm (Soft Repulsion):**
  ```typescriptish
  // Pseudo-code for shape-to-shape deflection
  const detectionRadius = 0.8;
  const deflectionStrength = 0.6;
  
  for (const otherShape of nearbyShapes) {
    const distance = distanceBetween(shape.position, otherShape.position);
    
    if (distance < detectionRadius && distance > 0.01) {
      // Calculate unit vector away from other shape
      const direction = normalize(shape.position - otherShape.position);
      
      // Apply smooth acceleration away (not instant velocity change)
      acceleration += direction * deflectionStrength * (1 - distance / detectionRadius);
    }
  }
  ```

- **Smoothness:**
  - Never apply sudden velocity changes.
  - Always apply acceleration over time to allow smooth, gradual steering.
  - Velocity damping `0.98` each frame keeps motion stable.

### FR61 & NFR33: Performance at 50 Shapes with ≥30 FPS

**Requirement:** Physics simulation must remain performant up to 50 shapes on mid-tier hardware, maintaining ≥30 fps.

**Performance Optimization Strategy:**
- **Spatial Partitioning:**
  - Use grid-based cell assignment to reduce proximity checks from O(50²) = 2500 to ~O(50 × 8) = ~400 per frame.
  - Cell grid: 4 cells wide (X) × 6 cells tall (Y) × 2 cells deep (Z).

- **Calculation Batching:**
  - All physics updates (velocity, acceleration, position, wall repulsion, deflection) happen in a single pass per frame.
  - Use typed arrays (Float32Array) for position/velocity data if using Zustand or custom state (reduces GC pressure).

- **Mesh Updates:**
  - Update mesh positions directly each frame: `mesh.position.copy(physicsState.position)`.
  - Avoid creating new Vector3 objects per frame; reuse or use array math.

- **Culling (Future):**
  - If performance degrades, implement frustum culling (don't render shapes far from camera).
  - This story does not require culling; only ensure base O(n) simulation scales to 50 shapes.

- **Benchmark Target:**
  - Profiled on mid-tier hardware (MacBook Air M1, Windows laptops with Intel i5/Ryzen 5).
  - Use React DevTools Profiler to verify frame times; target: mean ~33ms (30 fps).
  - No frame should exceed 50ms to prevent visible jank.

### FR62: Client-Side Only, No Server Sync

**Requirement:** Physics state must remain entirely client-side; no velocity or position data is shared or stored.

**Implementation Strategy:**
- **Physics State Scope:**
  - PhysicsState (velocity, acceleration, local position) exists only in the AquariumCanvas component or a scoped Zustand slice.
  - Never persist physics state to SQLite.
  - Never send physics state to server or other clients.

- **Server State Boundary:**
  - Server provides: `shape`, `color`, synchronized `count`, `isOwn` flag.
  - Server does NOT receive: velocity, position, or local animation data.

- **Client Reconciliation:**
  - When server sends new shapes (real-time WebSocket propagation), create new physics entities with randomized velocity.
  - When server sends reset or cycle change, clear physics state and reinitialize.

- **Determinism NOT Required:**
  - Each client runs physics independently; shapes may appear in different positions on different clients.
  - This is intentional and acceptable — the physics is purely aesthetic.

### NFR34: Gradual Velocity Changes and Bounded Acceleration

**Requirement:** No sudden directional snapping; maximum per-frame acceleration must be bounded to preserve calm tone.

**Implementation Strategy:**
- **Bounded Acceleration:**
  ```typescriptish
  // Maximum acceleration magnitude per frame
  const maxAccelerationPerFrame = 2.0;  // units/second²
  
  // Cap acceleration vector
  const accelerationMagnitude = length(acceleration);
  if (accelerationMagnitude > maxAccelerationPerFrame) {
    acceleration = (acceleration / accelerationMagnitude) * maxAccelerationPerFrame;
  }
  ```

- **Velocity Damping (Friction):**
  - Apply per-frame damping: `velocity *= 0.98`.
  - This prevents velocity from growing unbounded and keeps motion smooth.

- **Smooth Velocity Integration:**
  - Never directly set velocity; always update via accumulated acceleration.
  - Update rule: `velocity += acceleration * deltaTime; velocity *= 0.98;`
  - This creates soft, damped, organic-feeling motion.

---

## Implementation Plan

### Phase 1: Physics State and Core Loop

**File:** `emotional-aquarium-client/src/renderer/src/components/aquarium/AquariumCanvas.tsx`

1. **Create Physics Type Definitions:**
   ```typescript
   type PhysicsEntity = {
     id: string;
     position: [number, number, number];
     velocity: [number, number, number];
     acceleration: [number, number, number];
   }
   
   type PhysicsState = Map<string, PhysicsEntity>;
   ```

2. **Initialize Physics State:**
   - Use `useRef<PhysicsState>` to hold mutable physics state.
   - Create unique shape ID using `snapshot.shapes` index + shape type.
   - When entries change, create/remove physics entities accordingly.

3. **Implement Physics Update Loop:**
   - In `useFrame`, call a physics update function before rendering:
     ```typescript
     useFrame(({ clock, delta }) => {
       updatePhysics(physicsStateRef.current, delta, boundingBox);
       updateMeshPositions(meshRefsMap, physicsStateRef.current);
     });
     ```

4. **Update Mesh Positions:**
   - Map physics state back to mesh positions.
   - Keep rotation animation as is (can remain independent of physics).

### Phase 2: Bounding Box and Soft Wall Repulsion

**File:** `emotional-aquarium-client/src/renderer/src/components/aquarium/AquariumCanvas.tsx` or new `aquariumPhysics.ts`

1. **Define Bounding Box Constants:**
   ```typescript
   const AQUARIUM_BOUNDS = {
     x: { min: -8, max: 8 },
     y: { min: 0, max: 12 },
     z: { min: -4, max: 4 }
   };
   const REPULSION_ZONE = 1.5;
   const REPULSION_STRENGTH = 0.8;
   ```

2. **Implement Wall Repulsion Function:**
   ```typescript
   function applyWallRepulsion(
     entity: PhysicsEntity,
     bounds: typeof AQUARIUM_BOUNDS
   ): void {
     const { position, acceleration } = entity;
     const testAxis = (
       pos: number,
       min: number,
       max: number,
       axis: 0 | 1 | 2
     ) => {
       if (pos < min + REPULSION_ZONE) {
         const force = (min + REPULSION_ZONE - pos) * REPULSION_STRENGTH;
         acceleration[axis] += force;
       } else if (pos > max - REPULSION_ZONE) {
         const force = (pos - (max - REPULSION_ZONE)) * REPULSION_STRENGTH;
         acceleration[axis] -= force;
       }
     };
     
     testAxis(position[0], bounds.x.min, bounds.x.max, 0);
     testAxis(position[1], bounds.y.min, bounds.y.max, 1);
     testAxis(position[2], bounds.z.min, bounds.z.max, 2);
   }
   ```

3. **Velocity Damping on Boundary Approach:**
   - In the same function, dampen velocity toward the boundary:
     ```typescript
     // When wall repulsion is applied, reduce velocity toward boundary
     if (force applied in axis) {
       velocity[axis] *= 0.98;
     }
     ```

### Phase 3: Proximity-Based Deflection with Spatial Partitioning

**File:** New file `emotional-aquarium-client/src/renderer/src/utils/spatialGrid.ts`

1. **Create Spatial Grid Utility:**
   ```typescript
   type SpatialGrid = Map<string, Set<string>>;  // cellKey -> Set of entity IDs
   
   function buildSpatialGrid(
     entities: PhysicsState,
     boundingBox: typeof AQUARIUM_BOUNDS
   ): SpatialGrid {
     const grid: SpatialGrid = new Map();
     const cellSize = { x: 4, y: 2, z: 4 };  // 16/4, 12/6, 8/2
     
     for (const [id, entity] of entities) {
       const cellKey = getCellKey(entity.position, cellSize);
       if (!grid.has(cellKey)) grid.set(cellKey, new Set());
       grid.get(cellKey)!.add(id);
     }
     
     return grid;
   }
   
   function getNearbyCells(cellKey: string): string[] {
     // Return own cell key + 26 neighbor cells (3×3×3 cube minus self)
   }
   ```

2. **Implement Proximity Deflection:**
   ```typescript
   function applyProximityDeflection(
     entity: PhysicsEntity,
     grid: SpatialGrid,
     allEntities: PhysicsState
   ): void {
     const detectionRadius = 0.8;
     const deflectionStrength = 0.6;
     
     const neighborCells = getNearbyCells(getCellKey(entity.position));
     
     for (const cellKey of neighborCells) {
       const cellEntities = grid.get(cellKey) ?? new Set();
       
       for (const otherId of cellEntities) {
         if (otherId === entity.id) continue;
         
         const otherEntity = allEntities.get(otherId);
         if (!otherEntity) continue;
         
         const dist = distance(entity.position, otherEntity.position);
         if (dist < detectionRadius && dist > 0.01) {
           const dir = normalize(subtract(entity.position, otherEntity.position));
           const strength = deflectionStrength * (1 - dist / detectionRadius);
           entity.acceleration = add(entity.acceleration, scale(dir, strength));
         }
       }
     }
   }
   ```

### Phase 4: Bounded Acceleration and Velocity Damping

**File:** `emotional-aquarium-client/src/renderer/src/utils/spatialGrid.ts` or new `physicsUpdate.ts`

1. **Implement Physics Integration Step:**
   ```typescript
   function updatePhysicsStep(
     entity: PhysicsEntity,
     deltaTime: number
   ): void {
     const maxAccelerationPerFrame = 2.0;
     
     // Cap acceleration
     const accMag = magnitude(entity.acceleration);
     if (accMag > maxAccelerationPerFrame) {
       entity.acceleration = scale(
         entity.acceleration,
         maxAccelerationPerFrame / accMag
       );
     }
     
     // Integrate velocity
     entity.velocity = add(
       entity.velocity,
       scale(entity.acceleration, deltaTime)
     );
     
     // Apply damping (friction)
     entity.velocity = scale(entity.velocity, 0.98);
     
     // Reset acceleration for next frame
     entity.acceleration = [0, 0, 0];
     
     // Update position
     entity.position = add(entity.position, scale(entity.velocity, deltaTime));
   }
   ```

### Phase 5: Integration into AquariumCanvas

**File:** `emotional-aquarium-client/src/renderer/src/components/aquarium/AquariumCanvas.tsx`

1. **Replace current FloatingShape component logic:**
   - Remove the simple sine-wave animation.
   - Replace with physics-driven position updates.

2. **Main useFrame hook refactor:**
   ```typescript
   useFrame(({ clock, delta }) => {
     // Initialize physics state if needed
     if (!physicsStateRef.current.has(entry.key)) {
       createPhysicsEntity(entry, physicsStateRef.current);
     }
     
     // Update physics
     const spatialGrid = buildSpatialGrid(physicsStateRef.current, AQUARIUM_BOUNDS);
     for (const [id, entity] of physicsStateRef.current) {
       applyWallRepulsion(entity, AQUARIUM_BOUNDS);
       applyProximityDeflection(entity, spatialGrid, physicsStateRef.current);
       updatePhysicsStep(entity, delta);
     }
     
     // Update mesh positions
     updateMeshPositions(meshRefsMap, physicsStateRef.current);
   });
   ```

3. **Handle new shapes from server:**
   - When `snapshot.shapes` changes, add new physics entities.
   - When shapes are removed (reset), clear physics state.

---

## Code Patterns & Conventions

### Vector Math Utilities

Create `emotional-aquarium-client/src/renderer/src/utils/vectorMath.ts`:

```typescript
export type Vec3 = [number, number, number];

export const vectorMath = {
  add: (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  subtract: (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  scale: (v: Vec3, scalar: number): Vec3 => [v[0] * scalar, v[1] * scalar, v[2] * scalar],
  magnitude: (v: Vec3): number => Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2),
  normalize: (v: Vec3): Vec3 => {
    const mag = vectorMath.magnitude(v);
    return mag > 0 ? [v[0] / mag, v[1] / mag, v[2] / mag] : [0, 0, 0];
  },
  distance: (a: Vec3, b: Vec3): number => vectorMath.magnitude(vectorMath.subtract(b, a)),
};
```

### TypeScript Strict Mode

- All vector operations must be strictly typed.
- Use `as const` for readonly bounds and constants.
- Avoid `any` types; use generics where appropriate.

### File Organization

```
src/renderer/src/
├── components/aquarium/
│   ├── AquariumCanvas.tsx          (main canvas + FloatingShape refactor)
│   └── physicsHelpers.ts           (optional: wall repulsion, deflection logic)
├── utils/
│   ├── vectorMath.ts               (vector operations)
│   ├── spatialGrid.ts              (grid-based proximity)
│   └── physicsEngine.ts            (main physics loop)
├── types/
│   └── physics.ts                  (PhysicsEntity, PhysicsState types)
```

---

## Testing Strategy

### Unit Tests

**File:** `emotional-aquarium-client/tests/unit/utils/vectorMath.test.ts`

- Test vector operations: add, subtract, scale, normalize, distance.
- Verify numerical stability for edge cases (zero vectors, very small magnitudes).

**File:** `emotional-aquarium-client/tests/unit/utils/spatialGrid.test.ts`

- Test grid cell assignment for known position inputs.
- Verify neighbor cell lookup returns correct set (or nearby entities are found).

**File:** `emotional-aquarium-client/tests/unit/utils/physicsEngine.test.ts`

- Test bounded acceleration capping.
- Test velocity damping behavior over multiple frames.
- Test wall repulsion application.

### Component Tests

**File:** `emotional-aquarium-client/tests/component/AquariumCanvas.test.tsx`

- Render AquariumCanvas with mock snapshot (3–5 shapes).
- Verify shapes are rendered and positioned.
- Mock `useFrame` to simulate frame updates; verify physics state updates.
- Test that shapes do not escape bounding box over 10 simulated frames.

### Performance Tests

**File:** `emotional-aquarium-client/tests/performance/physicsPerf.test.ts`

- Simulate 50 shapes for 60 frames.
- Measure average frame time and frame variance.
- Assert mean frame time ≤ 33ms; p95 ≤ 50ms.
- Run on CI with representative hardware profiles.

### Visual Regression Tests (if available)

- Capture screenshots of 20-shape aquarium over 5 seconds.
- Verify no shapes visibly leave bounding box.
- Verify smooth motion (no jittering or sudden teleports).

---

## Edge Cases & Handling

| Edge Case | Handling Strategy |
|-----------|-------------------|
| **New shape spawns mid-simulation** | Assign random velocity and add to physics state immediately. Spatial grid updates next frame. |
| **Shape removed (reset/sync)** | Remove from physics state; mesh removal handled by React render. |
| **Exactly 0 shapes** | Physics state is empty; `useFrame` loop is no-op; empty-state wireframe renders. |
| **Exactly 1 shape** | Works normally; no proximity deflection triggered (no other shapes to deflect from). |
| **Exactly 50 shapes (max load)** | Spatial grid performs ~8 proximity checks per shape; total ~400 checks/frame. Frame time should remain ≤35ms. |
| **Velocity becomes zero** | Shape drifts toward wall via natural repulsion; damping keeps motion smooth. |
| **Shape at exact boundary** | Repulsion zone triggers, applies inward force; velocity damped to prevent oscillation. |
| **Two shapes occupy same position** | Proximity deflection is symmetric; both accelerate away at equal magnitude. Over frames, they separate smoothly. |
| **Delta time is very large** | Physics step scales linearly with delta; single large step is safer than many small steps for stability. R3F delta is capped at ~33ms anyway. |
| **Shape rotates during physics** | Rotation remains independent animation; position updated via physics; both updates apply each frame. |
| **New WebSocket shape added** | Mesh added to render; physics entity created with randomized velocity. No jittering due to state reconciliation. |
| **Aquarium has 0 fps (frozen frame)** | Physics state becomes stale; next frame catchup is O(1) update. No crash; motion resumes when frame resumes. |

---

## Performance Considerations

### Memory Usage

- **Per Shape:** ~144 bytes (3 Vec3 + ID string overhead).
- **50 Shapes:** ~7.2 KB active physics state.
- **Spatial Grid:** ~400 bytes (48 cells, sparse Map).
- **Total:** ~8 KB — negligible memory footprint.

### CPU Cycles per Frame

- **Spatial Grid Build:** O(n) = 50 operations (assign to cell).
- **Wall Repulsion:** O(n) = 50 × 3 axis checks = 150 ops.
- **Proximity Deflection:** ~O(n × 8) = 400 proximity checks, ~100 deflections applied.
- **Physics Integration:** O(n) = 50 × 6 math ops = 300 ops.
- **Total:** ~1000 simple arithmetic operations per frame ≈ <1ms on modern hardware.
- **Mesh Update:** Direct position copy to Three.js mesh ≈ <1ms.
- **Render:** Three.js geometry/shader culling + canvas render ≈ ~20ms (dependent on GPU, not physics).

**Expected Frame Budget:**
- Physics: ~2ms
- Mesh update: ~1ms
- Render: ~20–25ms
- **Total: 23–28ms → ~36–43 fps (safe margin above 30 fps requirement).**

### Optimization Opportunities (for future stories)

- Implement frustum culling if off-screen shapes need hiding.
- Use WebWorker for physics simulation (if CPU bottleneck discovered).
- Instanced rendering for large shape counts (not needed at 50).
- Reduce spatial grid resolution if detection accuracy can be loosened.

---

## Server-Side Considerations

**No changes required.** The server continues to:
- Provide authenticated shape snapshots via REST API.
- Push live shape updates via WebSocket.
- Persist submission count and shape metadata.

Client physics state is fully independent and never synchronized back to server.

---

## Smooth Integration with Existing Features

- **Snapshot subscriptions (Epic 3):** Continue to work; new shapes are added to physics simulation immediately.
- **Demo mode (Epic 3):** Demo shapes must also participate in physics; treat demo data identically to live data.
- **Cycle reset (Epic 4):** When reset occurs, clear all physics state; aquarium returns to empty state.
- **Offline queue (Epic 4):** Physics is client-side only; offline state does not affect physics simulation.
- **Cross-platform (Epic 1):** Vector math is platform-agnostic; physics works on macOS and Windows identically.

---

## Code Quality & Standards

### TypeScript

- Strict mode enabled (`"strict": true`).
- All functions fully typed.
- Use discriminated unions for physics entity types if needed.
- No `any` types; use generics.

### Naming Conventions

- Physics constants: `SCREAMING_SNAKE_CASE` (e.g., `REPULSION_ZONE`).
- Physics functions: `camelCase` (e.g., `applyWallRepulsion`).
- Type names: `PascalCase` (e.g., `PhysicsEntity`).
- Zustand stores: `use{Domain}Store` (e.g., `usePhysicsStore` if using store-based approach).

### Linting & Formatting

- `npm run lint` must pass with zero errors.
- Use project ESLint config; no new overrides.
- Format with Prettier (if configured).

---

## File Modifications Summary

### New Files

- `emotional-aquarium-client/src/renderer/src/utils/vectorMath.ts` — Vector operations library.
- `emotional-aquarium-client/src/renderer/src/utils/spatialGrid.ts` — Spatial grid for proximity detection.
- `emotional-aquarium-client/src/renderer/src/utils/physicsEngine.ts` — Main physics simulation loop.
- `emotional-aquarium-client/src/renderer/src/types/physics.ts` — Physics type definitions.
- `emotional-aquarium-client/tests/unit/utils/vectorMath.test.ts` — Vector math unit tests.
- `emotional-aquarium-client/tests/unit/utils/spatialGrid.test.ts` — Spatial grid unit tests.
- `emotional-aquarium-client/tests/unit/utils/physicsEngine.test.ts` — Physics engine unit tests.
- `emotional-aquarium-client/tests/component/AquariumCanvas.test.tsx` — AquariumCanvas component tests.
- `emotional-aquarium-client/tests/performance/physicsPerf.test.ts` — Performance benchmarks.

### Modified Files

- `emotional-aquarium-client/src/renderer/src/components/aquarium/AquariumCanvas.tsx` — Replace grid-based animation with organic physics.
- `emotional-aquarium-client/package.json` — No new dependencies required; all utilities use built-in math and Three.js types.

### No Changes

- Server files (no server-side logic).
- IPC handlers (physics is client-only).
- Submission or sync logic.
- Database schema or queries.

---

## Validation Checklist

Before marking story complete, verify:

- [ ] Vector math utilities are fully typed and tested.
- [ ] Spatial grid correctly partitions 50 shapes.
- [ ] Wall repulsion prevents shapes from leaving bounding box over 10 simulated seconds.
- [ ] Proximity deflection keeps shapes separated smoothly (no stacking).
- [ ] Bounded acceleration caps velocity changes; motion appears calm and organic.
- [ ] 50-shape simulation runs at ≥30 fps (benchmark pass).
- [ ] AquariumCanvas renders shapes with physics-driven positions.
- [ ] New shapes from server immediately spawn with randomized velocity.
- [ ] Cycle reset clears physics state.
- [ ] Demo mode shapes participate in physics identically to live shapes.
- [ ] Cross-platform parity verified (macOS + Windows).
- [ ] Linting passes (`npm run lint`).
- [ ] TypeScript strict mode passes (`npm run typecheck`).
- [ ] All tests pass and coverage is ≥80% for new utilities.

---

## Known Limitations & Future Work

**This Story:**
- Implements deterministic physics with smooth motion on a single client.
- Each client runs physics independently; inter-client position inconsistency is expected and acceptable.
- No persistent storage of velocity/position data.

**Future Enhancements (Post-Epic 6):**
- Gravitational effects (shapes float downward slowly if desired).
- Seasonal or weather-themed behavior variations.
- User-configurable physics intensity (slow down physics for visually sensitive users).
- Culling or LOD reduction for 100+ shape scenarios.
- Physics-aware camera positioning (avoid clipping shapes).

---

## References & Prior Art

- **React Three Fiber `useFrame` hook:** Handles per-frame animation loop with delta time.
- **Three.js Mesh positioning:** Direct position updates via `mesh.position.copy()` or array assignment.
- **Spatial partitioning:** Standard approach in game engines for broad-phase collision detection.
- **Soft body physics:** Damped spring-like forces are commonly used in VFX and character animation.
- **Performance optimization:** Delta time scaling and deterministic frame budgeting follow established practices.

---

## Developer Notes

### Implementation Order

1. **Implement vector math utilities first.** Test thoroughly; all downstream code depends on correctness.
2. **Build spatial grid next.** Validate grid cell assignment and neighbor lookup.
3. **Implement physics engine core loop.** Test bounded acceleration and damping in isolation.
4. **Refactor AquariumCanvas.** Integrate physics into existing component incrementally.
5. **Write tests and benchmarks.** Verify performance and edge cases.

### Debugging Tips

- **Physics state inspection:** Log `physicsStateRef.current` each frame to inspect position/velocity.
- **Visualization:** Render acceleration vectors as debug lines in Three.js to visualize forces.
- **Frame rate monitor:** Use React DevTools Profiler to measure frame times during 50-shape simulation.
- **Boundary visualization:** Temporarily render wireframe boxes for bounding box boundaries during development.

### Common Pitfalls to Avoid

- **Floating-point precision:** Use `> 0.01` distance checks to avoid division by zero in normalize.
- **Unbounded growth:** Damping (multiply by 0.98) is essential; without it, velocity grows indefinitely.
- **Grid allocation hotness:** Rebuild spatial grid every frame; don't cache (shapes move each frame).
- **Mesh ref stale:** Ensure `useRef` for mesh refs is updated when shapes are added/removed.
- **Delta time units:** Ensure physics velocities are in consistent units (units/second); deltaTime is in seconds from R3F.

---

## Status

**Status:** ready-for-dev  
**Created:** 2026-04-29  
**Story Key:** 6-1-organic-aquarium-physics  
**Epic:** 6 — Aquarium Polish  
**Estimated Effort:** 3–4 days (implementation + testing + refinement)

The developer has all context needed for flawless implementation without clarifications.

## File List

### New Files
- emotional-aquarium-client/src/renderer/src/utils/vectorMath.ts
- emotional-aquarium-client/src/renderer/src/utils/spatialGrid.ts
- emotional-aquarium-client/src/renderer/src/utils/physicsEngine.ts
- emotional-aquarium-client/src/renderer/src/types/physics.ts
- emotional-aquarium-client/tests/unit/utils/vectorMath.test.ts
- emotional-aquarium-client/tests/unit/utils/spatialGrid.test.ts
- emotional-aquarium-client/tests/unit/utils/physicsEngine.test.ts
- emotional-aquarium-client/tests/component/AquariumCanvas.test.tsx
- emotional-aquarium-client/tests/performance/physicsPerf.test.ts

### Modified Files
- emotional-aquarium-client/src/renderer/src/components/aquarium/AquariumCanvas.tsx

