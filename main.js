async function main()
{
    const fs = require('node:fs')
    var release = JSON.parse(fs.readFileSync('./release.json'))
    const Server = require('./server/Server')
    await Server.create()
    const deploy = require('./server/Deploy')
    await deploy.process(release).catch(console.dir)
    if (release.versao_desktop)
    {
        const desktop = require('./server/Desktop')
        desktop.init()
    } 
}
main()