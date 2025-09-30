import { engine, GltfContainer, Transform, Animator, Entity, inputSystem, InputAction, PointerEventType, PointerEvents } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math';

// --- DEFINE THE CENTERPIECE OUTSIDE THE MAIN FUNCTION ---
// This makes the 'centerpiece' variable accessible to the whole script.
let centerpiece: Entity

// --- DEFINE A STATE VARIABLE ---
// This will help us avoid restarting the animation on every frame.
let currentState: 'idle' | 'proximity' | 'proximity_idle' = 'idle'

/**
 * Main function to set up the scene.
 */
export function main() {
  // Create the entity and assign it to our global variable
  centerpiece = engine.addEntity()

  // Attach the 3D model
  GltfContainer.create(centerpiece, {
    src: 'models/Anim_3Actions_2.glb'
  })

  // Set the position, rotation, and scale
  Transform.create(centerpiece, {
    position: { x: 23.5, y: 0, z: 26 },
    rotation: Quaternion.fromEulerDegrees(0, 0, 0),
    scale: { x: 1, y: 1, z: 1 }
  })

  // Setup the animations
  Animator.create(centerpiece, {
    states: [
      {
        // 'clip' must match the action name in Blender exactly.
        clip: 'Idle_Anim',
        playing: false, // Start with the idle animation playing
        loop: true,
        speed: 1
      },
      {
        clip: 'Proximity_Anim',
        playing: false, // Start with the proximity animation stopped
        loop: false,
        speed: 1
      },
      {
        clip: 'Click_Anim',
        playing: true,
        loop: false,
        speed: 1
      }
    ]
  })

  // Make the centerpiece clickable
  PointerEvents.create(centerpiece, {
    pointerEvents: [
      {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: {
          button: InputAction.IA_POINTER,
          hoverText: 'Click to animate'
        }
      }
    ]
  })
}

// --- ADD THE PROXIMITY-BASED ANIMATION SWITCHER ---
engine.addSystem(() => {
  if (!centerpiece) return

  const playerPosition = Transform.getOrNull(engine.PlayerEntity)
  if (!playerPosition) return

  const centerpieceTransform = Transform.get(centerpiece)
  const distance = Vector3.distance(playerPosition.position, centerpieceTransform.position)

  // If player is far, always reset to idle state, even if click animation was playing.
  if (distance > 6) {
    if (currentState !== 'idle') {
      // Stop other animations and play idle
      Animator.getClip(centerpiece, 'Click_Anim').playing = false
      Animator.getClip(centerpiece, 'Proximity_Anim').playing = false
      Animator.getClip(centerpiece, 'Idle_Anim').playing = true
      currentState = 'idle'
    }
    return // Nothing else to do if player is far
  }

  // If click animation is playing, don't let proximity animations interfere
  if (Animator.getClip(centerpiece, 'Click_Anim').playing) {
    return
  }

  // Player is close (distance <= 6)
  const proximityClip = Animator.getClip(centerpiece, 'Proximity_Anim')
  if (currentState === 'idle') {
    // Play the proximity animation if coming from afar
    Animator.getClip(centerpiece, 'Idle_Anim').playing = false
    proximityClip.playing = true
    proximityClip.loop = false
    currentState = 'proximity'
  } else if (currentState === 'proximity' && !proximityClip.playing) {
    // Proximity animation finished, switch to idle but stay in proximity
    Animator.getClip(centerpiece, 'Idle_Anim').playing = true
    currentState = 'proximity_idle'
  }
})

// --- ADD THE CLICK-BASED ANIMATION TRIGGER ---
engine.addSystem(() => {
  if (!centerpiece) return

  if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, centerpiece)) {
    // Play click animation. This will automatically stop other animations.
    const clickAnim = Animator.getClip(centerpiece, 'Click_Anim')
    clickAnim.playing = true
    clickAnim.loop = false // Ensure it plays only once
  }
})