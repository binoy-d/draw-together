var user = {
    'id': null,
    'r': 140,
    'g': 140,
    'b': 140
};

var particles = [];
var cursors = [];
var socket = io();
var lastMouseUpdate = 0;
var UPDATE_INTERVAL = 16; // ~60 FPS
var maxParticles = 500; // Limit particles for performance
var userCount = 0; // Track total number of users

socket.emit('clientEvent', user);

socket.on('setusernum', function(data) {
    user.id = data.userId;
    console.log('Assigned user ID:', user.id);
});

socket.on('colorset', function(data) {
    user.r = data.r;
    user.g = data.g;
    user.b = data.b;
    console.log("Color set - r:", user.r, "g:", user.g, "b:", user.b);
});

// Move socket listener outside of draw loop for better performance
socket.on('broadcast', function(data) {
    if (data && data.cursors) {
        cursors = data.cursors;
        // Update user count based on active cursors
        userCount = cursors.length;
    }
});

socket.on('userCount', function(data) {
    if (data && data.count !== undefined) {
        userCount = data.count;
    }
});

function setup() {
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
}

function draw() {
    background(0);
    
    // Display user count in top-left corner
    displayUserCount();
    
    // Process other users' cursors
    for (var i = 0; i < cursors.length; i++) {
        var cursor = cursors[i];
        if (cursor && cursor.userId !== user.id) {
            // Create particles less frequently for better performance
            if (frameCount % 2 === 0) { // Every other frame
                addParticle(cursor.x, cursor.y, cursor.r, cursor.g, cursor.b);
            }
        }
    }

    // Handle mouse input with throttling
    var now = millis();
    if (mouseIsPressed) {
        if (now - lastMouseUpdate > UPDATE_INTERVAL) {
            socket.emit('cursor', { x: mouseX, y: mouseY });
            lastMouseUpdate = now;
        }
        // Always create particles when mouse is pressed (not throttled)
        addParticle(mouseX, mouseY, user.r, user.g, user.b);
    } else {
        if (now - lastMouseUpdate > UPDATE_INTERVAL) {
            socket.emit('removeCursor', { x: mouseX, y: mouseY });
            lastMouseUpdate = now;
        }
    }

    // Update and render particles efficiently
    updateParticles();
}

function addParticle(x, y, r, g, b) {
    // Limit total particles to prevent memory issues
    if (particles.length < maxParticles) {
        particles.push(new Particle(x, y, r, g, b));
    }
}

function updateParticles() {
    for (var i = particles.length - 1; i >= 0; i--) {
        var particle = particles[i];
        particle.move();
        particle.display();
        
        // Longer lifespan for slower dispersion
        if (particle.age >= 150) { // Increased from 105 to 150
            particles.splice(i, 1);
        }
    }
}

function displayUserCount() {
    // Clean, minimal user count display
    fill(255, 255, 255, 180); // Semi-transparent white
    noStroke();
    textAlign(LEFT, TOP);
    textSize(16);
    textFont('Arial');
    
    var padding = 15;
    var userText = userCount + (userCount === 1 ? ' user online' : ' users online');
    
    // Simple background rectangle
    var textW = textWidth(userText);
    fill(0, 0, 0, 100); // Semi-transparent black background
    rect(padding - 5, padding - 5, textW + 10, 25);
    
    // Display text
    fill(255, 255, 255, 200); // Bright white text
    text(userText, padding, padding);
}

function Particle(x, y, r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.x = x;
    this.y = y;
    this.age = 0;
    this.diameter = random(8, 25);
    this.angle = random(0, 360);
    this.speed = random(0.5, 1.2); // Good balance of slower than original but still visible
    this.vx = sin(this.angle) * this.speed; // Pre-calculate velocity
    this.vy = cos(this.angle) * this.speed;
}

Particle.prototype.display = function() {
    noStroke();
    var alpha = max(0, 255 - (this.age * 1.5)); // Slower fade but not too slow
    fill(this.r, this.g, this.b, alpha);
    ellipse(this.x, this.y, this.diameter, this.diameter);
}

Particle.prototype.move = function() {
    this.age++;
    this.x += this.vx; // Use pre-calculated velocity
    this.y += this.vy;
}

// Window resize handler for responsiveness
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

