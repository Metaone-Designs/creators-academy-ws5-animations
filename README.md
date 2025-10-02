 # Creators Academy: WS5 - Multi-Action Animations
 
 [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
 [![Build Status](https://img.shields.io/github/actions/workflow/status/MrJStickel/creators-academy-ws5-animations/main.yml?branch=main)](https://github.com/MrJStickel/creators-academy-ws5-animations/actions)
 
 > An example Decentraland scene demonstrating how to manage multiple animation states on a single object using SDK 7.
 
 This project showcases a finite state machine (FSM) approach to handle distinct animations for a 3D model within a Decentraland scene. The object cycles through different animations based on player interaction: a default idle state, a proximity-based state, and an uninterruptible state triggered by a click.
 
 ## ✨ Features
 
 - **Idle State**: A default, looping animation (`Idle_Anim`).
 - **Proximity State**: A looping animation that plays when the player is near the object (`Proximity_Anim`).
 - **Click State**: A non-looping, uninterruptible animation triggered by player interaction (`Click_Anim`).
 - **Finite State Machine**: A clean and robust pattern to manage animation states and prevent conflicts.
 
 ## 🚀 Try it out
 
 ### Previewing the scene
 
 1.  Download this repository.
 
 2.  Install the Decentraland Editor.
 
 3.  Open a Visual Studio Code window on this scene's root folder.
 
 4.  Open the Decentraland Editor tab and press **Run Scene**.
 
 ### Running the Scene via Command Line
 
 Alternatively, you can use the command line. Inside this scene's root directory, run the following commands:
 
 1. Install the dependencies:
 ```sh
 npm install
 ```
 
 2. Run the scene:
 ```sh
 dcl start
 ```
 

 ## 📜 License
 
 This project is licensed under the MIT License - see the LICENSE.md file for details.

