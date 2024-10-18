class Deploy
{
    /*
    Atenção: esses são os scripts que são executados quando há um deploy da aplicação, 
    seja em ambiente de desenvolvimento ou produção.
    Por isso, nunca exclua um function dessa lista para manter integridade
    Serve para processar as alterações de banco (principalmente) de maneira integrada com o deploy
    Se houve algum erro em deploy antigo, em vez de corrigir a function do deploy, 
    adicione um function com a correção e faça o deploy
    Somente a última function adicionada e que ainda não foi executada em produção pode ser 
    reescrita até ficar correta, 
    nesse caso, se já foram feitas mudanças no banco é preciso revertê-lo ao estado anterior, 
    isso pode ser feito reiniciando todo o processo, ou seja, executando o metodo restart()
    */
    static scripts =
        [
            async function()
            {
                await db.query
                (
                    `
                    create table usuario
                    (
                        id bigserial primary key,
                        nome varchar(255),
                        identificacao varchar(50),
                        tipo_identificacao varchar(50),
                        senha varchar(255),
                        ultimo_acesso timestamp,
                        data_cadastro timestamp,
                        comentarios text,
                        id_responsavel_cadastro integer
                    )`,
                    null, 
                    true
                )
                await db.query
                (
                    `
                    create table setor
                    (
                        id bigserial primary key,
                        nome varchar(255),
                        descricao text,
                        id_setor_pai integer
                    )`,
                    null, 
                    true
                )
                await db.query
                (
                    `
                    create table private.tipo_contrato
                    (
                        
                        id bigserial primary key,
                        nome varchar(255),
                        descricao text,
                        vigencia_dias integer,
                        valor decimal(15, 2)
                    )`,
                    null, 
                    true
                )
                await db.query
                (
                    `
                    create table private.contrato
                    (
                        
                        id bigserial primary key,
                        data_validade timestamp,
                        descricao text,
                        id_tipo_contrato integer,
                        id_cliente integer,
                        valor decimal(15, 2)
                    )`,
                    null, 
                    true
                )
                await db.query
                (
                    `
                    create table private.pagamento
                    (
                        id bigserial primary key,
                        id_contrato integer,
                        id_lancamento integer
                    )`,
                    null, 
                    true
                )
                await db.query
                (
                    `
                    create table private.lancamento
                    (
                        id bigserial primary key,
                        valor decimal(15, 0),
                        data timestamp,
                        classe varchar(100),
                        tipo varchar(255),
                        id_cliente integer
                    )`,
                    null, 
                    true
                )
                await db.query
                (
                    `
                    create table private.licenca
                    (
                        id bigserial primary key,
                        chave_usuario varchar(255),
                        data_validade timestamp,
                        data_criacao timestamp,
                        data_acesso timestamp,
                        validade_apos_acesso boolean,
                        classe varchar(100),
                        tipo varchar(255),
                        id_cliente integer
                    )`,
                    null, 
                    true
                )
            }
        ]

    static async process()
    {
        var i, dados
        console.log('Processando deploy')
        const config = require('./Config')
        try
        {
            dados = 
            {
                ultimo_script_deploy: 0,
                status_deploy: 'não iniciado'
            }
            dados = await config.getMulti(dados)
            console.log(dados)
            await config.set('status_deploy', 'executando', null, 'text')
            for (i = dados.ultimo_script_deploy; i < this.scripts.length; i++)
            {
                await this.scripts[i]()
                await config.set('ultimo_script_deploy', i + 1)
                console.log(`Script de deploy ${i + 1} executado com sucesso`)
            }
            await config.set('status_deploy', 'realizado', null, 'text')
            console.log('Fim deploy')
        }
        catch (error)
        {
            console.log('erro ao fazer deploy: ', error)
            await config.set('status_deploy', 'erro', null, 'text')
        }
    }

    static async reset()
    {
        var i, sql
        sql =
            `
            do
            $$
            declare
                obj record;
            begin`
        for (i in db.schemas)
        {
            sql += 
                `
                for obj in 
                (
                    select tablename 
                    from pg_tables 
                    where schemaname = '${db.schemas[i]}'
                    ${db.schemas[i] == 'public' ? ` and tablename != 'config'` : ``}
                ) 
                loop
                    execute 'drop table ${db.schemas[i]}.' || quote_ident(obj.tablename) || ' cascade';
                end loop;

                for obj in 
                (
                    select viewname 
                    from pg_views 
                    where schemaname = '${db.schemas[i]}'
                ) 
                loop
                    execute 'drop view ${db.schemas[i]}.' || quote_ident(obj.viewname) || ' cascade';
                end loop;

                for obj in 
                (
                    select sequencename 
                    from pg_sequences 
                    where schemaname = '${db.schemas[i]}'
                    ${db.schemas[i] == 'public' ? ` and sequencename != 'config_id_seq'` : ``}
                ) 
                    loop
                    execute 'drop sequence ${db.schemas[i]}.' || quote_ident(obj.sequencename) || ' cascade';
                end loop;

                for obj in 
                (
                    select routine_name 
                    from information_schema.routines 
                    where specific_schema = '${db.schemas[i]}'
                ) 
                loop
                    execute 'drop function ${db.schemas[i]}.' || quote_ident(obj.routine_name) || ' cascade';
                end loop;

                delete from config;
                `
        }
        sql += 
            `
            end
            $$;
            `
        await db.query(sql, null, true)
        await this.process()
    }
}

module.exports = Deploy