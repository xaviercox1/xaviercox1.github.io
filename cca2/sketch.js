// Array to store cloud data
let clouds = [];
// Array to store tree data
let trees = [];
// Variable to track the level of environmental degradation
let glitchFactor = 0;
// Color variables for the start and end of background transition
let startColor, endColor, currentBgColor;
// Color variables for the sun's start and end color transition
let startSunColor, endSunColor;

function setup() {
   // Set the canvas size
    createCanvas(innerWidth, innerHeight);
  // Set the frame rate to control the speed of the loop
    frameRate(0.5);
  // Call function to initialize cloud data
    initializeClouds();
  // Call function to initialize tree data
    initializeTrees();
  // Define the start color of the background (light blue)
    startColor = color(173, 216, 230);
  // Define the end color of the background (darker)
    endColor = color(25, 20, 20);
  // Define the start color of the sun (bright red)
    startSunColor = color(255, 200, 0); 
  // Define the end color of the sun (dark red)
    endSunColor = color(10, 0, 0);
  // Set the current background color to start color
    currentBgColor = startColor;
    noLoop(); // Stop the loop and only draw when the mouse is clicked
}

function draw() {
  // Calculate the current background color based on glitch factor
    currentBgColor = lerpColor(startColor, endColor, glitchFactor / 20);
    background(currentBgColor);
    drawSun();
    drawClouds();
    drawGround();
    drawTrees();
    drawMouseText();
}

function drawMouseText() {
  // custom function to create text
    fill(255); 
    noStroke();
    textAlign(CENTER, CENTER); // Center the text around the cursor
    textStyle(BOLD);
    textSize(20); 
    // Change text based on the number of clicks
    let displayText = glitchFactor < 9 ? "CLICK TO POLLUTE" : "★★★★★★CLICK TO SAVE★★★★★★";
    text(displayText, mouseX, mouseY - 20); // Display above the cursor to avoid blocking the view
}

function initializeClouds() {
    for (let i = 0; i < 200; i++) { 
      // Create each cloud with random properties and store in the array
        let x = random(width);
        let y = random(50, 250);
        let opacity = random(20, 50); // Start with semi-transparent clouds
        let size = random(60, 120);
        let baseColor = color(255); // Start with white clouds
        clouds.push({x, y, opacity, size, baseColor});
    }
}
function drawClouds() {
  // Determine the number of active clouds based on glitch factor
    let activeClouds = Math.floor(map(glitchFactor, 0, 20, 20, 100));
    for (let i = 0; i < activeClouds; i++) {
        let cloud = clouds[i];
        cloud.active = true;
      // Apply glitch offsets to cloud positions
        let glitchOffsetX = random(-10, 10) * glitchFactor;
        let glitchOffsetY = random(-10, 10) * glitchFactor;
        
        // Set cloud color and transparency
        let darkenAmount = map(glitchFactor, 0, 20, 255, 150); // From lighter to darker
        fill(255, 255, 255, 25); // Maintain transparency by adjusting alpha
        
        noStroke();
      // Draw cloud ellipses with glitch effect
        ellipse(cloud.x + glitchOffsetX, cloud.y + glitchOffsetY, cloud.size + 60, cloud.size);
        ellipse(cloud.x + cloud.size / 2 + glitchOffsetX, cloud.y + glitchOffsetY, cloud.size + 40, cloud.size);
        ellipse(cloud.x - cloud.size / 2 + glitchOffsetX, cloud.y + glitchOffsetY, cloud.size + 40, cloud.size);
    }
}


function initializeTrees() {
  // Create each tree with random properties and store in the array
  for (let i = 0; i < width; i += 80) {
    trees.push({
      x: i,
      groundLevel: height - random(50, 100),
      treeHeight: random(40, 120),
      greenShade: random(150, 255)
    });
  }
}

function drawTrees() {
  trees.forEach(tree => {
    push();
    // Apply glitch angle and position offsets
    let glitchAngle = random(-0.1, 0.1) * glitchFactor;
    translate(tree.x + random(-5, 5) * glitchFactor, tree.groundLevel);
    rotate(glitchAngle);

    // Darken the tree color over time
    let treeDarkness = map(glitchFactor, 0, 10, tree.greenShade, 20); // Darken to a lower green value
    stroke(0, treeDarkness, 0); // Apply the darker green color
    // Draw tree branches using recursion
    branch(tree.treeHeight);
    pop();
  });
}

// Recursive function to draw branches
function branch(len) {
  let angle = noise(frameCount * 0.1) * PI/4 - PI/8; // Dynamic wind effect
  strokeWeight(map(len, 10, 150, 2, 10));
  line(0, 0, 0, -len);
  translate(0, -len);
  
  len *= random(0.6, 0.9);
  if (len > 20) {
    push();
    rotate(angle + random(-0.1, 0.1));
    branch(len);
    pop();
    
    push();
    rotate(-angle + random(-0.1, 0.1));
    branch(len);
    pop();
  }
}

function drawGround() {
  fill(150 - glitchFactor * 10, 75 - glitchFactor * 5, 0); // Brown color for the ground
  beginShape();
  for (let x = 0; x <= width; x += 10) {
    let y = map(noise(x * 0.1, glitchFactor * 0.1), 0, 1, 350, 450);
    vertex(x, y);
  }
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);
}

function drawSun() {
  let currentSunColor = lerpColor(startSunColor, endSunColor, glitchFactor / 20);
  fill(currentSunColor);
  noStroke();
  ellipse(300, 100, 100, 100); // Fixed position for the sun
}
function mouseClicked() {
    if (glitchFactor < 9) {
        glitchFactor++; // Increment glitch factor only if less than 9
    } else {
        // Reset everything when clicked after the text changes to "CLICK TO SAVE"
        glitchFactor = 0;
        initializeClouds(); // Optionally reinitialize clouds to reset state
        initializeTrees(); // Optionally reinitialize trees to reset state
    }
    redraw(); // Redraw the scene with updated conditions
}
