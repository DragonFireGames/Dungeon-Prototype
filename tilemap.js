
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

class tileMap {
  constructor() {
    this.buf = undefined;
    this.minTileX = 0;
    this.minTileY = 0;
    this.maxWidth = 0;
    this.maxHeight = 0;
    this.map = {};
  }
  initialize() {
    this.maxHeight = Object.keys(tilemap).length;
    for (var y in tilemap) {
      this.maxWidth = max(this.maxWidth,Object.keys(tilemap[y]).length);
    }
    
    for (var y in this.map) {
      this.minTileY = min(this.minTileY,y);
      for (var x in this.map[y]) {
        this.minTileX = min(this.minTileX,x);
      }
    }
  
    this.buf = createGraphics(maxWidth*32,maxHeight*32);
    this.buf.scale(32,32);
    this.buf.translate(-minTileX,-minTileY);
    this.buf.noStroke();
    
  }
  render() {
    for (var y in this.map) {
      y = Number(y);
      for (var x in this.map[y]) {
        x = Number(x);
        var id = this.map[y][x];
        if (id == 0) {continue;}
        tileIDs[id].render(x,y,this.buf,this.map);
      }
    }
  }
  get(x,y) {
    return this.map[y] ?? this.map[y][x];
  }
  set(x,y,val) {
    tilemap[y] = tilemap[y] ?? {};
    tilemap[y][x] = val;
  }
}