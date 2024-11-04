class Requisicao
{
    static carrega(dados)
    {
    }

    static async salvar(dados, usuario)
    {
        var i, sql, parametros, resultado
        parametros = []
        for 
        (
            i of 
            [
                'caso',
                'processo',
                'cpf_cnpj_parte',
                'tipo_parte',
                'nome_parte',
                'juiz',
                'tribunal',
                'vara_juizo',
                'ini_afastamento',
                'fim_afastamento',
                'id_requisicao'
            ]
        )
        {
            dados[i] = dados[i].trim().toUpperCase()
            if (['ini_afastamento', 'fim_afastamento'].includes(i) && !dados[i])
            {
                dados[i] = null
            }
            if (i != 'id_requisicao' || dados.id_requisicao)
            {
                parametros.push(dados[i])
            }
        }
        if (!dados.caso)
        {
            return {erro: 'Caso não informado'}
        }
        if (dados.id_requisicao)
        {
            sql = `
                update requisicao
                set
                    caso = $1::text,
                    processo = $2::text,
                    cpf_cnpj_parte = $3::text,
                    tipo_parte = $4::text,
                    nome_parte = $5::text,
                    juiz = $6::text,
                    tribunal = $7::text,
                    vara_juizo = $8::text,
                    ini_afastamento = to_date($9::text, 'YYYY-MM-DD"T"HH24:MI'),
                    fim_afastamento = to_date($10::text, 'YYYY-MM-DD"T"HH24:MI'),
                    data_alteracao = now(),
                    id_usuario_alteracao = ${usuario.id}
                where id = $11::numeric`
            resultado = await db.query(sql, parametros)
            if (resultado.rowCount)
            {
                resultado = {erro: null}
            }
            else
            {
                resultado = {erro: 'Requisição não foi localizada'}
            }
        }
        else
        {
            sql = `
                insert into requisicao
                (
                    caso,
                    processo,
                    cpf_cnpj_parte,
                    tipo_parte,
                    nome_parte,
                    juiz,
                    tribunal,
                    vara_juizo,
                    ini_afastamento,
                    fim_afastamento,
                    data_cadastro,
                    id_usuario_cadastro,
                    status
                )
                values
                (
                    $1::text,
                    $2::text,
                    $3::text,
                    $4::text,
                    $5::text,
                    $6::text,
                    $7::text,
                    $8::text,
                    to_date($9::text, 'YYYY-MM-DD"T"HH24:MI'),
                    to_date($10::text, 'YYYY-MM-DD"T"HH24:MI'),
                    now(),
                    ${usuario.id},
                    'N'
                )
                returning id`
            resultado = await db.query(sql, parametros)
            resultado = 
                {
                    erro: null, 
                    id_requisicao: resultado.rows[0].id,
                    caso: dados.caso,
                    processo: dados.processo
                }
        }
        return resultado
    }

    static salvarCCS(dados, usuario, arquivos)
    {
        console.log('dados', dados)
        console.log('arquivos', arquivos)
        for (var i in dados.arquivos)
        {
            for (var j in dados.arquivos[i])
            {
                console.log(`arquivo.${i}.${j}`, dados.arquivos[i][j])
            }
        }
    }
}

module.exports = Requisicao