const fs = require("fs");
const YAML = require("yaml");

const { emoji: emojis } = require("./emoji.list.json");
const yamlName = "emoji";
const result = { title: yamlName, emojis: [] };

parserSlackEmojiList(emojis);

writeYaml(yamlName, result);

function parserSlackEmojiList(emojis) {
  for (emojiName in emojis) {
    const emojiPath = emojis[emojiName];
    if (isAlias(emojiPath)) {
      const masterName = getAlias(emojiPath);
      setAlias(masterName, emojiName);
    } else {
      setSrcPath(emojiName, emojiPath);
    }
  }
  return result;
}

function isAlias(string) {
  return string.includes("alias:");
}

function getAlias(string) {
  return string.replace("alias:", "");
}

function setAlias(masterName, aliseName) {
  setEmoji({
    name: masterName,
    aliases: [aliseName]
  });
}

function setSrcPath(emojiName, emojiPath) {
  setEmoji({ name: emojiName, src: emojiPath });
}

function setEmoji(source) {
  const index = findSameName(source.name);
  if (index >= 0) {
    updateEmoji(index, source);
  } else {
    addEmoji(source);
  }
}

function findSameName(name) {
  return result.emojis.findIndex(emoji => emoji.name === name);
}

function updateEmoji(index, source) {
  for (const key in source) {
    const type = getType(source[key]);
    if (type === "array") {
      if (!result.emojis[index][key]) result.emojis[index][key] = [];
      result.emojis[index][key].push(...source[key]);
    } else {
      result.emojis[index][key] = source[key];
    }
  }
}

function addEmoji(source) {
  result.emojis.push(source);
}

function getType(value) {
  let type = typeof value;
  return type !== "object"
    ? type
    : Array.isArray(value)
    ? "array"
    : value
    ? "object"
    : "null";
}

function writeYaml(fileName, data) {
  fs.writeFile(`./${fileName}.yaml`, YAML.stringify(data), err => {
    if (err) console.log(err);
    else console.log(`${fileName}.yaml Done`);
  });
}
