class Config
{
    static async get(chave, coalesce = null, id_usuario = null)
    {
        var sql, parametros, resultado
        sql = 
            `
            select 
				tipo,
				case 
					when tipo = 'text' 
					then valor 
				end as valor_text,
				case 
					when tipo = 'numeric' 
					then cast(valor as integer) 
				end as valor_numeric,
				case 
					when tipo = 'timestamp' 
					then to_timestamp(valor, 'DD/MM/YYYY HH24:MI:SS') 
				end as valor_timestamp
            from config
            where chave = $1::text
            `
        parametros = [chave]
        if (id_usuario)
        {
            sql += `and id_usuario = $2::numeric`
            parametros.push(id_usuario)
        }
        resultado = await db.query(sql, parametros)
        switch (resultado.rowCount)
        {
            case 0:
                return coalesce
            case 1:
                return resultado.rows[0]['valor_' + resultado.rows[0]['tipo']]
            default:
                // erro
        }
    }

    static async set(chave, valor, id_usuario = null, tipo = 'numeric')
    {
        var sql, parametros, resultado
        if (!['text', 'numeric', 'date'].includes(tipo))
        {
            return false
        }
        sql =
            `
            update config
            set 
                valor = $1::text,
                data_alteracao = now()
            where chave = $2::text
            `
        parametros = [valor, chave]
        if (id_usuario)
        {
            sql += `and id_usuario = $3::numeric`
            parametros.push(id_usuario)
        }
        resultado = await db.query(sql, parametros)
        if (resultado.rowCount == 0)
        {
            sql =
                `
                insert into config
                (
                    chave,
                    valor,
                    tipo,
                    id_usuario,
                    data_cadastro
                )
                values
                (
                    $1::text,
                    $2::text,
                    $3::text,
                    $4::numeric,
                    now()
                )
                `
            parametros =
                [
                    chave,
                    valor,
                    tipo,
                    id_usuario
                ]
            await db.query(sql, parametros)
        }
        return true
    }

    static async getMulti(parametros, id_usuario = null)
    {
        var i, j, sql, chaves, binds, separador, consulta
        chaves = Object.keys(parametros)
        if (chaves.length == 0)
        {
            return {}
        }
        sql = 
            `
            select 
                chave,
				tipo,
				case 
					when tipo = 'text' 
					then valor 
				end as valor_text,
				case 
					when tipo = 'numeric' 
					then cast(valor as integer) 
				end as valor_numeric,
				case 
					when tipo = 'timestamp' 
					then to_timestamp(valor, 'DD/MM/YYYY HH24:MI:SS') 
				end as valor_timestamp
            from config
            where chave in (`
        binds = []
        separador = ``
        j = 0
        for (i in chaves)
        {
            sql += `${separador}$${++j}::text`
            separador  = `, `
            binds.push(chaves[i])
        }
        sql += `)`
        if (id_usuario)
        {
            sql += `
                and id_usuario = $${++j}::numeric`
            binds.push(id_usuario)
        }
        consulta = await db.query(sql, binds)
        for (i in parametros)
        {
            for (j in consulta.rows)
            {
                if (consulta.rows[j].chave == i)
                {
                    parametros[i] = consulta.rows[j]['valor_' + consulta.rows[j]['tipo']]
                    break
                }
            }
        }
        return parametros
    }
}

module.exports = Config