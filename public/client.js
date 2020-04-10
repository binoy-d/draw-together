var user = {
    'num': 0,
    'r':140,
    'g':140,
    'b':140
  };

  var objects = {
    'objects': []
  };
  var cursors = {
    'cursors': []
  };
  var socket = io();

  socket.emit('clientEvent', user);


  socket.on('setusernum', function(data) {//when usernum is assigned...
    console.log(data.totalusers);
    user.num = data.totalusers;//keep usernum
  });
  
  socket.on('colorset',function(data){//when colors come in
    user.r = data.r;//keep colors
    user.g = data.g;
    user.b = data.b;
    console.log("r: "+user.r+" g: "+user.g+" b: "+user.b);
  });


  var b;
  
  function setup() {createCanvas(windowWidth, windowHeight);angleMode(DEGREES);}

  function draw() {
    background(0);
    socket.on('broadcast', function(data) {//when cursor data comes in
      cursors.cursors = data.cursors;//keep cursor data
    });
    
    if (cursors.cursors.length >= 1) {//if there are cursors
      for (var i = 0; i < cursors.cursors.length; i++) {//loop through every cursor
        if (cursors.cursors[i] != null) {//if it it exists
          if (cursors.cursors[i].usernum != user.num) {//and if it is not the user's cursor
            //generate a particle in the cursor's color
            
            objects.objects.push(new Particle(cursors.cursors[i].x, cursors.cursors[i].y,cursors.cursors[i].r,cursors.cursors[i].g,cursors.cursors[i].b));
          }
          else {//if it is the user's cursor
            //dont do anythung
          }
        }
      }
    }

    if (mouseIsPressed) {//if the mouse is presed
      socket.emit('cursor', new Point(mouseX, mouseY));//send the location of the cursor to the server
      objects.objects.push(new Particle(mouseX,mouseY,user.r,user.g,user.b));
    }else{
      socket.emit('removeCursor', new Point(mouseX, mouseY));//send the location of the cursor to the server
    }

    for (var i = 0; i < objects.objects.length; i++) {//loop through every particle in the objects array
      b = objects.objects[i];
      b.move();//move it
      b.display();//render it
      if (b.age >= 105) {//if it is old...
        objects.objects.splice(i, 1);//murder it
      }
    }
  }//end of 'game loop'

  function Particle(x, y,r,g,b) {//All particles have a location, color, angle, diameter, and speed
    this.r = r;
    this.g = g;
    this.b = b;
    this.x = x;
    this.y = y;
    this.type = "particle";
    this.age = 0;
    this.diameter = random(10, 30);
    this.angle = random(0, 360);
    this.speed = random(0.1, 1);
  }

  Particle.prototype.display = function() {//All particles can be rendered
    noStroke();
    fill(this.r,this.g,this.b, 255 - (this.age * 2));//The color is from the rgb values and the alpha is from the age
    ellipse(this.x, this.y, this.diameter, this.diameter);//draw a circle of the right diameter
  }
  Particle.prototype.move = function() {//All particles can move
    this.age++;//All particles get old
    this.x += sin(this.angle) * this.speed;
    this.y += cos(this.angle) * this.speed;
  }


  function Point(x, y) {//Points are cursors. They carry the user id, location, and user color
    this.x = x;
    this.y = y;
    this.r = user.r;
    this.g = user.g;
    this.b = user.b;
    this.usernum = user.num;
  }

