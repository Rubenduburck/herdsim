  var config = {
  type: Phaser.AUTO,
  parent: 'herdsim',
  width: 800,
  height: 600,
  disableContextMenu: true,
  scene: {
      create: create,
      update: update
  }
};

var text;

var game = new Phaser.Game(config);



function create ()
{
  // vars
  this.startDensity = 1;
  this.startInfectiousness = 0;
  this.startDuration = 1;
  this.startMobility = 0;

  this.density = [['HIGH', 800], ['MEDIUM', 400], ['LOW', 200],this.startDensity]
  this.infectiousness = [['HIGH', .1], ['MEDIUM', .05], ['LOW', .01],this.startInfectiousness]
  this.duration = [['LONG', 400], ['MEDIUM', 200], ['SHORT', 100],this.startDuration]
  this.mobility = [['HIGH', 200], ['SEMI-QUARANTINE', 50], ['FULL-QUARANTINE', 10],this.startMobility]

  this.N = this.density[0][1]
  this.radius = 300;
  this.infectionRange = 10;
  this.infectionChance = this.infectiousness[0][1]
  this.infectionDuration = 200;
  this.immunityPossible = true;
  this.reinfectionPossible = false;
  this.quarantineRange = 200;

  var textspacing = 15;
  var yButtons = [10, 60, 90, 120, 150]

  var buttonpos = 0;
  this.add.text(10, yButtons[buttonpos], 'Restart the simulation for changes to take effect', {font: '16px Courier', fill: '#0077cc' })
  const restartbutton = this.add.text(10,  yButtons[buttonpos] + textspacing, 'Restart', {font: '16px Courier', fill: '#00ff00' })
        .setInteractive()
        .on('pointerdown', () => this.restartGame(restartbutton))
        .on('pointerout', () => this.buttonReststate(restartbutton))
        .on('pointerover', () => this.buttonHoverstate(restartbutton))

  buttonpos += 1;
  this.add.text(10, yButtons[buttonpos], 'Infectiousness', {font: '16px Courier', fill: '#0077cc' })
  const infectbutton = this.add.text(10, yButtons[buttonpos] + textspacing, 'HIGH', {font: '16px Courier', fill: '#00ff00' })
        .setInteractive()
        .on('pointerdown', () => this.infectbuttonclick(infectbutton))
        .on('pointerout', () => this.buttonReststate(infectbutton))
        .on('pointerover', () => this.buttonHoverstate(infectbutton))

  buttonpos += 1;
  this.add.text(10, yButtons[buttonpos], 'Pop density', {font: '16px Courier', fill: '#0077cc' })
  const densitybutton = this.add.text(10, yButtons[buttonpos] + textspacing, 'HIGH', {font: '16px Courier', fill: '#00ff00' })
        .setInteractive()
        .on('pointerdown', () => this.densitybuttonclick(densitybutton))
        .on('pointerout', () => this.buttonReststate(densitybutton))
        .on('pointerover', () => this.buttonHoverstate(densitybutton))

  buttonpos += 1;
  this.add.text(10, yButtons[buttonpos], 'Infection duration', {font: '16px Courier', fill: '#0077cc' })
  const durationbutton = this.add.text(10, yButtons[buttonpos] + textspacing, 'LONG', {font: '16px Courier', fill: '#00ff00' })
        .setInteractive()
        .on('pointerdown', () => this.durationbuttonclick(durationbutton))
        .on('pointerout', () => this.buttonReststate(durationbutton))
        .on('pointerover', () => this.buttonHoverstate(durationbutton))

  buttonpos += 1;
  this.add.text(10, yButtons[buttonpos], 'Population mobility', {font: '16px Courier', fill: '#0077cc' })
  const mobilitybutton = this.add.text(10, yButtons[buttonpos] + textspacing, 'HIGH', {font: '16px Courier', fill: '#00ff00' })
        .setInteractive()
        .on('pointerdown', () => this.mobilitybuttonclick(mobilitybutton))
        .on('pointerout', () => this.buttonReststate(mobilitybutton))
        .on('pointerover', () => this.buttonHoverstate(mobilitybutton))

  this.buttonList = [
    [this.infectiousness, infectbutton],
    [this.density, densitybutton],
    [this.duration, durationbutton],
    [this.mobility, mobilitybutton]
  ]

  //const quarantinebutton = this.add.text(100, game.config.height - 20, 'Quarantine', { font: '16px Courier', fill: '#00ff00' })
  //      .setInteractive()
  //      .on('pointerdown', () => this.quarantine(quarantinebutton))
  //      .on('pointerout', () => this.buttonReststate(quarantinebutton))
  //      .on('pointerover', () => this.buttonHoverstate(quarantinebutton))


  this.buttonHoverstate = function(ob){
    ob.setStyle({fill: '#ff0000'})
  }
  this.buttonReststate = function(ob){
    ob.setStyle({fill: '#00ff00'})
  }
  // functions
  this.infectbuttonclick = function(ob){
    this.infectiousness[3] = (this.infectiousness[3] + 1) % 3
    ob.setText(this.infectiousness[this.infectiousness[3]][0])
    this.infectionChance = this.infectiousness[this.infectiousness[3]][1]
  }

  this.densitybuttonclick = function(ob){
    this.density[3] = (this.density[3] + 1) % 3
    ob.setText(this.density[this.density[3]][0])
    this.N = this.density[this.density[3]][1]
  }

  this.durationbuttonclick = function(ob){
    this.duration[3] = (this.duration[3] + 1) % 3
    ob.setText(this.duration[this.duration[3]][0])
    this.infectionDuration = this.duration[this.duration[3]][1]
  }

  this.mobilitybuttonclick = function(ob){
    this.mobility[3] = (this.mobility[3] + 1) % 3
    ob.setText(this.mobility[this.mobility[3]][0])
    this.quarantineRange = this.mobility[this.mobility[3]][1]
  }

  this.restartGame = function(){
    console.log('Restarting');
    this.startSim()
  }
  this.quarantine = function(){
    this.quarantineRange = 25;
    for(var i = 0; i < this.Pop.length; i++){
      this.Pop[i].bound = this.quarantineRange;
    }
  }

  this.randrange = function(a,b){
    X = Math.random();
    return a + X*(b-a)
  }

  this.move = function(ob){
      ob.x += ob.speed * Math.cos(ob.angle * Math.PI / 180);
      ob.y -= ob.speed * Math.sin(ob.angle * Math.PI / 180);
  }

  this.changedir = function(ob){
    if(ob.timer <= 0) {
      var a = this.randrange(-90,90)
      ob.angle += this.randrange(-90,90)
    }
  }

  this.dist = function(ob1, ob2){
    return Math.sqrt((ob1.x - ob2.x)**2 + (ob1.y - ob2.y)**2)
  }

  this.bounds = function(ob){
    // global bound
    if(this.dist(this.origin, ob) > this.radius){
      ob.angle += 180;
    }
    // home bound
    if(this.dist(ob.home, ob) > ob.bound){
      ob.angle +=180;
    }
  }

  this.obtimers = function(ob){
    ob.timer -= 1;
  }

  this.refresh = function(ob){
    if(ob.timer <= 0 ){
      ob.timer = this.randrange(0,200);
    }
  }

  this.infect = function(ob){
    // als wij geinfecteerd zijn
    if(ob.infected) {
      for(var i = 0; i < this.Pop.length; i++){
        var cp = this.Pop[i]
        // als de tegenpartij niet immuun is
        if(cp.immune == false){
          // als herinfectie onmogelijk is
          if(cp.infected == false){
            if(this.dist(ob,cp) < this.infectionRange) {
              if (Math.random() < this.infectionChance) {
                this.Pop[i].infectionTimer = this.infectionDuration;
                this.Pop[i].infected = true;
              }
            }
          }
        }
      }
    }
  }

  this.immunity = function(ob){
    if(ob.infected){
      if (ob.infectionTimer < 0) {
        ob.infected = false;
        ob.immune = true;
      }
      ob.infectionTimer -= 1;
    }
  }

  this.graphics = this.add.graphics({ fillStyle: {color: 0x0077cc }});

  this.cameras.main.setBackgroundColor(0xffffff);
  //text = this.add.text(10, 10, 'Icosahedron', { font: '16px Courier', fill: '#0077cc' });

  this.startSim = function(){
    // physics
    this.ticker = 0;
    this.origin = {
      x: game.config.width/2,
      y: game.config.height/2
    }

    // population
    this.Pop = [];
    for(var i = 0; i < this.N; i++){
      var d = this.randrange(0, this.radius)
      var a = this.randrange(0,360)
      var xSpawn = game.config.width/2 + d * Math.cos(a * Math.PI / 180)
      var ySpawn = game.config.height/2 + d * Math.sin(a * Math.PI / 180)
      this.Pop.push({
        x: xSpawn,
        y: ySpawn,
        home: {x: xSpawn, y: ySpawn},
        bound: this.quarantineRange,
        angle: this.randrange(0,360),
        speed: this.randrange(0,1),
        timer: this.randrange(0,200),
        infected: false,
        immune: false,
        infectionTimer: 0
      })
    }

    this.Pop[0].infected = true;
    this.Pop[0].infectionTimer = 200;
  }
  this.startSim()
}

