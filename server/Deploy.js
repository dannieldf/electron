class Deploy
{
    static scripts =
        [
            function(resolve, reject)
            {
                resolve(true)
            },
            
            function(resolve, reject)
            {
                resolve(false)
            },

            function(resolve, reject)
            {
                resolve(true)
            }
        ]

    static async process(release)
    {
        var i, collection, app
        const {db, Sgbd} = require('./Sgbd')
        try
        {
            collection = db.collection('app')
            app = await collection.findOne()
            if (!app)
            {
                app = 
                    {
                        deploy: 0,
                        date: new Date(),
                        last_script: null
                    }
                await collection.insertOne(app)
            }
            // @todo:
            // if (admin)
            for (i = app.last_script; i < this.scripts.length; i++)
            {
                if (await new Promise(this.scripts[i]))
                {
                    await collection.updateOne
                    (
                        {
                        }, 
                        {
                            $set:
                            {
                                last_script: i
                            }
                        }, 
                        function(error, result)
                        {
                            if (error) throw error
                            console.log('Script de deploy ' + i + ' executado com sucesso')
                        }
                    )
                }
                else
                {
                    console.log('Script de deploy ' + i + ' falhou. Deploy interrompido')
                    break;
                }
            }
        }
        finally
        {
            await Sgbd.client.close()
        }
    }

    static async restart()
    {
        // @todo:
        // if (admin)
        const {db} = require('./Sgbd')
        await db.collection('app').deleteOne
        (
            {},
            function(){}
        )
        this.process()

    }
}
module.exports = Deploy