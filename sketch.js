'esversion 11'

var tileIDs = {};
var entityIDs = {};

/*
0 is air
1 is cobble-wall
2 is artemis-wall
3 is wood-wall
4 is loot-chest
5 is key
6 is lock
7 is exit
8 is connection for cobble-wall
9 is skeleton
*/
rooms = {};
rooms.start = "rooms/start.json";
rooms.r0 = "rooms/r0.json";
rooms.r1 = "rooms/r1.json";
rooms.r2 = "rooms/r2.json";
rooms.r3 = "rooms/r3.json";
rooms.r4 = "rooms/r4.json";
rooms.r5 = "rooms/r5.json";
rooms.r6 = "rooms/r6.json";
rooms.r7 = "rooms/r7.json";
rooms.k0 = "rooms/k0.json";
rooms.k1 = "rooms/k1.json";
rooms.s0 = "rooms/s0.json";
rooms.e0 = "rooms/e0.json";

//Tile classes
class Tile {
  constructor(url,id) {
    this.image = loadImage(url);
    this.id = id;
    tileIDs[id] = this;
  }
  render(x,y) {
    // Image scale
    var s = 64;
    
    mapBuf.image(this.image,x,y,1,1,0,0,s,s);
  }
}
class joinTile extends Tile {
  constructor(url,id) {
    super(url,id);
  }
  render(x,y,buf,map) {
    //Making sure not out of bounds and testing if neighbors are of the same type
    var u = (map[y-1] ? (map[y-1][x] ?? 0) : 0) == this.id;
    var d = (map[y+1] ? (map[y+1][x] ?? 0) : 0) == this.id;
    var l = (map[y][x-1] ?? 0) == this.id;
    var r = (map[y][x+1] ?? 0) == this.id;
    
    // Image scale
    var s = 64;
    
    var tx;
    var ty;
    
    //Figuring out current state and getting pixel coords
    if (u + d + r + l == 4) {
      tx = 0; ty = 0;
    }
    else if (u + d + r + l == 3) {
      ty = 1;
      if (!u && d && r && l) {
        tx = 0;
      } 
      else if (u && d && !r && l) {
        tx = 1;
      } 
      else if (u && !d && r && l) {
        tx = 2;
      } 
      else if (u && d && r && !l) {
        tx = 3;
      }
    }
    else if (u + d + r + l == 2) {
      if (!u && !d && r && l) {
        tx = 2; ty = 0;
      } 
      else if (u && d && !r && !l) {
        tx = 3; ty = 0;
      } 
      else if (!u && d && !r && l) {
        tx = 0; ty = 2;
      } 
      else if (u && !d && !r && l) {
        tx = 1; ty = 2;
      } 
      else if (u && !d && r && !l) {
        tx = 2; ty = 2;
      } 
      else if (!u && d && r && !l) {
        tx = 3; ty = 2;
      }
    } 
    else if (u + d + r + l == 1) {
      ty = 3;
      if (!u && d && !r && !l) {
        tx = 0;
      } 
      else if (!u && !d && !r && l) {
        tx = 1;
      } 
      else if (u && !d && !r && !l) {
        tx = 2;
      } 
      else if (!u && !d && r && !l) {
        tx = 3;
      }
    }
    else if (u + d + r + l == 0) {
      tx = 1; ty = 0;
    }
    buf.image(this.image,x,y,1,1,tx*s,ty*s,s,s);
  }
}