function update ()
{
this.ticker += 1;

// update buttons
for(var i = 0; i < this.buttonList.length; i++){
  var item = this.buttonList[i][0]
  var text = item[item[3]][0]
  this.buttonList[i][1].setText(text)
}

for(var i = 0; i < this.Pop.length; i++){
  this.obtimers(this.Pop[i])
  this.move(this.Pop[i])
  this.changedir(this.Pop[i])
  this.refresh(this.Pop[i])
  this.bounds(this.Pop[i])
  this.immunity(this.Pop[i])
  this.infect(this.Pop[i])

}


// graphics
this.graphics.clear();

for(var i=0; i< this.Pop.length; i++){
  var person = this.Pop[i]
  var circle = new Phaser.Geom.Circle(person.x, person.y, 5);
  this.graphics.fillStyle(0x0077cc);
  if(person.infected) {
    this.graphics.fillStyle(0xff0000);
  }
  if(person.immune) {
    this.graphics.fillStyle(0x32CD32);
  }
  this.graphics.fillCircleShape(circle);
}

// numbers
this.noTotal = this.Pop.length
this.noInfected = 0
this.noImmune = 0

for(var i = 0; i < this.Pop.length; i++){
  person = this.Pop[i]
  if(person.infected){
    this.noInfected += 1
  }
  if(person.immune){
    this.noImmune += 1
  }
}

  // Compute levels

}
