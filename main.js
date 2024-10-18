global.db = require('./server/Sgbd')
global.fs = require('node:fs')
global.config = JSON.parse(fs.readFileSync('./release.json'))

async function main()
{
    const server = require('./server/Server')
    await server.start()
    await db.start()
    console.log(db.on ? 'Banco on' : 'Banco off')
    if (db.on)
    {
        const deploy = require('./server/Deploy')
        if (config.ambiente_bd == 'D')
        {
            await deploy.reset()
        }
        else
        {
            await deploy.process().catch(console.dir)
        }
    }
    if (config.versao_desktop)
    {
        const desktop = require('./server/Desktop')
        desktop.start()
    }
}
main()