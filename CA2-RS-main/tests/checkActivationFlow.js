const fs = require("fs");
const path = require("path");
const Module = require("module");
const babel = require("@babel/core");

const root = path.resolve(__dirname, "..");
const store = new Map();
const nav = { calls: [], ready: true };

const asyncStorage = {
  getItem: async (key) => (store.has(key) ? store.get(key) : null),
  setItem: async (key, value) => {
    store.set(key, String(value));
  },
  removeItem: async (key) => {
    store.delete(key);
  },
};

const mocks = {
  react: { default: {} },
  "react-native": { Platform: { OS: "android" } },
  "@react-native-async-storage/async-storage": asyncStorage,
  "@react-native-community/netinfo": {
    fetch: async () => ({ isConnected: false }),
  },
  "react-native-device-info": {
    getUniqueId: async () => "device-1",
  },
  "expo-linking": {
    getInitialURL: async () => null,
    addEventListener: () => ({ remove() {} }),
  },
  "react-native-play-install-referrer": {
    PlayInstallReferrer: {
      getInstallReferrerInfo(callback) {
        callback({ installReferrer: "c=654321" }, null);
      },
    },
  },
};

const navigationModulePath = path.join(root, "screen", "RootNavigation.js");
mocks[navigationModulePath] = {
  navigationRef: {
    isReady: () => nav.ready,
    navigate(name, params) {
      nav.calls.push({ name, params });
    },
  },
  navigate(name, params) {
    nav.calls.push({ name, params });
  },
};

const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (Object.prototype.hasOwnProperty.call(mocks, id)) return mocks[id];
  try {
    const resolved = Module._resolveFilename(id, this);
    const normalized = resolved.split(path.sep).join("/");
    if (normalized.endsWith("/screen/RootNavigation.js")) {
      return mocks[navigationModulePath];
    }
  } catch (error) {
    // Fall through to Node's own resolver error.
  }
  return originalRequire.apply(this, arguments);
};

const originalJs = Module._extensions[".js"];
Module._extensions[".js"] = function (mod, filename) {
  const normalized = filename.split(path.sep).join("/");
  if (!normalized.includes("/CA2-RS-main/") || normalized.includes("/node_modules/")) {
    return originalJs(mod, filename);
  }
  const source = fs.readFileSync(filename, "utf8");
  const transformed = babel.transformSync(source, {
    filename,
    babelrc: false,
    configFile: false,
    sourceMaps: false,
    presets: ["babel-preset-expo"],
  });
  mod._compile(transformed.code, filename);
};

function load(relativePath) {
  const filename = path.join(root, relativePath);
  delete require.cache[filename];
  return require(filename);
}

function resetAppModules() {
  for (const key of Object.keys(require.cache)) {
    const normalized = key.split(path.sep).join("/");
    if (
      normalized.includes("/CA2-RS-main/utils/") ||
      normalized.endsWith("/screen/RootNavigation.js")
    ) {
      delete require.cache[key];
    }
  }
}

const failures = [];
function check(name, condition) {
  if (!condition) failures.push(name);
  console.log((condition ? "PASS " : "FAIL ") + name);
}

async function main() {
  const cipher = load("utils/activationCipher.js");
  const token = cipher.encryptActivationCode("123456");
  check("encrypt returns a token", typeof token === "string" && token.length > 20);
  check("decrypt returns 123456", cipher.decryptActivationCode(token) === "123456");
  check("plain digits stay plain", cipher.resolveActivationCode("123456") === "123456");
  check("bad token is empty", cipher.resolveActivationCode("not-a-code") === "");
  check("empty value is empty", cipher.resolveActivationCode("") === "");

  const client = load("utils/ca2RsClient.js");
  check(
    "tax id keeps hyphen",
    client.accountId("0103930279-999") === "0103930279-999"
  );
  check("tax id trims spaces", client.accountId("  0103930279-999  ") === "0103930279-999");
  check("empty tax id stays empty", client.accountId("   ") === "");

  store.clear();
  nav.calls = [];
  resetAppModules();
  let activation = load("utils/activationCode.js");
  let links = load("utils/deepLinkHandler.js");
  check(
    "https activate url is recognized",
    links.isActivateUrl("https://applink.nacencomm.vn/activate?c=123456") === true
  );
  check(
    "apprs activate url is recognized",
    links.isActivateUrl("apprs://activate?c=" + token) === true
  );
  check(
    "login url is not activate",
    links.isActivateUrl("https://applink.nacencomm.vn/login") === false
  );
  check(
    "https link decrypts to 123456",
    activation.codeFromActivateUrl(
      "https://applink.nacencomm.vn/activate?c=" + encodeURIComponent(token)
    ) === "123456"
  );
  check(
    "apprs link decrypts to 123456",
    activation.codeFromActivateUrl("apprs://activate?c=" + token) === "123456"
  );
  check("referrer c=654321", activation.codeFromReferrer("c=654321") === "654321");
  check(
    "encoded referrer decrypts",
    activation.codeFromReferrer("c%3D" + encodeURIComponent(token)) === "123456"
  );

  await activation.captureInstallReferrerOnce();
  check(
    "play referrer is stored",
    (await activation.readPendingActivationCode()) === "654321"
  );

  nav.ready = true;
  await links.openPendingActivationIfNeeded();
  check(
    "unactivated install opens activation with the code",
    nav.calls.length === 1 &&
      nav.calls[0].name === "Kichhoat" &&
      nav.calls[0].params.c === "654321"
  );

  store.clear();
  nav.calls = [];
  resetAppModules();
  activation = load("utils/activationCode.js");
  links = load("utils/deepLinkHandler.js");
  await asyncStorage.setItem("@idcts", "99");
  await asyncStorage.setItem("@pending_activation_code", "654321");
  await links.openPendingActivationIfNeeded();
  check("activated device does not open activation", nav.calls.length === 0);

  store.clear();
  nav.calls = [];
  resetAppModules();
  links = load("utils/deepLinkHandler.js");
  asyncStorage.getItem = async () => {
    throw new Error("storage down");
  };
  let threw = false;
  try {
    await links.openPendingActivationIfNeeded();
  } catch (error) {
    threw = true;
  }
  check("startup still finishes when storage throws", threw === false && nav.calls.length === 0);
  asyncStorage.getItem = async (key) => (store.has(key) ? store.get(key) : null);

  const html = fs.readFileSync(path.join(root, "..", "applink", "activate", "index.html"), "utf8");
  check("activate page targets the CA2 package", html.includes("package=com.rs.ca2"));
  check("activate page uses the apprs scheme", html.includes("scheme=apprs"));
  check("activate page keeps the code query", html.includes('encodeURIComponent("c=" + code)'));
  check("activate page falls back to CH Play", html.includes("play.google.com/store/apps/details?id=com.rs.ca2"));

  if (failures.length) {
    console.log("FAILED " + failures.length);
    process.exit(1);
  }
  console.log("ALL PASSED");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
