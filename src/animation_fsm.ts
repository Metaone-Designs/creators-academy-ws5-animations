import {
  engine,
  GltfContainer,
  Transform,
  Animator,
  Entity,
  inputSystem,
  InputAction,
  PointerEventType,
  PointerEvents
} from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
// The utils library is part of the core SDK and is needed for timers.
// If you get an error here, run `npm install` in your project's terminal.
import * as utils from '@dcl-sdk/utils'

/**
 * M1D - Creators Academy Workshop 5: Multi-Action Animation States
 *
 * This function sets up a single 3D object with three distinct animation states
 * that respond to player interaction:
 * - Idle: A default, looping animation.
 * - Proximity: A looping animation that plays when the player is near.
 * - Click: A non-looping, uninterruptible animation triggered by the player.
 */
export function createAnimatedCenterpiece() {
  // === 1. ENTITY SETUP ===
  // All objects in a scene are Entities. We create one for our centerpiece.
  const centerpiece: Entity = engine.addEntity()

  // Attach the 3D model (.glb file) to our entity.
  GltfContainer.create(centerpiece, { src: 'models/Anim_3Actions.glb' })

  // Set the entity's position, rotation, and scale in the world.
  Transform.create(centerpiece, {
    position: { x: 8, y: 0, z: 8 },
    rotation: Quaternion.fromEulerDegrees(0, 0, 0),
    scale: { x: 1, y: 1, z: 1 }
  })

  // === 2. ANIMATION & INTERACTIVITY SETUP ===
  // The Animator component defines all animation clips stored in the GLB.
  // The 'clip' name must exactly match the Action name from Blender.
  Animator.create(centerpiece, {
    states: [
      { clip: 'Idle_Anim', playing: true, loop: true },
      { clip: 'Proximity_Anim', playing: false, loop: true },
      { clip: 'Click_Anim', playing: false, loop: false }
    ]
  })

  // The PointerEvents component makes the entity clickable and shows hover text.
  PointerEvents.create(centerpiece, {
    pointerEvents: [
      {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: { button: InputAction.IA_POINTER, hoverText: 'Activate' }
      }
    ]
  })

  // === 3. STATE MACHINE SETUP ===
  // A state machine is a clean way to manage how the object behaves.
  // It can only be in one state at a time, which prevents animation conflicts.
  type SystemState = 'idle' | 'proximity' | 'clicking'
  let systemState: SystemState = 'idle'

  // === 4. SINGLE, UNIFIED LOGIC SYSTEM ===
  // An `engine.addSystem` runs on every frame of the game. By putting all our
  // logic in one system, we prevent different systems from fighting for control.
  engine.addSystem(() => {
    // --- GUARD CLAUSE: THE "UNINTERRUPTIBLE" STATE ---
    // If the system is in the 'clicking' state, we immediately stop all other
    // logic for this frame. The timer is the ONLY thing that can change this state.
    if (systemState === 'clicking') {
      return
    }

    // --- SHARED DATA ---
    // We get the player's position once to use in the logic below.
    const playerPosition = Transform.getOrNull(engine.PlayerEntity)
    const distance = playerPosition
      ? Vector3.distance(playerPosition.position, Transform.get(centerpiece).position)
      : 999

    // --- CLICK EVENT HANDLER ---
    // Check if the player clicked the centerpiece on this frame.
    if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, centerpiece)) {
      // The click is only allowed if the player is within the proximity range.
      if (distance <= 6) {
        // 1. Lock the state to 'clicking'.
        systemState = 'clicking'

        // 2. Play the one-shot animation. `playSingleAnimation` is perfect for this.
        Animator.playSingleAnimation(centerpiece, 'Click_Anim', true)

        // 3. Manually define the duration of the animation in seconds.
        const clickAnimationDuration = 37.25 // From Blender: 900 frames / 24 fps

        // 4. Set a precise timer. This is the most reliable way to handle
        //    the end of a non-looping animation.
        utils.timers.setTimeout(() => {
          // 5. When the timer finishes, check the player's distance AGAIN
          //    to decide which state to return to.
          const playerPositionAfterClick = Transform.getOrNull(engine.PlayerEntity)
          const distanceAfterClick = playerPositionAfterClick
            ? Vector3.distance(playerPositionAfterClick.position, Transform.get(centerpiece).position)
            : 999

          if (distanceAfterClick <= 6) {
            systemState = 'proximity'
            Animator.playSingleAnimation(centerpiece, 'Proximity_Anim')
          } else {
            systemState = 'idle'
            Animator.playSingleAnimation(centerpiece, 'Idle_Anim')
          }
        }, clickAnimationDuration * 1000) // Convert seconds to milliseconds
        return // Stop processing for this frame to let the click take priority.
      }
    }

    // --- PROXIMITY & IDLE LOGIC ---
    // This logic only runs if the system is NOT in the 'clicking' state.
    if (distance <= 6) {
      // Player is close. If not already in proximity, switch to it.
      if (systemState !== 'proximity') {
        systemState = 'proximity'
        Animator.playSingleAnimation(centerpiece, 'Proximity_Anim')
      }
    } else {
      // Player is far. If not already idle, switch to it.
      if (systemState !== 'idle') {
        systemState = 'idle'
        Animator.playSingleAnimation(centerpiece, 'Idle_Anim')
      }
    }
  })
}


