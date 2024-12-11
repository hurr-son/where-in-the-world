# Where in the World?

This is a browser-based guessing game where players see a random satellite image from a city and must guess the location on a map. After submitting the guess, the player is shown how far their guess was from the actual location.

[Try it out here](https://hurr-son.github.io/where-in-the-world/)

## How It Works

1. **Random City Location**: On load, the app fetches a `cities.geojson` file, selects a random city polygon, and chooses a random point within that city to display.
   
2. **Satellite View**: The main map (on the entire page background) is a static satellite imagery tile layer from Esri.
   
3. **Guessing Map**: A smaller, draggable, and zoomable map (a dark gray canvas map) is displayed in a box. The player clicks on this map to place a marker for their guess.
   
4. **Result**: Once the player clicks "Submit Guess", a result overlay appears, showing:
   - How far the guess was from the correct location (in kilometers).
   - A result map showing both the actual location and the player's guessed location, connected by a line.
   
5. **Play Again**: The player can choose to play again, which resets the game with a new random location.

## Files

- **index.html**: The main HTML structure and references to CSS and JS.
- **styles.css**: Basic styling for maps and UI elements.
- **main.js**: The core game logic. It handles:
  - Fetching `cities.geojson`.
  - Initializing and configuring Leaflet maps.
  - Selecting a random point in a city polygon using Turf.js.
  - Handling user input on the guess map.
  - Calculating and displaying results.
  
- **cities.geojson**: A GeoJSON file listing city polygons for random selection.

## Notes

- The game relies on `cities.geojson` to define possible city polygons.
- Make sure the browser can fetch `cities.geojson` (e.g., run a local server if necessary).
- The calculation of distances is approximate and uses the haversine formula.
