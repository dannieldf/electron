class Session
{
    static timeout = 30 // minutos para timeout da sessao se o usuario nao indicar para lembrar (obs.: por limite de 32bits quando converte para milisegundos, máximo = 35791)
    static timeout_seguranca = 30 // dias para timeout da sessao se o usuario indicar para lembrar
    static usuarios = {}

    static getTimeout(remember)
    {
        return remember ? session.timeout_seguranca * 24 * 60 : session.timeout
    }

    static validate(dados)
    {
        var usuario
        session.garbageCollector()
        if 
        (
            !dados
            ||
            Object.keys(dados).length == 0
            ||
            session.catchInvalidSession(dados.session_id, dados.user_id)
        )
        {
            return null
        }
        usuario = session.usuarios[dados.session_id].usuario ?? null
        if (usuario)
        {
            usuario.session = dados.session_id
        }
        if (!usuario || !usuario.remember)
        {
            clearTimeout(session.usuarios[dados.session_id].timeout)
            session.usuarios[dados.session_id].timeout = 
                setTimeout
                (
                    new Function(`session.exclui('${dados.session_id}')`),
                    session.timeout * 60000
                )
        }
        return usuario
    }

    static revalidate(dados)
    {
        return session.validate(dados)
    }
    
    static async exclui(hash)
    {
        var sql
        if (typeof session.usuarios[hash] == 'undefined')
        {
            return
        }
        sql =
                `
                delete from sessao
                where id = $1::numeric`
        await db.query(sql, [session.usuarios[hash].id_sessao])
        delete session.usuarios[hash]
        console.log(`SESSAO - apagado ${hash}`)
    }

    static garbageCollector()
    {
        for (var i in session.usuarios)
        {
            if (date.diferencaEmDias(session.usuarios[i].data_criacao, new Date()) >= session.timeout_seguranca)
            {
                clearTimeout(session.usuarios[i].timeout)
                delete session.usuarios[i]
            }
        }
    }

    static adiciona(hash_sessao, remember, id_usuario, hash_usuario, id_sessao)
    {
        console.log(`SESSAO - adicionado ${hash_sessao}`)
        session.usuarios[hash_sessao] = 
        {
            usuario:
                {
                    // id do usuario que logou
                    id_nativo: id_usuario,
                    // id do usuario reconhecido pelo sistema e que pode mudar ao longo da sessao em caso de emulacao de perfil por parte do administrador
                    id: id_usuario,
                    // hash do id do usuario gravado assim camufladamente nos cookies do lado do cliente como "user_id"
                    hash_id: hash_usuario,
                    // flag que indica se o usuario quer ser lembrado no dispositivo
                    remember: remember
                },
            id_sessao:
                id_sessao,
            data_criacao: 
                new Date(),
            timeout: 
                remember ?
                    null
                :
                    setTimeout
                    (
                        new Function(`session.exclui('${hash_sessao}')`), 
                        session.timeout * 60000
                    )
        }
    }

    static get(hash, key, path = ['usuario'])
    {
        var i, object
        object = session.usuarios[hash]
        if (format.isString(path))
        {
            path = [path]
        }
        if (Array.isArray(path))
        {
            for (i in path)
            {
                object = object[path[i]]
            }
        }
        return object[key]
    }

    static processRemember(dados, usuario, files, request, response)
    {
        var sent_cookies, remember
        sent_cookies = cookies.get(request)
        remember = dados.remember ?? false
        if (session.catchInvalidSession(sent_cookies.session_id, sent_cookies.user_id))
        {
            return
        }
        if (remember)
        {
            session.usuarios[sent_cookies.session_id].usuario.remember = true
            clearTimeout(session.usuarios[sent_cookies.session_id].timeout)
        }
        else
        {
            session.usuarios[sent_cookies.session_id].usuario.remember = false
            session.usuarios[sent_cookies.session_id].timeout =
                setTimeout
                (
                    new Function(`session.exclui('${sent_cookies.session_id}')`), 
                    session.timeout * 60000
                )
        }
        return {}
    }

    static catchInvalidSession(session_id, user_id)
    {
        var invalid
        invalid =
            !session_id
            ||
            typeof session.usuarios[session_id] == 'undefined'
            ||
            session.usuarios[session_id].usuario.hash_id != user_id
        return invalid
    }

    static async start()
    {
        // reinicia as sessoes ativas quando o servidor reinicia
        var i, sql, consulta
        session.usuarios = []
        sql =
            `
            select
                s.id,
                s.hash_id,
                s.remember,
                s.id_usuario,
                u.hash_id as hash_usuario
            from sessao s
            left join usuario u
                on u.id = s.id_usuario
            where 
                extract(epoch from age(now(), s.fim))
                <
                case
                    when s.remember
                    then $1::numeric
                    else $2::numeric
                end
            `
        consulta = 
            await db.query
            (
                sql, 
                [
                    session.timeout_seguranca * 24 * 60 * 60,
                    session.timeout * 60
                ]
            )
        for (i of consulta.rows)
        {
            session.adiciona
            (
                i.hash_id, 
                i.remember, 
                i.id_usuario, 
                i.hash_usuario,
                i.id
            )
        }
    }
}

module.exports = Session