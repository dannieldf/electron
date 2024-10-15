// https://www.mongodb.com/pt-br/docs/drivers/node/current/quick-reference/

class Sgbd
{
    static client = null
    static db = null
    static online = false
    static host = 'localhost'
    static port = '27017'
    static schema = 'teste'
    static user = 'admin'
    static pass = ''

    static connect()
    {
        if (!this.db)
        {
            const {MongoClient} = require('mongodb')
            this.client = new MongoClient(this.getUrl())
            this.db = this.client.db(this.schema)
            console.log('Conectado no banco')
        }
        return this.db
    }

    static getUrl()
    {
        var url = 'mongodb://'
        if (this.pass)
        {
            url += (this.user ?? 'admin') + ':' + this.pass + '@'
        }
        url += this.host
        if (this.port)
        {
            url += ':' + this.port + '/'
        }
        return url
    }
}
module.exports = 
    {
        Sgbd: Sgbd,
        db: Sgbd.connect()
    }