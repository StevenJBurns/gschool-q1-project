"use strict"

initAudio();

// let jqNASA = $.ajax({
//   url: "https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI?table=exoplanets&select=distinct%20pl_name&format=json",
//
//
// }).done((result) => stuff = JSON.parse(result));
//
// console.log(jqNASA);


// Find the canvas via the DOM and get a 2D context to it
let divWrapper = document.getElementById("canvas-wrapper");
let canvas = document.getElementById("canvas-visualizer");
let ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = $(window).height() - ($("header").outerHeight() + $("footer").outerHeight());

$(window).resize(resizeCanvas);

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = $(window).height() - ($("header").outerHeight() + $("footer").outerHeight());

  init();
}

let ken = new Image();
ken.src = "images/ken.png";


// Classes -- SolarSystem class is a container class for StellarObject objects
//  -- Star, Planet and Moon inherit from superclass StellarObject
class SolarSystem {

  constructor(star, planets){
    this.star = new Star();
    this.planets = [];
  }
}

class StellarObject {
  constructor(x, y, r){
    // this.x = x;
    // this.y = y;
    // this.r = r;
  }
}

class Star extends StellarObject {
  constructor(){
    super();

    this.isBinary = false;
  }

  draw(){
    let g = ctx.createRadialGradient(320, 320, 4, 320, 320, 28);
    g.addColorStop(0, "#FFFF99");
    g.addColorStop(0.05, "#FFFF99")
    g.addColorStop(1, "#000000");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  drawSingleStar(){

  }

  drawBinary(){

  }

  update(){

  }
}

class Planet extends StellarObject {
  constructor(){
    super();

    // known parameters of an elliptic orbit found in the NASA database
    this.ecc = (Math.random() * 0.75) + 0.25;
    this.semiMajor = Math.floor(Math.random() * 240);
    this.semiMinor = Math.sqrt(Math.pow(this.semiMajor, 2) * (1 - Math.pow(this.ecc, 2)));

    //foci
    this.foci = Math.sqrt(Math.pow(this.semiMajor, 2) - Math.pow(this.semiMinor, 2));

    // Give the planet a random theta and velocity
    this.theta = Math.random() * 2 * Math.PI;
    this.dtheta = Math.random() / 20;
    // this.radius = Math.floor(Math.random() * 240) + 32;

    // calculate radius from a given (initially random) theta and some terrifying crazy ellipse math
    this.radius = this.semiMajor * (1 - Math.pow(this.ecc, 2)) / (1 + (this.ecc * Math.cos(this.theta)))

    //convert polar (theta, radius) to cartesian (x, y)
    this.x = (Math.cos(this.theta) * this.radius) + 320 + this.foci;
    this.y = (Math.sin(this.theta) * this.radius) + 320;

    this.trailLength = 128;
    this.trailPositions = [];
  }

  draw(){
    this.update();
    this.drawOrbit(this.radius);
    this.drawTrail();

    // ctx.drawImage(ken, this.x, this.y, 32, 32)

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
  }

  drawOrbit(r) {
    ctx.strokeStyle = "#3F3F3F";
    ctx.beginPath();
    ctx.ellipse(320 + this.foci, 320, this.semiMajor, this.semiMinor, 0, 0, 2 * Math.PI, false)
    ctx.stroke();
  }

  // Use the trailPositions array to store
  drawTrail(){
    let opacity = 0;

    for (let trail of this.trailPositions){

      ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, 1, this.theta, this.theta - 0.1, true);
      ctx.stroke();

      opacity += 0.5/this.trailLength;
    }
  }

  // Update the "numbers" before drawing
  update(){
    if (this.theta >= (2 * Math.PI)) this.theta = 0;

    // Push the current x-y position into the array to generate a motion trail in drawTrail() function
    // Also, take the last planet motion trail particle out of the array with shift()
    this.trailPositions.push({x: this.x, y: this.y});
    if (this.trailPositions.length > this.trailLength) this.trailPositions.shift();

    // convert polar coordinates (radius and theta) to Cartesian canvas coordinates (x, y)
    this.x = (Math.cos(this.theta) * this.radius) + 320 + (2 * this.foci);
    this.y = (Math.sin(this.theta) * this.radius) + 320;

    // update theta for the next draw() pass; the angle produces acceleration effect AND radius is not available until theta is set
    this.theta += this.dtheta;
    this.radius = this.semiMajor * (1 - Math.pow(this.ecc, 2)) / (1 + (this.ecc * Math.cos(this.theta)))
  }
}

class BackgroundStarfield {
  constructor(){
    this.stars = [];

    for (let i = 0; i < 256; i++){
      let s = {"starTheta" : Math.random() * 2 * Math.PI,
               "starRadius" : Math.random() * (canvas.width / 1.5) + 96,
               "opacity" : Math.random() / 1.5};
      this.stars.push(s);
      }
    }

    draw(){
      this.update();

      for (let s of this.stars){
        let x = Math.cos(s.starTheta) * s.starRadius + 320;
        let y = Math.sin(s.starTheta) * s.starRadius + 320;

        ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, 2 * Math.PI, true);
        ctx.closePath();
        ctx.fill();
      }
    }

    update(){
      for (let s of this.stars){
        s.starTheta -= 0.00075;
      }
    }
  }

// Test Background, Star & Planet
let bgStars = new BackgroundStarfield();
let star = new Star();
let p1 = new Planet();
let p2 = new Planet();


function init(){

}

// Animation of the Canvas element
function animateCanvas(){
  window.requestAnimationFrame(animateCanvas);

  ctx.fillStyle = "black";
  ctx.fillRect(0,0,640,640);

  star.draw();
  bgStars.draw();
  p1.draw();
  p2.draw();
}

// Initialize the canvas and accompanying objects
init();
// Start the canvas animation; recursively calls window.requestAnimationFrame()
animateCanvas();