// Entity classes
class Entity {
  constructor(x,y) {
    this.pos = createVector(x,y);
    this.pos.mult(32);
    entities.push(this);
  }
  render() {
    push();
    translate(this.pos);
    rect(-16,-16,32,32);
    translate(this.pos.copy().mult(-1));
    pop();
  }
  update() {
    
  }
  hit() {
    
  }
  destroy() {
    entities.splice(entities.indexOf(this),1);
  }
}
entityIDs[0] = 0;
entityIDs[1] = class Skeleton extends Entity {
  constructor(x,y) {
    super(x,y);
    this.attackcooldown = 0;
    this.hurt = 0;
    this.health = 3;
  }
  render() {
    push();
    translate(this.pos);
    image(textures.skeleton,-16,-16,32,32);
    translate(this.pos.copy().mult(-1));
    pop();
  }
  update() {
    var delta = player.pos.copy().sub(this.pos);
    var mag = delta.magSq();
    if (mag > (10*32)**2) {
      return;
    }
    if (mag < (0.7*32)**2) {
      this.attackcooldown--;
      if (this.attackcooldown <= 0) {
        player.health--;
        this.attackcooldown = 60;
      }
    }
    delta.div(sqrt(mag));
    
    if (this.hurt > 0) {
      this.hurt--;
      delta.mult(-6.4);
    }

    checkCollisions(this.pos,delta,7,7,-8,-8);
  }
  hit() {
    this.hurt = 10;
    this.health--;
    if (this.health <= 0) {
      this.destroy();
    }
  }
}
entityIDs[2] = class BoneSkeleton extends Entity {
  constructor(x,y) {
    super(x,y);
    this.attackcooldown = 0;
    this.hurt = 0;
    this.health = 3;
  }
  render() {
    push();
    translate(this.pos);
    image(textures.skeleton_1,-16,-16,32,32);
    translate(this.pos.copy().mult(-1));
    pop();
  }
  update() {
    var delta = player.pos.copy().sub(this.pos);
    var mag = delta.magSq();
    if (mag > (10*32)**2) {
      return;
    }
    if (mag < (4*32)**2) {
      this.attackcooldown--;
      if (this.attackcooldown <= 0) {
        var vel = player.pos.copy().sub(this.pos);
        var bone = new entityIDs.bone(vel,this.pos.x,this.pos.y);
        this.attackcooldown = 60;
      }
      if (mag >= (3*32)**2) {
        delta.mult(0);
      }
    }
    if (mag < (3*32)**2 && this.hurt <= 0) {
      delta.mult(-2);
    }
    delta.div(sqrt(mag));
    
    if (this.hurt > 0) {
      this.hurt--;
      delta.mult(-6.4);
    }

    checkCollisions(this.pos,delta,7,7,-8,-8);
  }
  hit() {
    this.hurt = 10;
    this.health--;
    if (this.health <= 0) {
      this.destroy();
    }
  }
}
entityIDs.bone = class Bone extends Entity {
  constructor(vel,x,y) {
    super(0,0);
    this.pos.x = x;
    this.pos.y = y;
    this.vel = vel;
    this.vel.normalize().mult(3);
    this.pos.add(this.vel.copy().mult(10));
    this.beenhit = false;
  }
  render() {
    push();
    translate(this.pos);
    image(textures.bone,-8,-8,16,16);
    translate(this.pos.copy().mult(-1));
    pop();
  }
  update() {
    var mag = player.pos.copy().sub(this.pos).magSq();
    if (mag < (0.7*32)**2) {
      player.health--;
      this.destroy();
    }
    
    this.pos.add(this.vel);
      if (check(this.pos,7,7) || check(this.pos,7,-8) || check(this.pos,-8,-8) || check(this.pos,-8,7)) {
        this.destroy();
      }
    /*checkCollisions(this.pos,this.vel,7,7,-8,-8,(id)=>{
      if (id != 0) {
        this.destroy();
      }
    });*/
  }
  hit() {
    this.destroy();
    /*if (!this.beenhit) {
      this.beenhit = true;
      this.vel.mult(-1);
    }*/
  }
}

class Room {
  constructor(url) {
    var data = loadJSON(url,()=>{
      this.tiles = data.tilemap;
      this.entities = data.entitymap;
      this.rotates = data.rotates;
      this.width = this.tiles.length;
      this.height = this.tiles[0].length;
    });
  }
}

var screenScale;
var mapBuf;
var minTileX;
var minTileY;
var tilemap = {};
var entities = [];
var roomMap = {};
var potentialRoomMap = {};
var player = {};
var loaded = false;

var textures = {};

