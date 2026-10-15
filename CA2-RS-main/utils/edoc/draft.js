let region = null;

function setRegion(value) {
  region = value;
}

function takeRegion() {
  const current = region;
  region = null;
  return current;
}

module.exports = { setRegion, takeRegion };
