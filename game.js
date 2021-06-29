kaboom({
  global: true,
  fullscreen: true,
  scale: 1,
  debug: true,
  clearColor: [0.5, 0.8, 1, 1],
});

loadRoot("./sprites/");
loadSprite("coin", "coin.png");
loadSprite("goombaOne", "goombaOne.png");
loadSprite("goombaTwo", "goombaTwo.png");
loadSprite("tile", "tile.png");
loadSprite("brick", "brick.png");
loadSprite("surprise", "surprise.png");
loadSprite("unboxed", "unboxed.png");
loadSprite("plumber", "plumber.png");
loadSprite("mushroom", "mushroom.png");
loadSprite("flower", "flower.png");
loadSprite("pipe", "pipe.png");
loadSprite("pipe-top-left", "pipe-top-left.png");
loadSprite("pipe-top-right", "pipe-top-right.png");
loadSprite("pipe-bottom-left", "pipe-bottom-left.png");
loadSprite("pipe-bottom-right", "pipe-bottom-right.png");

loadSprite("blue-brick", "blue-brick.png");
loadSprite("blue-goombaOne", "blue-goombaOne.png");
loadSprite("blue-rock", "blue-rock.png");
loadSprite("blue-surprise", "blue-surprise.png");
loadSprite("blue-tile", "blue-tile.png");

scene("game", ({ level, score }) => {
  layers(["bg", "obj", "ui"], "obj");

  const maps = [
    [
      "                                ",
      "                                ",
      "                                ",
      "           *                    ",
      "                                ",
      "                                ",
      "     $$  % ==     -+            ",
      "             ^  ^ ()            ",
      "=====================   ========",
    ],
    [
      "£                                ",
      "£                                ",
      "£                                ",
      "£                                ",
      "£         @@@                    ",
      "£                          x     ",
      "£         % ==          x  x  -+ ",
      "£             zz     z     x  () ",
      "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
    ],
  ];

  const levelConfig = {
    width: 20,
    height: 20,
    "=": [sprite("tile"), solid()],
    $: [sprite("coin"), "coin"],
    "%": [sprite("surprise"), solid(), "coin-surprise"],
    "@": [sprite("blue-surprise"), solid(), "coin-surprise", scale(0.5)],
    "*": [sprite("surprise"), solid(), "mushroom-surprise"],
    x: [sprite("blue-surprise"), solid(), "mushroom-surprise", scale(0.5)],
    "}": [sprite("unboxed"), solid()],
    "!": [sprite("blue-brick"), solid(), scale(0.5)],
    "£": [sprite("blue-brick"), solid(), scale(0.5)],
    "(": [sprite("pipe-bottom-left"), solid(), scale(0.5)],
    ")": [sprite("pipe-bottom-right"), solid(), scale(0.5)],
    "-": [sprite("pipe-top-left"), solid(), scale(0.5), "pipe"],
    "+": [sprite("pipe-top-right"), solid(), scale(0.5), "pipe"],
    "^": [sprite("goombaOne"), solid(), "danger"],
    z: [sprite("blue-goombaOne"), solid(), "danger", scale(0.5)],
    "#": [sprite("mushroom"), solid(), "mushroom", body()],
  };

  const gameLevel = addLevel(maps[level], levelConfig);

  const scoreLabel = add([
    text(score),
    pos(30, 6),
    layer("ui"),
    { value: score },
  ]);

  add([text("level " + parseInt(level + 1)), pos(4, 20)]);

  function big() {
    let timer = 0;
    let isBig = false;
    return {
      update() {
        if (isBig) {
          timer -= dt();
          if (timer <= 0) {
            this.smallify();
          }
        }
      },
      isBig() {
        return isBig;
      },
      smallify() {
        CURRENT_JUMP_FORCE = JUMP_FORCE;
        this.scale = vec2(1);
        timer = 0;
        isBig = false;
      },
      bigify(time) {
        CURRENT_JUMP_FORCE = BIG_JUMP_FORCE;
        this.scale = vec2(2);
        timer = time;
        isBig = true;
      },
    };
  }

  const player = add([
    sprite("plumber"),
    solid(),
    big(),
    pos(30, 0),
    origin("bot"),
  ]);

  player.on("headbump", (obj) => {
    if (obj.is("coin-surprise")) {
      gameLevel.spawn("$", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("}", obj.gridPos.sub(0));
    }
    if (obj.is("mushroom-surprise")) {
      gameLevel.spawn("#", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("}", obj.gridPos.sub(0));
    }
  });

  player.collides("mushroom", (m) => {
    destroy(m);
    player.bigify(6);
  });

  player.collides("coin", (c) => {
    destroy(c);
    scoreLabel.value++;
    scoreLabel.text = scoreLabel.value;
  });

  player.collides("danger", (d) => {
    // if (isJumping) {
    //   destroy(d);
    // } else {
    //   go("lose", { score: score });
    // }
  });

  player.collides("pipe", () => {
    keyPress("down", () => {
      go("game", {
        level: (level + 1) % maps.length,
        score: scoreLabel.value,
      });
    });
  });

  const MOVE_SPEED = 120;
  const JUMP_FORCE = 360;
  let CURRENT_JUMP_FORCE = 360;
  const BIG_JUMP_FORCE = 550;
  let isJumping = true;
  const FALL_DEATH = 400;

  keyDown("left", () => {
    player.move(-MOVE_SPEED, 0);
  });
  keyDown("right", () => {
    player.move(MOVE_SPEED, 0);
  });
  keyDown("up", () => {
    player.move(0, -MOVE_SPEED);
  });
  keyDown("down", () => {
    player.move(0, MOVE_SPEED);
  });
  // keyDown("space", () => {
  //   if (player.grounded()) {
  //     isJumping = true;
  //     player.jump(CURRENT_JUMP_FORCE);
  //   }
  // });

  // player.action(() => {
  //   if (player.grounded()) {
  //     isJumping = false;
  //   }
  // });

  player.action(() => {
    camPos(player.pos);
    // if (player.pos.y >= FALL_DEATH) {
    //   go("lose", { score: scoreLabel.value });
    // }
  });

  // action("mushroom", (m) => {
  //   m.move(10, 0);
  // });

  // const ENEMY_SPEED = 20;

  // action("danger", (d) => {
  //   d.move(-ENEMY_SPEED, 0);
  // });
});

scene("lose", ({ score }) => {
  add([text(score, 32), origin("center"), pos(width() / 2, height(), 2)]);
});

start("game", { level: 0, score: 0 });
