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
                        hash_id char(60),
                        nome varchar(255),
                        email varchar(254),
                        cpf varchar(50),
                        whatsapp varchar(255),
                        anotacoes text,
                        hash_senha char(60),
                        tentativas integer,
                        ultimo_acesso timestamp,
                        data_expiracao timestamp,
                        data_cadastro timestamp,
                        id_responsavel_cadastro bigint,
                        data_alteracao timestamp,
                        hash_nova_senha char(64),
                        data_nova_senha timestamp,
                        id_responsavel_alteracao bigint,
                        id_setor bigint
                    )`,
                    null, 
                    true
                )
                await db.query
                (
                    `
                    comment on column usuario.anotacoes is 
                    'anotações cadastradas pelo administrador'
                    `,
                    null, 
                    true
                )
                await db.query
                (
                    `
                    comment on column usuario.tentativas is 
                    'quantidade de tentativas de acesso para bloqueio de senha'
                    `,
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
                        id_setor_pai bigint,
                        id_instituicao bigint
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
                        unidade_vigencia char(1),
                        valor decimal(15, 2)
                    )`,
                    null, 
                    true
                )
                await db.query
                (
                    `
                    comment on column private.tipo_contrato.vigencia_dias is 
                    'vigência a priori dos contratos'
                    `,
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
                        valor decimal(15, 2),
                        descricao text,
                        id_tipo_contrato bigint,
                        id_cliente bigint
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
                        id_contrato bigint,
                        id_lancamento bigint
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
                        id_cliente bigint
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
                        numero char(60),
                        data_validade timestamp,
                        data_criacao timestamp,
                        data_acesso timestamp,
                        vigencia_apos_acesso boolean,
                        id_contrato bigint,
                        id_cliente bigint,
                        id_usuario bigint
                    )`,
                    null, 
                    true
                )
                await db.query
                (
                    `
                    comment on column private.licenca.vigencia_apos_acesso is 
                    'indica como a vigência da licença passa a contar: TRUE = a partir do primeiro acesso do usuário, FALSE = a partir de sua data de criação'
                    `,
                    null, 
                    true
                )
                await db.query
                (
                    `
                    comment on column private.licenca.id_usuario is 
                    'usuário que usou a licença, podende ser um usuário do banco de dados interno da instituição'
                    `,
                    null, 
                    true
                )
                await db.query
                (
                    `
                    create table private.cliente
                    (
                        id bigserial primary key,
                        nome varchar(255),
                        tipo_pessoa char(1),
                        cpf char(11),
                        cnpj char(14),
                        anotacoes text,
                        data_cadastro timestamp,
                        data_alteracao timestamp,
                        id_responsavel_cadastro bigint,
                        id_responsavel_alteracao bigint,
                        id_tipo_licenca bigint
                    )`,
                    null, 
                    true
                )
                await db.query
                (
                    `
                    comment on column private.cliente.tipo_pessoa is 
                    'F = Física, J = Jurídica'
                    `,
                    null, 
                    true
                )
                await db.query
                (
                    `
                    create table requisicao
                    (
                        id bigserial primary key,
                        caso varchar(20),
                        processo varchar(255),
                        cpf_cnpj_parte varchar(20),
                        tipo_parte char(1),
                        nome_parte varchar(255),
                        juiz varchar(255),
                        tribunal varchar(255),
                        vara_juizo varchar(255),
                        ini_afastamento timestamp,
                        fim_afastamento timestamp,
                        status char(1),
                        data_cadastro timestamp,
                        data_alteracao timestamp,
                        id_usuario_cadastro bigserial,
                        id_usuario_alteracao bigserial,
                        id_usuario_atendimento bigserial
                    )`,
                    null,
                     true
                )
                await db.query
                (
                    `
                    comment on column requisicao.tipo_parte is 
                    'A = Autor, E = Exequente'
                    `,
                    null, 
                    true
                )
                await db.query
                (
                    `
                    comment on column requisicao.status is 
                    'N = Nova, E = Em Atendimento, A = Atendida'
                    `,
                    null, 
                    true
                )
                await db.query
                (
                    `
                    create table arquivo
                    (
                        id bigserial primary key,
                        nome varchar(255),
                        tipo varchar(100),
                        conteudo bytea,
                        tamanho bigint,
                        hash varchar(255)
                    )
                    `,
                    null,
                     true
                )
                await db.query
                (
                    `
                    create table arquivo_referencia
                    (
                        id bigserial primary key,
                        tabela varchar(255),
                        id_tabela bigint
                    )
                    `,
                    null,
                     true
                )
                await Deploy.adicionaMetodos
                (
                    {metodo: 'Pagina.home', acessibilidade: 'L', ajax: false},
                    {metodo: 'Authenticator.processEmail', acessibilidade: 'L'},
                    {metodo: 'Authenticator.register', acessibilidade: 'L'},
                    {metodo: 'Authenticator.process', acessibilidade: 'L'},
                    {metodo: 'Authenticator.logout', acessibilidade: 'L'},
                    {metodo: 'Authenticator.processNewPass', acessibilidade: 'L'},
                    {metodo: 'Authenticator.requestNewPass', acessibilidade: 'L'},
                    {metodo: 'Session.processRemember', acessibilidade: 'C'},
                    {metodo: 'Session.revalidate', acessibilidade: 'L'},
                    {metodo: 'Requisicao.salvar'},
                    {metodo: 'Requisicao.salvarCCS'}
                )
            }
        ]

    static async process()
    {
        var i, dados
        try
        {
            dados = 
            {
                ultimo_script_deploy: 0,
                status_deploy: 'não iniciado'
            }
            dados = await config.getMulti(dados)
            await config.set('status_deploy', 'executando', null, 'text')
            for (i = dados.ultimo_script_deploy; i < this.scripts.length; i++)
            {
                await this.scripts[i]()
                await config.set('ultimo_script_deploy', i + 1)
                console.log(`Script de deploy ${i + 1} executado com sucesso`)
            }
            await config.set('status_deploy', 'realizado', null, 'text')
            console.log('Deploy verificado')
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
                    ${db.schemas[i] == 'public' ? ` and tablename not in ('config', 'sessao', 'metodo', 'acesso')` : ``}
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
                delete from sessao;
                delete from metodo;
                delete from acesso;
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

    static async adicionaMetodos()
    {
        var i, j, consulta, sql_consulta, sql_insert
        sql_consulta =
            `
            select 1
            from metodo
            where classe = $1::text
            and metodo = $2::text
            `
        sql_insert = 
            `
            insert into metodo
            (
                classe,
                metodo,
                acessibilidade,
                ajax,
                descricao,
                qtd_acessos,
                media_duracao
            )
            values
            (
                $1::text,
                $2::text,
                $3::text,
                $4::boolean,
                $5::text,
                0,
                0
            )`
        for (i of arguments)
        {
            i = 
                {
                    ...
                    {
                        acessibilidade: 'C',
                        ajax: true,
                        descricao: ''
                    },
                    ...i
                }
            if (!['C', 'D', 'L', 'N'].includes(i.acessibilidade))
            {
                throw new Error(`Erro ao cadastrar um método, a acessibilidade ${i.acessibilidade} é inválida`)
            }
            consulta = 
                await db.query
                (
                    sql_consulta, 
                    [
                        i.classe, 
                        i.metodo
                    ]
                )
            if (consulta.rowCount)
            {
                throw new Error(`Erro ao cadastrar um método já existente: ${i.classe}.${i.metodo}`)
            }
            j = i.metodo.split('.')
            i.classe = j[0]
            i.metodo = j[1]

            var p = 
            [
                i.classe,
                i.metodo,
                i.acessibilidade,
                i.ajax,
                i.descricao
            ]
            await db.query
            (
                sql_insert,
                [
                    i.classe,
                    i.metodo,
                    i.acessibilidade,
                    i.ajax,
                    i.descricao
                ]
            )
        }
        
    }
}

module.exports = Deploy