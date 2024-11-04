//const { config } = require('nodemon')

class Sgbd
{
    static users = 
    {
        admin:
        {
            name: 'postgres',
            pass: '123456'
        },
        app:
        {
            name: 'app',
            pass: '789012'
        }
    }
    static sgbd = require('pg')
    static port = '5432'
    static host = 'localhost'
    static db = 'simbapremium'
    static schemas = ['public', 'private']
    static on = null
    
    static async start()
    {
        if (typeof app.banco_postgres != 'undefined')
        {
            this.users.admin.name = app.banco_postgres.usuario
            this.users.admin.pass = app.banco_postgres.senha
            this.host = app.banco_postgres.host
            this.port = app.banco_postgres.porta
        }
        const {Client} = this.sgbd
        var parameters
        parameters =
        {
            host: this.host,
            port: this.port,
            user: this.users.admin.name,
            password: this.users.admin.pass,
            connect_timeout: 10,
            sslmode: 'prefer'
        }
        var client = new Client(parameters)
        await client
            .connect()
            .then
            (
                async function()
                {
                    var i, sql, result
                    sql =
                        `
                        select 1
                        from pg_database
                        where datname = $1::text
                        `
                    result = await client.query(sql, [Sgbd.db])
                    if (result.rowCount == 0)
                    {
                        await client.query
                        (
                            `create database ${Sgbd.db}`
                        )
                        await client.end()
                        parameters.database = Sgbd.db
                        client = new Client(parameters)
                        await client.connect()
                        for (i in Sgbd.schemas)
                        {
                            if (Sgbd.schemas[i] == 'public')
                            {
                                continue
                            }
                            await client.query
                            (
                                `create schema ${Sgbd.schemas[i]}`
                            )
                        }
                        if (Sgbd.users.admin.name != Sgbd.users.app.name)
                        {
                            await client.query
                            (
                                `
                                create user ${Sgbd.users.app.name}
                                with 
                                    nosuperuser 
                                    nocreatedb 
                                    nocreaterole 
                                    encrypted password '${Sgbd.users.app.pass}'
                                `
                            )
                            await client.query
                            (
                                `
                                grant connect 
                                on database ${Sgbd.db} 
                                to ${Sgbd.users.app.name}
                                `
                            )
                            for (i in Sgbd.schemas)
                            {
                                await client.query
                                (
                                    `
                                    grant usage 
                                    on schema ${Sgbd.schemas[i]} 
                                    to ${Sgbd.users.app.name}
                                    `                                
                                )
                                await client.query
                                (
                                    `
                                    alter default privileges
                                    in schema ${Sgbd.schemas[i]}  
                                    grant select, insert, update, delete on tables 
                                    to ${Sgbd.users.app.name}                                `
                                )
                                await client.query
                                (
                                    `
                                    alter default privileges 
                                    in schema ${Sgbd.schemas[i]} 
                                    grant usage, select, update on sequences 
                                    to ${Sgbd.users.app.name}`
                                )
                            }
                        }
                        await client.query
                        (
                            `
                            create table config
                            (
                                id bigserial primary key,
                                chave text,
                                valor text,
                                tipo varchar(50),
                                id_usuario bigint,
                                data_cadastro date,
                                data_alteracao date
                            )
                            `
                        )
                        await client.query
                        (
                            `
                            comment on column config.tipo is 
                            'text, numeric, date (data no formato DD/MM/YYYY HH24:MI:SS)'
                            `
                        )
                        await client.query
                        (
                            `
                            comment on column config.id_usuario is 
                            'se o usuário não foi definido, então é uma configuração de sistema'
                            `
                        )
                        await client.query
                        (
                            `
                            create table sessao
                            (
                                id bigserial primary key,
                                hash_id char(60),
                                remember boolean,
                                ini timestamp,
                                fim timestamp,
                                id_usuario bigint
                            )
                            `
                        )
                        await client.query
                        (
                            `
                            comment on column sessao.hash_id is 
                            'hash da senha do usuário, enviada pelo user-agent (cliente), salva como um cookie. Serve para permitir que o usuário se mantenha conectado'
                            `
                        )
                        await client.query
                        (
                            `
                            create table metodo
                            (
                                id bigserial primary key,
                                classe varchar(255),
                                metodo varchar(255),
                                descricao text,
                                ajax boolean,
                                acessibilidade char(1),
                                qtd_acessos bigint,
                                media_duracao integer
                            )
                            `
                        )
                        await client.query
                        (
                            `
                            comment on column metodo.acessibilidade is 
                            'indica como o servidor deve tratar requisições a esses métodos: C = Precisa estar conectado então o sistema direciona para tela de login, D = Não pode estar conectado, então a sessão será derrubada, L = Liberado, N = Não liberado'
                            `
                        )
                        await client.query
                        (
                            `
                            comment on column metodo.media_duracao is 
                            'média em segundos do tempo de processamento desse método'
                            `
                        )
                        await client.query
                        (
                            `
                            create table acesso
                            (
                                id bigserial primary key,
                                data timestamp,
                                duracao integer,
                                id_sessao bigint,
                                id_metodo bigint  
                            )
                            `
                        )
                        await client.query
                        (
                            `
                            comment on column acesso.duracao is 
                            'duração em segundos do processamento da requisição'
                            `
                        )
                        await client.end()
                    }
                    else
                    {
                        await client.end()
                    }
                    Sgbd.on = true
                }
            )
            .catch
            (
                function(error)
                {
                    console.error('connection error', error.stack)
                    Sgbd.on = false
                }
            )
        return Sgbd.on
    }

    static async query(sql, binds = [], superuser = false)
    {
        var parameters, user
        const {Client} = this.sgbd
        user =  
            superuser ?
                this.users.admin
            :
                this.users.app
        parameters =
        {
            host: this.host,
            port: this.port,
            database: this.db,
            user: user.name,
            password: user.pass,
            connect_timeout: 10,
            sslmode: 'prefer'
        }
        var client, result
        client = new Client(parameters)
        await client.connect()
        result = await client.query(sql, binds)
        await client.end()
        return result
    }
}

module.exports = Sgbd