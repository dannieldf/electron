const { app, BrowserWindow } = require('electron');
app.whenReady().then
(
    () => 
    {
        mainWindow = 
            new BrowserWindow
            (
                {
                    icon: __dirname + '/img/icon.png'
                }
            );
        mainWindow.maximize();
        mainWindow.removeMenu();
        mainWindow.loadFile('index.html');
    }
);