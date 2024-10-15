class Desktop
{
    init()
    {
        const {app} = require('electron/main')
        app.whenReady().then
        (
            function()
            {
                Desktop.createWindow()
                app.on
                (
                    'activate', 
                    function() 
                    {
                        if (browser_window.getAllWindows().length === 0) 
                        {
                            Desktop.createWindow()
                        }
                    }
                )
            }
        )
        app.on
        (
            'window-all-closed', 
            function()
            {
                if (process.platform !== 'darwin') 
                {
                    app.quit()
                }
            }
        )
    }

    static createWindow() 
    {
        // https://www.electronjs.org/docs/latest/api/browser-window
        const {BrowserWindow} = require('electron/main')
        var browser_window =
            new BrowserWindow
            (
                {
                    icon: __dirname + '/img/icon.png'
                }
            )
        browser_window.maximize()
        browser_window.removeMenu()
        browser_window.loadFile('index.html')
        //browser_window.loadURL('data:text/html;charset=utf-8,' + encodeURI(html))

    }
}

module.exports = Desktop