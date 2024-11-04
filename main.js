var reprocessar_deploy = 0
global.metodo_inicial = 'Requisicao.carrega'
global.titulo = 'SimbaPremium'
global.data = '2024-10-25'
global.formidable = require('formidable')
global.fs = require('node:fs')
global.app = JSON.parse(fs.readFileSync('./release.json'))
global.date = require('./server/Date')
global.db = require('./server/Sgbd')
global.files = require('./server/Files')
global.email = require('./server/Email')
global.format = require('./server/Format')
global.config = require('./server/Config')
global.server = require('./server/Server')
global.session = require('./server/Session')
global.cookies = require('./server/Cookies')
global.pagina = require('./server/Pagina')
global.sequence = require('./server/Sequence')

async function main()
{
    console.log('app: ', app)
    await db.start()
    console.log(db.on ? 'Banco on' : 'Banco off\n\nSERVIDOR NÃO PODE SER LEVANTADO!\n')
    if (db.on)
    {
        const deploy = require('./server/Deploy')
        if (reprocessar_deploy && app.servidor_bd == 'D')
        {
            await deploy.reset()
        }
        else
        {
            await deploy.process().catch(console.dir)
        }
        await server.start()
        await session.start()
        await sequence.start()
        await email.start()
        if (app.versao_desktop)
        {
            const desktop = require('./server/Desktop')
            desktop.start()
        }
        console.log('\nINICIALIZAÇÃO CONCLUÍDA!\n')
    }
}
main()