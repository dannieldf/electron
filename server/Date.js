class Date
{
    static diferencaEmDias(data1, data2)
    {
        const umDiaEmMs = 24 * 60 * 60 * 1000 // Milissegundos em um dia
        const diferencaEmMs = Math.abs(data2 - data1) // Diferença absoluta em milissegundos
        const diferencaEmDias = diferencaEmMs / umDiaEmMs // Converte a diferença de milissegundos para dias
        return diferencaEmDias
    }

    static adicionarMinutos(data, minutos)
    {
        data.setMinutes(data.getMinutes() + minutos)
        return data
    }
}

module.exports = Date