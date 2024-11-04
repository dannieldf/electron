class Usuario
{
    static async dadosCadastro()
    {
        var i, sql, consulta, resultado
        resultado = {}
        if (!app.versao_desktop)
        {
            sql = 
                `
                select
                    c.id as id_instituicao,
                    c.nome as instituicao,
                    s.id as id_setor,
                    s.nome as setor
                from private.cliente c
                left join setor s
                    on s.id_instituicao = c.id
                order by
                    c.nome,
                    s.nome
                `
            consulta = await db.query(sql).rows
            resultado.instituicoes = []
            for (i in consulta)
            {
                if (typeof resultado.instituicoes[consulta[i]['id_instituicao']] == 'undefined')
                {
                    resultado.instituicoes[consulta[i]['id_instituicao']] = 
                        {
                            nome: resultado.instituicoes[consulta[i]['instituicao']],
                            setores: {}
                        }
                }
                resultado.instituicoes[consulta[i]['id_instituicao']]['setores'][consulta[i]['id_setor']] =
                   consulta[i]['setor']
            }
        }
        return resultado
    }
}

module.exports = Usuario