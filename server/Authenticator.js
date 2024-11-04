class Authenticator
{
    static max_tentativas = 10

    static async processEmail(dados)
    {
        var sql, consulta, resultado
        dados.email = dados.email.trim().toLowerCase()
        if (format.validaEmail(dados.email))
        {
            sql = 
                `
                select tentativas
                from usuario
                where email = $1::text
                `
            consulta = (await db.query(sql, [dados.email])).rows
            if (consulta.length == 0)
            {
                const usuario = require('./Usuario')
                resultado = 
                    {
                        situacao: 'email_not_found',
                        dados:
                        {
                            ...{email: dados.email},
                            ...usuario.dadosCadastro(null)
                        }
                    }
            }
            else if (consulta[0]['tentativas'] >= this.max_tentativas_bloqueio)
            {
                resultado = 
                    {
                        situacao: 'blocked_password',
                        dados:
                        {
                            email: dados.email
                        }
                    }
            }
            else
            {
                resultado = 
                    {
                        situacao: 'email_found',
                        dados:
                        {
                            email: 
                                dados.email,
                            senha_bloqueada: 
                                consulta[0].tentativas >= this.max_tentativas
                        }
                    }
            }
        }
        else
        {
            resultado = {situacao: 'invalid_email'}
        }
        return resultado
    }

    static async register(dados)
    {
        // 1. nome obrigatorio
        // 2. email obrigatorio
        // 3. senha obrigatoria
        // 4. cpf obrigatorio
        // 5. cpf valido
        // 6. tipo acesso obrigatorio
        // se 'L'
        // 7. - token tem que ser valido
        // 8. - instituicao obrigatoria
        // 9. - instituicao invalida
        // 10. email nao pode estar cadastrado
        // Obs: deve permitir cadastro com cpf de outro cadastro para permitir novo cadastro quando usuario perder o email
        var i, sql, consulta, binds, id_setor, envio_email, url
        dados.nome = dados.nome.trim().toUpperCase()
        if (!dados.nome)
        {
            return {erro: 'nome_obrigatorio'}
        }
        dados.email = dados.email.trim().toLowerCase()
        if (!dados.email)
        {
            return {erro: 'email_obrigatorio'}
        }
        if (!dados.senha)
        {
            return {erro: 'senha_obrigatoria'}            
        }
        dados.cpf = format.clearMask(dados.cpf)
        if (!dados.cpf)
        {
            return {erro: 'cpf_obrigatorio'}
        }
        if (!format.validaCpf(dados.cpf))
        {
            return {erro: 'cpf_invalido'}
        }
        if (!['L', 'T'].includes(dados.tipo_acesso))
        {
            return  {erro: 'tipo_acesso_obrigatorio'}
        }
        sql = 
            `
            select id
            from usuario
            where email = $1::text
            `
        consulta = (await db.query(sql, [dados.email])).rows
        if (consulta.length)
        {
            return {erro: 'email_ja_cadastrado'}
        }
        if (dados.tipo_acesso == 'L')
        {
            if (!dados.licenca || !dados.instituicao)
            {
                return {erro: 'licenca_invalida'}
            }
            sql =
                `
                select id
                from private.licenca l
                where numero = $1::text
                and id_cliente = $2::numeric
                and data_expiracao > now()
                and id_usuario is null
                `
            consulta = (await db.query(sql, [dados.licenca, dados.instituicao])).rows
            if (consulta.length == 0)
            {
                return {erro: 'licenca_invalida'}
            }
            if (!dados.id_instituicao)
            {
                return {erro: 'instituicao_obrigatoria'}
            }
            sql =
                `
                select 1
                from private.cliente
                where id = $1::numeric
                `
            consulta = (await db.query(sql, [dados.id_instituicao])).rows
            if (consulta.length == 0)
            {
                return {erro: 'instituicao_invalida'}
            }
            dados.setor = dados.setor.trim().toUpperCase()
            sql =
                `
                select id
                from setor
                where nome = $1::text
                and id_cliente = $2::numeric
                `
            consulta = (await db.query(sql, [dados.setor, dados.id_instituicao])).rows
            if (consulta.length)
            {
                id_setor = consulta.rows[0].id
            }
            else
            {
                id_setor = `(select id from rows)`
                sql =
                    `
                    with rows as 
                    (
                        insert into setor
                        (
                            nome,
                            id_cliente
                        )
                        values
                        (
                            $1::text,
                            $2::numeric
                        )
                        returning id

                    );
                    `
                binds = [dados.setor, dados.id_instituicao]
            }
        }
        else
        {
            id_setor = `null`
            sql = ``
            binds = []
        }
        i = binds.length
        sql +=
            `
            insert into usuario
            (
                nome,
                email,
                cpf,
                whatsapp,
                hash_senha,
                tentativas,
                data_cadastro,
                id_setor
            )
            values
            (
                $${++i}::text,
                $${++i}::text,
                $${++i}::text,
                $${++i}::text,
                $${++i}::text,
                0,
                now(),
                ${id_setor}
            )
            returning id;
            `
        binds.push(dados.nome)
        binds.push(dados.email)
        binds.push(dados.cpf)
        binds.push(dados.whatsapp)
        binds.push(format.bcryptEncode(dados.senha))
        consulta = await db.query(sql, binds)
        sql = 
            `
            update usuario 
            set hash_id = '${format.bcryptEncode(consulta.rows[0].id)}'
            where id = ${consulta.rows[0].id}`
        await db.query(sql)
        if (!(await config.get('id_admin')))
        {
            config.set('id_admin', consulta.rows[0].id)
        }
        url = server.getUrl()
        envio_email =
            email.envia
            (
                {
                    assunto: titulo + ' - Cadastro realizado',
                    destinatarios: [dados.email],
                    corpo: 
                        `
                        <p>seu cadastro foi realizado. Acesse o ${titulo} pelo link abaixo</p>
                        <a href="${url}">${url}</a>
                        `
                }
            )
        return {erro: null, envio_email: envio_email}
    }

    static async process(dados)
    {
        // erro
        // 1. erro de autenticacao (email ou senha invalidos)
        // 2. licenca expirada
        // 3. senha bloqueada
        var sql, consulta, hash_sessao, id_usuario, hash_usuario, resultado
        dados.email = dados.email.trim().toLowerCase()
        sql = 
            `
            select
                id,
                hash_id,
                hash_senha,
                tentativas,
                case
                    when data_expiracao < now()
                    then
                        1
                    else
                        0
                end as licenca_expirada
            from usuario
            where email = $1::text
            `
        consulta = await db.query(sql, [dados.email])
        if (consulta.rowCount)
        {
            consulta = consulta.rows[0]
            hash_usuario = consulta.hash_id
            id_usuario = consulta.id
            if (!format.bcryptDecode(dados.password, consulta.hash_senha))
            {
                sql = 
                    `
                    update usuario
                    set tentativas = tentativas + 1
                    where id = $1::numeric
                    `
                await db.query(sql, [consulta.id])
                return {error_msg: 'Credenciais inválidas'}
            }
            if (consulta.licenca_expirada)
            {
                return {error_msg: 'Licença expirada'}
            }
            if (consulta.tentativas >= this.max_tentativas)
            {
                return {error_msg: 'A senha foi bloquada. Por gentileza, gere uma nova'}
            }
            hash_sessao = format.bcryptEncode(await sequence.next())
            sql = 
                `
                update usuario
                set 
                    ultimo_acesso = now(),
                    tentativas = 0
                where id = $1::numeric
            `
            await db.query(sql, [consulta.id])
            sql = 
                `
                insert into sessao
                (
                    ini,
                    fim,
                    id_usuario,
                    hash_id,
                    remember
                )
                values
                (
                    now(),
                    now(),
                    $1::numeric,
                    $2::text,
                    $3::boolean
                )
                returning id
            `
            consulta = await db.query(sql, [consulta.id, hash_sessao, dados.remember])
            session.adiciona
            (
                hash_sessao, 
                dados.remember, 
                id_usuario, 
                hash_usuario,
                consulta.rows[0].id
            )
            /*
            if (dados.get_pending ?? false)
            {
                [nome_classe, nome_metodo] = dados.get_pending.split('.')
                argumento = dados.argument
            }
            else
            {
                [nome_classe, nome_metodo] = metodo_inicial.split('.')
                argumento = {}
            }
            root = __dirname + '/../'
            classe = require(root + 'server/' + nome_classe)
            resultado = 
                {
                    error: null,
                    class: nome_classe,
                    method: nome_metodo,
                    argument: classe[nome_metodo](argumento)
                }
            */
            resultado = 
                {
                    error_msg: null, 
                    session_id: hash_sessao, 
                    user_id: hash_usuario, 
                    remember: session.get(hash_sessao, 'remember')
                }
            return resultado
        }
        else
        {
            return {error_msg: 'Credenciais inválidas'}
        }
    }

    static logout(dados, usuario)
    {
        if 
        (
            !usuario
            ||
            usuario.hash_id != dados.user_id
            ||
            typeof session.usuarios[dados.session_id] == 'undefined'
            ||
            session.usuarios[dados.session_id].usuario.hash_id != dados.user_id
        )
        {
            return null
        }
        session.exclui(dados.session_id)
    }

    static async requestNewPass(dados)
    {
        var sql, consulta, id_usuario, date, hash, result, url, email_enviado
        result = {error: '', index: dados.index}
        dados.email = dados.email.toLowerCase().trim()
        if (!format.validaEmail(dados.email))
        {
            result.error = 'invalid_email'
            return result
        }
        sql =
            `
            select id
            from usuario
            where email = $1::text`
        consulta = await db.query(sql, [dados.email])
        if (consulta.rowCount == 0)
        {
            result.error = 'invalid_email'
            return result
        }
        id_usuario = consulta.rows[0].id
        date = new Date()
        hash = format.bcryptEncode(date)
        sql = `
            update usuario
            set 
                hash_nova_senha = $1::text,
                data_nova_senha = $2::timestamp
            where id = $3::numeric`
        await db.query(sql, [hash, date, id_usuario])
        url = server.getUrl('Authenticator', 'newPass', {email: email, hash: hash})
        email_enviado =
            await email.envia
            (
                {
                    assunto: titulo + ' - recuperação de senha',
                    destinatarios: [email],
                    corpo: 
                        `
                        <b>foi solicitada nova senha para este email<b>
                        <p>Para gerar nova senha basta clicar no link</p>
                        <a href="${url}" target="_blank">${url}</a>
                        <p>Caso você não tenha solicitado uma nova senha, basta ignorar e pode apagar este e-mail</p>
                        `
                }
            )
        if (!email_enviado)
        {
            result.error = 'send_error'
        }
        return result
    }
}

module.exports = Authenticator