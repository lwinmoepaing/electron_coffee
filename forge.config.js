module.exports = {
  packagerConfig: {
    icon:
      process.platform !== "darwin"
        ? "icons/win/icon.ico"
        : "icons/mac/icon.icns",
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        authors: "Lwin Moe Paing",
        name: "Coffee Maker",
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
      config: {
        authors: "Lwin Moe Paing",
        name: "Coffee Maker",
      },
    },
  ],
};