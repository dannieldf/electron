class Sequence
{
    #ultimo_valor

    static async next()
    {
        this.ultimo_valor++
        await config.set('sequence', this.ultimo_valor)
        return this.ultimo_valor
    }

    static async start()
    {
        this.ultimo_valor = await config.get('sequence', 0)
    }
}

module.exports = Sequence