function preload() {
  var cobble_wall = new joinTile("assets/cobble-wall.png",1);
  var artemis_wall = new joinTile("assets/artemis-wall.png",2);
  var wood_wall = new joinTile("assets/wood-wall.png",3);
  var loot_chest = new Tile("assets/loot-chest.png",4);
  var key = new Tile("assets/key.png",5);
  var lock = new Tile("assets/lock.png",6);
  var exit = new Tile("assets/exit.png",7);
  
  player.tex = loadImage("assets/player.png");
  player.swordtex = loadImage("assets/elisa-sword.png");
  textures.skeleton = loadImage("assets/skele.png");
  textures.skeleton_1 = loadImage("assets/skele-1.png");
  textures.bone = loadImage("assets/bone.png");
  
  for (var i in rooms) {
    rooms[i] = new Room(rooms[i]);
  }
}

function setup() {
  createCanvas(1, 1);
  windowResized();
  
  player.coins = 0;
  player.health = 10;
  player.keys = 0;
  player.swordrot = 0;
  player.swordflip = 1;
  
  start();

  loaded = true;
}

async function start() {
  player.pos = createVector(0,0);
  
  roomMap = {};
  potentialRoomMap = {};
  generateRooms();
  
  tilemap = {};
  entities = [];
  for (var i in roomMap) {
    var rx = Number(i.match(/(.*?),/)[1]);
    var ry = Number(i.match(/,(.*)/)[1]);
    var tm = roomMap[i].tiles;
    var em = roomMap[i].entities;
    var rot = floor(random()*4);
    for (var y = 0; y < 15; y++) {
      for (var x = 0; x < 15; x++) {
        var sx = x;
        var sy = y;
        if (rot == 1) {sx = 14-y; sy = x;}
        if (rot == 2) {sx = 14-x; sy = 14-y;}
        if (rot == 3) {sx = y; sy = 14-x;}
        
        var tx = rx*14+sx;
        var ty = ry*14+sy;

        if (em[y][x] != 0) {
          var e = new entityIDs[em[y][x]](tx,ty);
        }
        
        tilemap[ty] = tilemap[ty] ?? {};
        if (tilemap[ty][tx] == 8 && tm[y][x] == 8) {
          tilemap[ty][tx] = 0;
          continue;
        }
        
        tilemap[ty][tx] = tm[y][x];
      }
    }
  }
  for (var y in tilemap) {
    for (var x in tilemap[y]) {
      if (tilemap[y][x] == 8) {tilemap[y][x] = 1;}
    }
  }
  
  var maxHeight = Object.keys(tilemap).length;
  var maxWidth = 0;
  for (var y in tilemap) {
    maxWidth = max(maxWidth,Object.keys(tilemap[y]).length);
  }
  
  minTileX = 0;
  minTileY = 0;
  for (var y in tilemap) {
    minTileY = min(minTileY,y);
    for (var x in tilemap[y]) {
      minTileX = min(minTileX,x);
    }
  }

  for (var i = 0; i < entities.length; i++) {
    entities[i].pos.x -= 14*16;
    entities[i].pos.y -= 14*16;
  }

  mapBuf = createGraphics(maxWidth*32,maxHeight*32);
  mapBuf.scale(32,32);
  mapBuf.translate(-minTileX,-minTileY);
  mapBuf.noStroke();
  for (var i in roomMap) {
    var rx = Number(i.match(/(.*?),/)[1]);
    var ry = Number(i.match(/,(.*)/)[1]);
    mapBuf.fill("#9b7653");
    mapBuf.rect(rx*14,ry*14,15,15)
  }
  for (var y in tilemap) {
    y = Number(y);
    for (var x in tilemap[y]) {
      x = Number(x);
      var id = tilemap[y][x];
      if (id == 0) {continue;}
      tileIDs[id].render(x,y,mapBuf,tilemap);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  //screenScale = min(windowWidth, windowHeight)/256;
  screenScale = min(windowWidth, windowHeight)/512;
  //screenScale = min(windowWidth, windowHeight)/1024;
  //screenScale = min(windowWidth, windowHeight)/2048;
  //screenScale = min(windowWidth, windowHeight)/4096;
}

function draw() {
  translate(windowWidth/2,windowHeight/2);
  scale(screenScale, screenScale);
  
  background("#6a6a6a");
  
  translate(player.pos.copy().mult(-1));
  
  /*push();
  noStroke();
  scale(32*14,32*14);
  translate(-0.5,-0.5);
  fill("#9b7653")
  for (var i in roomMap) {
    var x = Number(i.match(/(.*?),/)[1]);
    var y = Number(i.match(/,(.*)/)[1]);
    translate(x,y);
    rect(0,0,1,1);
    //roomMap[i].render();
    translate(-x,-y);
  }
  pop();*/
  
  // Draw map buffer every frame without having to redraw each of the tiles every frame.
  image(mapBuf,minTileX*32-15*16,minTileY*32-15*16,mapBuf.width,mapBuf.height);
  for (var i = 0; i < entities.length; i++) {
    entities[i].render();
  }
  
  translate(player.pos);
  
  image(player.tex,-9,-15,18,30);

  swordControls();
  
  push();
  scale(player.swordflip,1);
  rotate((player.swordrot + HALF_PI) * player.swordflip)
  image(player.swordtex,-7.5,-80,15,63);
  pop();
  
  textAlign(CENTER);
  text("Keys:"+player.keys+" Coins:"+player.coins+" Health:"+player.health,0,-17);
}

setInterval(timer,1000/60);

function timer() {
  for (var i = 0; i < entities.length; i++) {
    entities[i].update();
  }
  controls();
}

function controls() {
  if (!loaded) {return;}
  
  var d = createVector(0,0);
  if (keyIsDown(87)) {d.y -= 1;}
  if (keyIsDown(83)) {d.y += 1;}
  if (keyIsDown(65)) {d.x -= 1;}
  if (keyIsDown(68)) {d.x += 1;}
  var mag = d.mag();
  if (mag == 0) {return;}
  d.mult(4/mag);
  
  checkCollisions(player.pos,d,7,7,-8,-8,(id,x,y)=>{
    if (id == 4) {
      updateTilemap(x,y,0);
      player.coins+=5;
    }
    if (id == 5) {
      updateTilemap(x,y,0);
      player.keys++;
    }
    if (id == 6 && player.keys > 0) {
      updateTilemap(x,y,0);
      player.keys--;
    }
    if (id == 7) {
      start();
    }
  })
}

function swordControls() {
  var deltaX = mouseX - windowWidth/2;
  var deltaY = mouseY - windowHeight/2;
  var rot = Math.atan2(deltaY, deltaX);
  player.swordflip = rot == player.swordrot ? player.swordflip : Math.sign(player.swordrot-rot);

  function swordCheck(dir) {
    var rotPos = p5.Vector.fromAngle(dir,1);
    var c1 = rotPos.copy().mult(63).add(player.pos);
    var c2 = rotPos.copy().mult(42).add(player.pos);
    var c3 = rotPos.copy().mult(21).add(player.pos);
    return check(c1,0,0) || check(c2,0,0) || check(c3,0,0);
  }

  if (!swordCheck(rot)) {
    player.swordrot = rot;
  }

  if (swordCheck(player.swordrot)) {
    var pos = 0;
    var neg = 0;
    for (var i = 0; i < 1; i+=0.05) {
      if (i == 0) {continue;}
      var dir = player.swordrot+(i*PI);
      if (!swordCheck(dir)) {
        pos = dir;
        break;
      }
    }
    for (var i = 0; i < 1; i+=0.05) {
      if (i == 0) {continue;}
      var dir = player.swordrot-(i*PI);
      if (!swordCheck(dir+TWO_PI)) {
        neg = dir;
        break;
      }
    }
    if ((player.swordrot-pos) ** 2 < (player.swordrot-neg) ** 2) {
      player.swordrot = pos;
    } else {
      player.swordrot = neg;
    }
  }

  for (var i = 0; i < entities.length; i++) {
    if (entities[i].hurt > 0) {continue;}
    var rotPos = p5.Vector.fromAngle(player.swordrot,1);
    var c1 = rotPos.copy().mult(63).add(player.pos);
    var c2 = rotPos.copy().mult(42).add(player.pos);
    var c3 = rotPos.copy().mult(21).add(player.pos);
    var minX = entities[i].pos.x-8;
    var minY = entities[i].pos.y-8;
    var maxX = entities[i].pos.x+7;
    var maxY = entities[i].pos.y+7;
    if (pointBox(c1.x, c1.y, minX, minY, maxX, maxY) || pointBox(c2.x, c2.y, minX, minY, maxX, maxY) || pointBox(c3.x, c3.y, minX, minY, maxX, maxY)) {
      entities[i].hit();
    }
  }
}

function checkCollisions(curVec,addVec,maxX,maxY,minX,minY,tiletype) {
  // Test x
  curVec.add(addVec.x,0);
  if (check(curVec,maxX,maxY,tiletype) || check(curVec,maxX,minY,tiletype) || check(curVec,minX,minY,tiletype) || check(curVec,minX,maxY,tiletype) ||
entitycheck(minX,minY,maxX,maxY,curVec,addVec)) {
    curVec.sub(addVec.x,0);
  }

  curVec.add(0,addVec.y);
  if (check(curVec,maxX,maxY,tiletype) || check(curVec,maxX,minY,tiletype) || check(curVec,minX,minY,tiletype) || check(curVec,minX,maxY,tiletype) || entitycheck(minX,minY,maxX,maxY,curVec,addVec)) {
    curVec.sub(0,addVec.y);
  }
}

function check(curVec,ax,ay,tiletype) {
  //Get tile position
  var tx = floor((curVec.x+(15*16)+ax)/32);
  var ty = floor((curVec.y+(15*16)+ay)/32);
  
  //Check if undefined
  if (tilemap[ty] == undefined) {return true;}
  if (tilemap[ty][tx] == undefined) {return true;}

  if (typeof tiletype == 'function') {
    tiletype(tilemap[ty][tx],tx,ty);
  }
    
  //Check if wall
  if (tilemap[ty][tx] != 0) {return true;}
    
  return false;
}
function entitycheck(minX, minY, maxX, maxY, pos, vel) {
  for (var i = 0; i < entities.length+1; i++) {
    var e;
    if (i >= entities.length) {
      e = player.pos;
    } else {
      e = entities[i].pos;
    }
    if (pos == e) {continue;}
    
    var int = intersect(pos.x+minX, pos.y+minY, pos.x+maxX, pos.y+maxY, e.x-8, e.y-8, e.x+7, e.y+7);
    if (int) {
      //vel = vel.copy().mult(1);
      pos.sub(vel);
      checkCollisions(e,vel,7,7,-8,-8);
      return true;
    }
  }
  return false;
}

function generateRooms() {
  potentialRoomMap["0,0"] = 0;
  selectRoom(rooms.start);
  for (var i = 0; i < 10; i++) {
    // Select a potential room
    var rand = floor(random()*8);
    selectRoom(rooms["r"+rand]);
  }
  for (var i = 0; i < 4; i++) {
    // Select a potential room
    var rand = floor(random()*2);
    selectRoom(rooms["k"+rand]);
  }
  var rand = floor(random()*1);
  selectRoom(rooms["s"+rand]);
  
  var rand = floor(random()*1);
  selectRoom(rooms["e"+rand]);
}

function selectRoom(room) {
  var prm = potentialRoomMap;
  
  var toSel = Object.keys(prm).filter((k)=>{return prm[k] == 0;});
  var sel = toSel[floor(random()*toSel.length)];
  var x = Number(sel.match(/(.*?),/)[1]);
  var y = Number(sel.match(/,(.*)/)[1]);
  
  roomMap[x+","+y] = room;
  //Mark as already generated
  prm[x+","+y] = 1;
  //Propagate potental generation
  //The ?? is used to make sure it is not already generated
  prm[(x+1)+","+y] = prm[(x+1)+","+y] ?? 0;
  prm[(x-1)+","+y] = prm[(x-1)+","+y] ?? 0;
  prm[x+","+(y+1)] = prm[x+","+(y+1)] ?? 0;
  prm[x+","+(y-1)] = prm[x+","+(y-1)] ?? 0;
}

function updateTilemap(x,y,val) {
  tilemap[y][x] = val;
  mapBuf.rect(x,y,1,1);
}

function intersect(aminX, aminY, amaxX, amaxY, bminX, bminY, bmaxX, bmaxY) {
  return (
    aminX <= bmaxX &&
    amaxX >= bminX &&
    aminY <= bmaxY &&
    amaxY >= bminY
  );
}

function pointBox(px, py, minX, minY, maxX, maxY) {
  var t = (
    px >= minX &&
    px <= maxX &&
    py >= minY &&
    py <= maxY
  );
  return t;
}

