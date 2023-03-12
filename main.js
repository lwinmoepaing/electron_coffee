const { app, BrowserWindow } = require("electron");
const path = require("path");

const createWindow = () => {
  const iconPath = path.join(
    __dirname,
    "icons",
    process.platform !== "darwin" ? "win" : "mac",
    process.platform !== "darwin" ? "coffee.ico" : "coffee.icns"
  );

  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: iconPath,
  });

  win.loadFile("index.html");
};


app
  .whenReady()
  .then(() => {
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
