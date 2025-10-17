let stars = [];
let starImg = null;
const MAX_STARS = 90;
let frozen = false;
let _freezeDebounce = 0;

function prepareInteraction() {
  // optional PNG
  starImg = loadImage('/images/star.png', () => {}, () => { starImg = null; });
}

function drawInteraction(faces, hands) {
  // pick one hand (right if available)
  const hand = hands.find(h => h.handedness === "Right") || hands[0];
  if (!hand) return;

  //background gradient
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(5, 5, 20), color(40, 30, 70), inter);
    stroke(c);
    line(0, y, width, y);
  }

  //background stars
  noStroke();
  for (let i = 0; i < 100; i++) {
    fill(255, random(20, 120));
    circle(random(width), random(height), random(2, 5));
  }

  // hand landmarks
  const tip = hand.index_finger_tip;
  const pinky = hand.pinky_finger_tip;
  const thumb = hand.thumb_tip;

  // control star size with pinky ↔ thumb distance
  const d = dist(thumb.x, thumb.y, pinky.x, pinky.y);
  let liveSize = map(d, 10, 220, 8, 48, true);
  liveSize += sin(frameCount * 0.08) * 2; // small pulsing motion

  // create moving star trail
  const last = stars[stars.length - 1];
  if (!frozen && (!last || dist(last.x, last.y, tip.x, tip.y) > 18)) {
    stars.push({
      x: tip.x,
      y: tip.y,
      scale: random(0.8, 1.4),
      phase: random(TWO_PI),
      t: frameCount
    });
    if (stars.length > MAX_STARS) stars.shift();
  }

  // draw stars
  push();
  imageMode(CENTER);
  noStroke();
  for (let s of stars) {
    let starSize = liveSize * (s.scale || 1);
    starSize += sin(frameCount * 0.08 + (s.phase || 0)) * 2; // twinkle

    if (starImg) {
      image(starImg, s.x, s.y, starSize, starSize);
    } else {
      fill(255);
      circle(s.x, s.y, starSize);
    }
  }
  pop();

  // glowing constellation lines
push();
blendMode(ADD); 
strokeWeight(1.2);
const start = max(0, stars.length - 100);
for (let i = start; i < stars.length; i++) {
  const a = stars[i];
  for (let j = i - 12; j < i; j++) {
    if (j < 0) continue;
    const b = stars[j];
    const dd = dist(a.x, a.y, b.x, b.y);

    if (dd < 140) {
      const alpha = map(dd, 0, 140, 200, 0); // fade with distance

      //outer
      stroke(200, alpha * 0.35);
      strokeWeight(3);
      line(a.x, a.y, b.x, b.y);

      //inner
      stroke(255, alpha);
      strokeWeight(1.2);
      line(a.x, a.y, b.x, b.y);
    }
  }
}
pop();

}


