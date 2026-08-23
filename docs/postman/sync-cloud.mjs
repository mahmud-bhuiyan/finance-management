import fs from 'fs';

const collectionPath = new URL('./FMS-API.postman_collection.json', import.meta.url);
const payloadPath = new URL('./.cloud-sync-payload.json', import.meta.url);

let raw = fs.readFileSync(collectionPath, 'utf8');
const oldLine =
  "jar.clear(pm.collectionVariables.get('baseUrl').replace(/\\\\/api\\\\/v1$/, ''), function () {});";
const newLine = "jar.clear(pm.collectionVariables.get('baseUrl'), function () {});";
const count = raw.split(oldLine).length - 1;
raw = raw.split(oldLine).join(newLine);
fs.writeFileSync(collectionPath, raw);
console.log('cookie script fixes:', count);

const git = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

const cloudIds = JSON.parse(fs.readFileSync(new URL('./cloud-item-ids.json', import.meta.url), 'utf8'));

function attachIds(items) {
  for (const folder of items) {
    const map = cloudIds[folder.name];
    if (!map) {
      console.warn('no ids for', folder.name);
      continue;
    }
    folder.id = map.id;
    if (folder.item) {
      for (const req of folder.item) {
        const rid = map.items[req.name];
        if (!rid) console.warn('no id for', folder.name, '->', req.name);
        else req.id = rid;
      }
    }
  }
}

attachIds(git.item);

const payload = {
  collectionId: '31395184-5914500b-3ae9-4fe4-9371-f1b01cc92ff0',
  Prefer: 'respond-async',
  collection: {
    info: git.info,
    item: git.item,
    variable: git.variable,
  },
};

fs.writeFileSync(payloadPath, JSON.stringify(payload));

const baseUrl = git.variable.find((v) => v.key === 'baseUrl')?.value;
const hasServerRoot = git.variable.some((v) => v.key === 'serverRoot');
const register = git.item
  .find((f) => f.name === 'Auth')
  ?.item?.find((r) => r.name === 'Register')?.request?.url;
console.log({ baseUrl, hasServerRoot, register, payloadBytes: JSON.stringify(payload).length });
