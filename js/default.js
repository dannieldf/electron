class Autenticacao
{
    static i
    static formulario_cadastro
    static dados_formulario_cadastro
    static input_nome
    static input_cpf
    static input_senha
    static input_confirmacao_senha
    static input_licenca
    static input_instituicao
    static input_setor
    static check_email
    static formulario_tipo_acesso
    static botao_cadastro
    static visibilidade
    static conexao_cadastro
    static qtd_cliques_conecutivos_botao_cadastro
    static usuario_avisado_esperar_cadastro
    static authenticator =
        new Authenticator
        (
            {
                show_register_form: 
                    new Function('dados', `Autenticacao.carregaFormularioCadastro(dados)`),
                callback: 
                    new Function(`Autenticacao.sucesso()`)
            }
        )

    static formulario()
    {
        var component
        component = 
            new Glass
            (
                {
                    style: 
                    {
                        min_height: '200px',
                        overflow: 'auto',
                        padding: '0px'
                    },
                    title: 'Acesso',
                    components: 
                    [
                        this.authenticator
                    ]
                }
            )
        return component
    }

    static carregaFormularioCadastro(dados)
    {
        var components_grid, components
        this.i = Page.nextSequence()
        this.check_email = new Checkbox()
        this.dados_formulario_cadastro = dados
        this.visibilidade =
            {
                senha: false,
                confirmacao_senha: false
            }
        this.formulario_tipo_acesso = 
            new Component
            (
                {
                    style: 
                    {
                        margin_top: '10px',
                        background_color: styles['background_color_highlight']
                    }
                }
            )
        this.input_nome =
            new Input
            (
                {
                    name: 'nome',
                    attributes:
                    {
                        id: `nome#${this.i}`
                    },
                    style:
                    {
                        text_transform: 'uppercase'
                    }
                }
            )
        this.input_cpf =
            new Input
            (
                {
                    name: 'cpf',
                    attributes:
                    {
                        id: `cpf#${this.i}`
                    }
                }
            )
        this.input_senha =
            new Input
            (
                {
                    name: 'senha',
                    attributes:
                    {
                        id: `senha#${this.i}`,
                        type: 'password'
                    }
                }
            )
        this.input_confirmacao_senha =
            new Input
            (
                {
                    attributes:
                    {
                        id: `confirmacao_senha#${this.i}`,
                        type: 'password'
                    }
                }
            )
        components_grid =
            [
                // senha
                new Component
                (
                    {
                        node: 'label',
                        content: str.cadastro['senha_segura'] + ':',
                        attributes:
                        {
                            for: `senha#${this.i}`
                        }
                    }
                ),
                Input.withIcon
                (
                    this.input_senha,
                    'visibility',
                    `Autenticacao.alternaVisibilidadeSenha('senha')`
                ),
                // confirmacao senha
                new Component
                (
                    {
                        node: 'label',
                        content: str.cadastro['confirmacao_senha'] + ':',
                        attributes:
                        {
                            for: `confirmacao_senha#${this.i}`
                        }
                    }
                ),
                Input.withIcon
                (
                    this.input_confirmacao_senha,
                    'visibility',
                    `Autenticacao.alternaVisibilidadeSenha('confirmacao_senha')`
                ),
                // nome
                new Component
                (
                    {
                        node: 'label',
                        content: str.cadastro['nome_completo'] + ':',
                        attributes:
                        {
                            for: `nome#${this.i}`
                        }
                    }
                ),
                this.input_nome,
                // cpf
                new Component
                (
                    {
                        node: 'label',
                        content: str.cadastro['cpf'] + ':',
                        attributes:
                        {
                            for: `cpf#${this.i}`
                        }
                    }
                ),
                this.input_cpf,
                // whatsapp
                new Component
                (
                    {
                        node: 'label',
                        content: str.cadastro['whatsapp'] + ':',
                        attributes:
                        {
                            for: `whatsapp#${this.i}`
                        }
                    }
                ),
                new Input
                (
                    {
                        name: 'whatsapp',
                        attributes:
                        {
                            id: `whatsapp#${this.i}`
                        }
                    }
                )
            ]
        if (config.versao_desktop)
        {
            // licenca
            components_grid.push
            (
                new Component
                (
                    {
                        node: 'label',
                        content: str.cadastro['licenca'] + ':',
                        attributes:
                        {
                            for: `licenca#${this.i}`
                        }
                    }
                )
            )
            components_grid.push
            (
                new Input
                (
                    {
                        name: 'licenca',
                        attributes:
                        {
                            id: `licenca#${this.i}`
                        }
                    }
                )
            )
        }
        components = []
        components.push
        (
            // titulo
            new Component
            (
                {
                    style:
                    {
                        font_weight: 'bold',
                        text_align: 'center',
                        padding: '20px 0',
                        margin_top: '15px',
                        border_top: 'solid 1px #cccccc'
                    },
                    content: str.cadastro['cadastro']
                }
            )
        )
        components.push
        (
            // check email
            new Component
            (
                {
                    node: 'label',
                    style:
                    {
                        display: 'flex',
                        justify_content: 'center',
                        gap: '5px',
                        cursor: 'pointer',
                        user_select: 'none'
                    },
                    components:
                    [
                        this.check_email,
                        new Component
                        (
                            {
                                node: 'span',
                                content: str.cadastro['msg_conferencia_email']
                            }
                        )
                    ]
                }
            )
        )
        components.push
        (
            // grid do campos
            new Component
            (
                {
                    style:
                    {
                        display: 'grid',
                        gap: '25px 50px',
                        grid_template_columns: '30% 60%',
                        box_sizing: 'border-box',
                        padding: '20px'
                    },
                    components: components_grid
                }
            )
        )
        if (!config.versao_desktop)
        {
            components.push
            (
                // tipo de acesso
                new Component
                (
                    {
                        style:
                        {
                            border: 'solid 1px #cccccc',
                            border_radius: '5px',
                            margin: '10px',
                            padding: '10px',
                            background_color: '#ffffff'
                        },
                        components:
                        [
                            new Component
                            (
                                {
                                    content: str.cadastro['escolha_acesso'],
                                    style:
                                    {
                                        padding: '10px',
                                        text_align: 'center'
                                    }
                                }
                            ),
                            new Tabsheet
                            (
                                {
                                    items:
                                    [
                                        Tabsheet.item
                                        (
                                            'check',
                                            {
                                                text: str.cadastro['acesso_trial'], 
                                                onclick: 'Autenticacao.formularioTrial()'
                                            }
                                        ),
                                        Tabsheet.item
                                        (
                                            'check',
                                            {
                                                text: str.cadastro['acesso_por_licenca'], 
                                                onclick: 'Autenticacao.formularioLicenca()'
                                            }
                                        )
                                    ],
                                    trigger: Tabsheet.trigger('check')
                                }
                            ),
                            this.formulario_tipo_acesso
                        ]
                    }
                )
            )
        }
        this.botao_cadastro =
            new Button
            (
                {
                    content: str.app['save'],
                    attributes:
                    {
                        onclick: `Autenticacao.cadastroIncluir()`
                    }
                }
            )
        this.qtd_cliques_conecutivos_botao_cadastro = 0
        this.usuario_avisado_esperar_cadastro = false
        components.push
        (
            // botoes
            new Component
            (
                {
                    style:
                    {
                        text_align: 'center',
                        padding: '10px 0'
                    },
                    components:
                    [
                        this.botao_cadastro
                    ]
                }
            )
        )
        this.authenticator.load
        (
            components
        )
    }

    static formularioTrial()
    {
        this.formulario_tipo_acesso.set
        (
            'components',
            [
                new Component
                (
                    {
                        node: 'input',
                        name: 'tipo_acesso',
                        attributes:
                        {
                            type: 'hidden',
                            value: 'T'
                        }
                    }
                ),
                new Component
                (
                    {
                        content: str.cadastro['msg_acesso_trial'],
                        style:
                        {
                            padding: '10px',
                            font_style: 'italic',
                            text_align: 'center'
                        }
                    }
                )
            ]
        )
    }

    static formularioLicenca()
    {
        var i, options_instituicao
        this.input_licenca =
            new Input
            (
                {
                    name: 'licenca',
                    attributes:
                    {
                        id: `licenca#${this.i}`
                    }
                }
            )
        this.input_instituicao =
            new Select
            (
                {
                    name: 'id_instituicao',
                    attributes:
                    {
                        id: `instituicao#${this.i}`,
                        options: options_instituicao,
                        onchange: `Autenticacao.atualizaSetor(this.value)`
                    }
                }
            )
        this.input_setor =
            new Input
            (
                {
                    name: 'setor',
                    attributes:
                    {
                        id: `setor#${this.i}`
                    },
                    style:
                    {
                        text_transform: 'uppercase'
                    }
                }
            )
        options_instituicao = {}
        for (i in this.dados_formulario_cadastro.instituicoes)
        {
            options_instituicao[i] = this.dados_formulario_cadastro.instituicoes[i]
        }
        this.formulario_tipo_acesso.set
        (
            'components',
            [
                new Component
                (
                    {
                        node: 'input',
                        name: 'tipo_acesso',
                        attributes:
                        {
                            type: 'hidden',
                            value: 'L'
                        }
                    }
                ),
                new Component
                (
                    {
                        node: 'a',
                        content: str.cadastro['msg_acesso_por_licenca'],
                        style:
                        {
                            display: 'block',
                            padding: '10px',
                            font_style: 'italic',
                            text_align: 'center',
                            text_decoration: 'none',
                            color: styles['text_color_normal'],
                            cursor: 'pointer',
                            user_select: 'none'
                        }
                    }
                ),
                new Component
                (
                    {
                        style:
                        {
                            display: 'grid',
                            gap: '10px 50px',
                            grid_template_columns: '30% 60%',
                            box_sizing: 'border-box',
                            padding: '20px'
                        },
                        components:
                        [
                            // licenca
                            new Component
                            (
                                {
                                    node: 'label',
                                    content: str.cadastro['licenca'] + ':',
                                    attributes:
                                    {
                                        for: `licenca#${this.i}`
                                    }
                                }
                            ),
                            this.input_licenca,
                            // instituicao
                            new Component
                            (
                                {
                                    node: 'label',
                                    content: str.cadastro['instituicao'] + ':',
                                    attributes:
                                    {
                                        for: `instituicao#${this.i}`
                                    }
                                }
                            ),
                            this.input_instituicao,
                            new Component
                            (
                                {
                                    node: 'label',
                                    content: str.cadastro['setor'] + ':',
                                    attributes:
                                    {
                                        for: `setor#${this.i}`
                                    }
                                }
                            ),
                            // setor
                            this.input_setor
                        ]
                    }
                )
            ]
        )
        document.getElementById(`licenca#${this.i}`).focus()
    }

    static alternaVisibilidadeSenha(campo)
    {
        document.getElementById(`${campo}#${Autenticacao.i}`).type = 
            Autenticacao.visibilidade[campo] ? 
                'password'
            :
                'text'
        Autenticacao.visibilidade[campo] = !Autenticacao.visibilidade[campo]
    }

    static atualizaSetor(id_instituicao)
    {
        var i, setores
        setores = []
        if (id_instituicao)
        {
            for (i of this.dados_formulario_cadastro.instituicoes[id_instituicao].setores)
            {
                setores.push(i.nome)
            }
        }
        this.input_setor.set('options', setores)
    }

    static cadastroIncluir()
    {
        var i, form
        if (this.conexao_cadastro)
        {
            this.qtd_cliques_conecutivos_botao_cadastro++
            if 
            (
                this.qtd_cliques_conecutivos_botao_cadastro >= 3 
                && 
                !this.usuario_avisado_esperar_cadastro
            )
            {
                Notifier.send
                (
                    new Component
                    (
                        {
                            node: 'a',
                            content: str.cadastro.msg_aguardar_cadastro,
                            style:
                            {
                                text_decoration: 'none',
                                color: styles.text_color_highlight,
                                cursor: 'pointer',
                                user_select: 'none'
                            },
                            attributes:
                            {
                                href: `javascript: void(Autenticacao.abortarCadastro())`
                            }
                        }
                    )
                )
                this.usuario_avisado_esperar_cadastro = true
            }
            setTimeout
            (
                function() 
                {
                    Autenticacao.qtd_cliques_conecutivos_botao_cadastro--
                    if (Autenticacao.qtd_cliques_conecutivos_botao_cadastro == 0)
                    {
                        Autenticacao.usuario_avisado_esperar_cadastro = false
                    }
                }, 
                1000
            )
        }
        if (!this.check_email.getValue())
        {
            alert(str.cadastro.check_email)
            this.check_email.element.focus()
            return
        }
        if (this.input_confirmacao_senha.element.value != this.input_senha.element.value)
        {
            alert(str.cadastro.confirme_a_senha)
            this.input_confirmacao_senha.element.focus()
            return
        }
        //this.botao_cadastro.setAttribute('disabled', true)
        form = this.authenticator.getValues()
        if (!isset(form.tipo_acesso))
        {
            alert(str.cadastro.informe_tipo_acesso)
            this.formulario_tipo_acesso.element.scrollIntoView()
            return
        }
        this.conexao_cadastro = 
            Server.call
            (
                'Authenticator.register', 
                form, 
                new Function
                (
                    'dados', 
                    'Autenticacao.registerCallback(dados)'
                )
            )
    }

    static registerCallback(dados)
    {
        this.conexao_cadastro = null
        if (dados.erro)
        {
            switch (dados.erro)
            {
                case 'nome_obrigatorio':
                    alert(str.cadastro.msg_informar_nome)
                    this.input_nome.element.select()
                    this.input_nome.element.scrollIntoView()
                    break
                case 'email_obrigatorio':
                    alert(str.cadastro.msg_informar_email)
                    break
                case 'senha_obrigatoria':
                    alert(str.cadastro.msg_informar_senha)
                    this.input_senha.element.select()
                    this.input_senha.element.scrollIntoView()
                    break
                case 'cpf_obrigatorio':
                    alert(str.cadastro.msg_informar_cpf)
                    this.input_cpf.element.select()
                    this.input_cpf.element.scrollIntoView()
                    break
                case 'cpf_invalido':
                    alert(str.cadastro.msg_cpf_invalido)
                    this.input_cpf.element.select()
                    this.input_cpf.element.scrollIntoView()
                    break
                case 'tipo_acesso_obrigatorio':
                    alert(str.cadastro.informe_tipo_acesso)
                    break
                case 'licenca_invalida':
                    alert(str.cadastro.msg_licenca_invalida)
                    this.input_licenca.element.select()
                    this.input_licenca.element.scrollIntoView()
                    break
                case 'instituicao_obrigatoria':
                    alert(str.cadastro.msg_informar_instituicao)
                    this.input_instituicao.element.focus()
                    break
                case 'instituicao_invalida':
                    alert(str.cadastro.msg_instituicao_invalida)
                    this.input_instituicao.element.focus()
                    break
                case 'email_ja_cadastrado':
                    alert(str.cadastro.msg_email_ja_cadastrado)
                case 'cpf_ja_cadastrado':
                    alert(str.cadastro.msg_cpf_ja_cadastrado)
                    break
                default:
                    alert(str.app.unexpected_error)
            }
            return
        }
        if (dados.envio_email)
        {
            alert(str.cadastro.msg_cadastro_incluido)
        }
        else
        {
            alert(str.cadastro.msg_cadastro_incluido_falha_email)
        }
        this.authenticator.showPasswordInput(Cookies.get('remember'))
    }

    static processaNovaSenha(email)
    {
        // enviar email com link para gerar nova senha
        alert('Em construção')
    }

    static abortarCadastro()
    {
        if (typeof Server.connections[Autenticacao.conexao_cadastro] != 'undefined')
        {
            Server.connections[Autenticacao.conexao_cadastro].request.abort()
            Autenticacao.conexao_cadastro = null
        }
    }

    /*
    static sucesso()
    {
        var icone
        PainelControle.home()
        icone = Usuario.icone()
        icone.setStyle('height', '100%')
        Pagina.header.set
        (
            'user', 
            icone
        )
        Usuario.ativaMenu(icone)
    }
    */
}

class Cadastro
{
    static formularioNovo(authenticator)
    {
        authenticator.load()
    }

    static start()
    {
        str['cadastro'] = 
            {
                cadastro: 'Cadastro',
                msg_conferencia_email: 'clique aqui se já conferiu o e-mail',
                nome_completo: 'Nome completo',
                cpf: 'CPF',
                senha_segura: 'Cadastre uma senha segura',
                confirmacao_senha: 'Confirme a senha',
                confirme_a_senha: 'A senha não foi confirmada',
                whatsapp: 'Número do Whatsapp',
                contato: 'Contato',
                conferi_email: 'já conferi o e-mail',
                licenca: 'Licença',
                ajuda_licenca: 'para obter um número de licença entre em contato com ',
                instituicao: 'Instituição',
                setor: 'Setor',
                ajuda_cadastro: 'clique aqui para obter ajuda',
                ajuda_cadastro_direcionamento: 'Você vai ser direcionado para nosso canal no Whatsapp. Deseja prosseguir?',
                pergunta_como_acessar_o_sistema: 'Como você vai acessar o sistema?',
                acesso_trial: 'Gratuito',
                acesso_por_licenca: 'Possuo uma licença',
                msg_acesso_trial: 'ATENÇÃO: seu acesso estará sob o critério exclusivo dos administradores do sistema e poderá ser encerrado a qualquer momento',
                msg_acesso_por_licenca: 'Seu acesso será irrestrito enquanto durar a licença. Se você não tem uma licença, pode aquirir clicando aqui',
                msg_cadastro_admin: 'O primeiro usuário a se cadastrar se torna automaticamente o Administrador do sistema, que tem acesso a tela de administração onde é feita a gerência do sistema e de seus usuários. O Administrador pode transferir a administração para outro usuário quando desejar',
                escolha_acesso: 'Escolha o tipo de acesso',
                check_email: 'Por gentileza, confira o e-mail e marque a opção',
                informe_tipo_acesso: 'Informe o tipo de acesso',
                msg_aguardar_cadastro: 'Ainda estamos registrando o cadastro. Se o servidor estiver demorando demais e você quiser abortar a operação clique aqui',
                msg_cadastro_incluido: 'Seu cadastro foi realizado. Enviamos um email de boas-vindas. Agora, por gentileza, informe a senha para acessar.',
                msg_cadastro_incluido_falha_email: 'Seu cadastro foi realizado, mas NÃO CONSEGUIMOS ENVIAR UM E-MAIL. Agora, por gentileza, informe a senha para acessar.',
                msg_informar_nome: 'Por gentileza, informe seu nome',
                msg_informar_email: 'Por gentileza, informe o email',
                msg_informar_senha: 'Por gentileza, informe a senha',
                msg_informar_cpf: 'Por gentileza, informe o CPF',
                msg_cpf_invalido: 'O CPF informado é inválido',
                msg_licenca_invalida: 'O número da licença não é válido',
                msg_informar_instituicao: 'Por favor, escolha a instituição',
                msg_instituicao_invalida: 'A instituição é inválida',
                msg_email_ja_cadastrado: 'Este email já foi cadastrado'
            }
    }
}

class Requisicao
{
    static form

    static carregaFormularioCadastro(dados = {})
    {
        dados =
            {
                ...
                {
                    id_requisicao: null,
                    caso: '',
                    processo: '',
                    cpf_cnpj_parte: '',
                    tipo_parte: '',
                    nome_parte: '',
                    juiz: '',
                    tribunal: '',
                    vara_juizo: '',
                    ini_afastamento: '',
                    fim_afastamento: ''
                },
                ...dados
            }
        Requisicao.form =
            new Component
            (
                {
                    style:
                    {
                        padding: '30px',
                        display: 'grid',
                        grid_template_columns: '250px auto',
                        gap: '10px'
                    },
                    components:
                    [
                        new Component
                        (
                            {
                                node: 'input',
                                name: 'id_requisicao',
                                attributes:
                                {
                                    type: 'hidden',
                                    value: dados.id_requisicao
                                }
                            }
                        ),
                        new Component
                        (
                            {
                                node: 'label',
                                content: 'Número do Caso Simba:',
                                attributes:
                                {
                                    for: 'caso'
                                }
                            }
                        ),
                        new Input
                        (
                            {
                                name: 'caso',
                                attributes: 
                                {
                                    id: 'caso',
                                    autofocus: true,
                                    maxlength: '20',
                                    placeholder: '999-AAA-999999-99',
                                    value: dados.caso
                                },
                                style:
                                {
                                    text_transform: 'uppercase'
                                }
                            }
                        ),

                        new Component
                        (
                            {
                                node: 'label',
                                content: 'Número do Processo:',
                                attributes:
                                {
                                    for: 'processo'
                                }
                            }
                        ),
                        new Input
                        (
                            {
                                name: 'processo',
                                attributes: 
                                {
                                    id: 'processo',
                                    maxlength: '255',
                                    value: dados.processo
                                },
                                style:
                                {
                                    text_transform: 'uppercase'
                                }
                            }
                        ),

                        new Component
                        (
                            {
                                node: 'label',
                                content: 'CPF/CNPJ da parte:',
                                attributes:
                                {
                                    for: 'cpf_cnpj_parte'
                                }
                            }
                        ),
                        new Input
                        (
                            {
                                name: 'cpf_cnpj_parte',
                                attributes: 
                                {
                                    id: 'cpf_cnpj_parte',
                                    maxlength: '20',
                                    value: dados.cpf_cnpj_parte
                                },
                                style:
                                {
                                    text_transform: 'uppercase'
                                }
                            }
                        ),

                        new Component
                        (
                            {
                                node: 'label',
                                content: 'Tipo da parte:',
                                attributes:
                                {
                                    for: 'tipo_parte'
                                }
                            }
                        ),
                        new Select
                        (
                            {
                                name: 'tipo_parte',
                                attributes: 
                                {
                                    id: 'tipo_parte',
                                },
                                options:
                                {
                                    '': '',
                                    A: 'Autor',
                                    E: 'Exequente'
                                },
                                selected: dados.tipo_parte
                            }
                        ),

                        new Component
                        (
                            {
                                node: 'label',
                                content: 'Nome da parte no processo:',
                                attributes:
                                {
                                    for: 'nome_parte'
                                }
                            }
                        ),
                        new Input
                        (
                            {
                                name: 'nome_parte',
                                attributes: 
                                {
                                    id: 'nome_parte',
                                    maxlength: '255',
                                    value: dados.nome_parte
                                },
                                style:
                                {
                                    text_transform: 'uppercase'
                                }
                            }
                        ),

                        new Component
                        (
                            {
                                node: 'label',
                                content: 'Juiz solicitante:',
                                attributes:
                                {
                                    for: 'juiz'
                                }
                            }
                        ),
                        new Input
                        (
                            {
                                name: 'juiz',
                                attributes: 
                                {
                                    id: 'juiz',
                                    maxlength: '255',
                                    value: dados.juiz
                                },
                                style:
                                {
                                    text_transform: 'uppercase'
                                }
                            }
                        ),

                        new Component
                        (
                            {
                                node: 'label',
                                content: 'Tribunal:',
                                attributes:
                                {
                                    for: 'tribunal'
                                }
                            }
                        ),
                        new Input
                        (
                            {
                                name: 'tribunal',
                                attributes: 
                                {
                                    id: 'tribunal',
                                    maxlength: '255',
                                    value: dados.tribunal
                                },
                                style:
                                {
                                    text_transform: 'uppercase'
                                }
                            }
                        ),

                        new Component
                        (
                            {
                                node: 'label',
                                content: 'Vara ou Juízo:',
                                attributes:
                                {
                                    for: 'vara_juizo'
                                }
                            }
                        ),
                        new Input
                        (
                            {
                                name: 'vara_juizo',
                                attributes: 
                                {
                                    id: 'vara_juizo',
                                    maxlength: '255',
                                    value: dados.vara_juizo
                                },
                                style:
                                {
                                    text_transform: 'uppercase'
                                }
                            }
                        ),

                        new Component
                        (
                            {
                                node: 'label',
                                content: 'Período de afastamento:'
                            }
                        ),
                        new Component
                        (
                            {
                                components:
                                [
                                    new Component
                                    (
                                        {
                                            node: 'label',
                                            content: 'de: ',
                                            attributes: {for: 'ini_afastamento'}
                                        }
                                    ),
                                    new Input
                                    (
                                        {
                                            name: 'ini_afastamento',
                                            attributes: 
                                            {
                                                id: 'ini_afastamento',
                                                type: 'datetime-local',
                                                value: dados.ini_afastamento
                                            }
                                        }
                                    ),
                                    new Component
                                    (
                                        {
                                            node: 'label',
                                            content: ' até: ',
                                            attributes: {for: 'fim_afastamento'}
                                        }
                                    ),
                                    new Input
                                    (
                                        {
                                            name: 'fim_afastamento',
                                            attributes: 
                                            {
                                                id: 'fim_afastamento',
                                                type: 'datetime-local',
                                                value: dados.ini_afastamento
                                            }
                                        }
                                    ),
                                    new Component
                                    (
                                        {
                                            node: 'i',
                                            content: ' (inclua as horas)'
                                        }
                                    )
                                ]
                            }
                        )
                    ]
                }
            )
        PainelControle.carrega
        (
            [
                new Glass
                (
                    {
                        title: 'Cadastro de Requisição',
                        icon: 'app_registration',
                        style:
                        {
                            margin_top: '30px',
                            margin_bottom: '30px'
                        },
                        components:
                        [
                            Requisicao.form,
                            new Component
                            (
                                {
                                    style:
                                    {
                                        padding: '0 30px 30px 30px'
                                    },
                                    components:
                                    [
                                        new Button
                                        (
                                            {
                                                content: dados.id_requisicao ? 'Salvar' : 'Salvar e Avançar',
                                                attributes:
                                                {
                                                    onclick: 'Requisicao.salvar()'
                                                }
                                            }
                                        )
                                    ]
                                }
                            )
                        ]
                    }
                )
            ]
        )
        /*
        PainelControle.carrega
        (
            [
                new Component
                (
                    {
                        style: 
                        {
                            display: 'grid',
                            grid_template_columns: 'auto auto',
                            gap: '20px',
                            margin_top: '30px'
                        },
                        components:
                        [
                            new Glass
                            (
                                {
                                    title: 'Upload de arquivos padrão',
                                    style:
                                    {
                                        padding: 0
                                    },
                                    components:
                                    [
                                        new Component
                                        (
                                            {
                                                style:
                                                {
                                                    padding: '20px'
                                                },
                                                components:
                                                [
                                                    new Component
                                                    (
                                                        {
                                                            content: 'Opção 1 - <b>Arquivos CCS Sisbajud</b>',
                                                            parse: true
                                                        }
                                                    ),
                                                    new Component
                                                    (
                                                        {
                                                            style: 
                                                            {
                                                                padding: '15px 0',
                                                                text_align: 'center'
                                                            },
                                                            components:
                                                            [
                                                                new File()
                                                            ]
                                                        }
                                                    )
                                                ]
                                            }
                                        ),
                                        
                                        new Component
                                        (
                                            {
                                                style:
                                                {
                                                    padding: '20px',
                                                    border_top: 'solid 1px #cccccc'
                                                },
                                                components:
                                                [
                                                    new Component
                                                    (
                                                        {
                                                            content: 'Opção 2 - <b>Arquivos CCS Simba Manual</b>',
                                                            parse: true
                                                        }
                                                    ),
                                                    new Component
                                                    (
                                                        {
                                                            node: 'p',
                                                            content: 'Envie os 7 arquivos .txt gerados pelo Validador na pasta arqtxt',
                                                            parse: true
                                                        }
                                                    ),
                                                    new Component
                                                    (
                                                        {
                                                            style: 
                                                            {
                                                                padding: '15px 0',
                                                                text_align: 'center'
                                                            },
                                                            components:
                                                            [
                                                                new File
                                                                (
                                                                    {
                                                                        multiple: true,
                                                                        accept: '.txt'
                                                                    }
                                                                )
                                                            ]
                                                        }
                                                    )
                                                ]
                                            }
                                        )
                                    ]
                                }
                            ),
                            new Glass
                            (
                                {
                                    title: 'Cadastro manual',
                                    style:
                                    {
                                        padding: 10
                                    },
                                    components:
                                    [
                                        new Component
                                        (
                                            {
                                                style:
                                                    {
                                                        padding: '10px'
                                                    },
                                                components:
                                                    [
                                                        new Component
                                                        (
                                                            {
                                                                node: 'label',
                                                                style:
                                                                {
                                                                    display: 'flex',
                                                                    align_items: 'center',
                                                                    margin_top: '10px'
                                                                },
                                                                components:
                                                                [
                                                                    new Component
                                                                    (
                                                                        {
                                                                            content: 'Órgão: ',
                                                                            style: 
                                                                            {
                                                                                width: '30%', 
                                                                                text_align: 'right',
                                                                                padding_right: '10px',
                                                                                box_sizing: 'border-box'
                                                                            }
                                                                        }
                                                                    ),
                                                                    new Input
                                                                    (
                                                                        {
                                                                            style: {width: '70%'}
                                                                        }
                                                                    )
                                                                ]
                                                            }
                                                        ),
                                                        new Component
                                                        (
                                                            {
                                                                node: 'label',
                                                                style:
                                                                {
                                                                    display: 'flex',
                                                                    align_items: 'center',
                                                                    margin_top: '10px'
                                                                },
                                                                components:
                                                                [
                                                                    new Component
                                                                    (
                                                                        {
                                                                            content: 'Requisitante: ',
                                                                            style: 
                                                                            {
                                                                                width: '30%', 
                                                                                text_align: 'right',
                                                                                padding_right: '10px',
                                                                                box_sizing: 'border-box'
                                                                            }
                                                                        }
                                                                    ),
                                                                    new Input
                                                                    (
                                                                        {
                                                                            style: {width: '70%'}
                                                                        }
                                                                    )
                                                                ]
                                                            }
                                                        ),
                                                        new Component
                                                        (
                                                            {
                                                                node: 'label',
                                                                style:
                                                                {
                                                                    display: 'flex',
                                                                    align_items: 'center',
                                                                    margin_top: '10px'
                                                                },
                                                                components:
                                                                [
                                                                    new Component
                                                                    (
                                                                        {
                                                                            content: 'Instituição Financeira: ',
                                                                            style: 
                                                                            {
                                                                                width: '30%', 
                                                                                text_align: 'right',
                                                                                padding_right: '10px',
                                                                                box_sizing: 'border-box'
                                                                            }
                                                                        }
                                                                    ),
                                                                    new Input
                                                                    (
                                                                        {
                                                                            style: {width: '70%'}
                                                                        }
                                                                    )
                                                                ]
                                                            }
                                                        ),
                                                        new Component
                                                        (
                                                            {
                                                                node: 'label',
                                                                style:
                                                                {
                                                                    display: 'flex',
                                                                    align_items: 'center',
                                                                    margin_top: '10px'
                                                                },
                                                                components:
                                                                [
                                                                    new Component
                                                                    (
                                                                        {
                                                                            content: 'Status do caso: ',
                                                                            style: 
                                                                            {
                                                                                width: '30%', 
                                                                                text_align: 'right',
                                                                                padding_right: '10px',
                                                                                box_sizing: 'border-box'
                                                                            }
                                                                        }
                                                                    ),
                                                                    new Select
                                                                    (
                                                                        {
                                                                            style: {width: '70%'},
                                                                            components:
                                                                            [
                                                                                new Component
                                                                                (
                                                                                    {
                                                                                        node: 'option',
                                                                                        content: 'Aberto'
                                                                                    }
                                                                                )
                                                                            ]
                                                                        }
                                                                    )
                                                                ]
                                                            }
                                                        ),
                                                        new Component
                                                        (
                                                            {
                                                                style: 
                                                                {
                                                                    padding: '10px 0',
                                                                    text_align: 'center'
                                                                },
                                                                components:
                                                                [
                                                                    new Button
                                                                    (
                                                                        {
                                                                            type: 'primary',
                                                                            content: 'Salvar',
                                                                            attributes: {draggable: true}
                                                                        }
                                                                    )
                                                                ]
                                                            }
                                                        )
                                                    ]
                                            }
                                        )
                                    ]
                                }
                            )
                        ]
                    }
                )
            ]
        )
        */
        //
    }

    static salvar()
    {
        var dados = Requisicao.form.getValues()
        Server.call('Requisicao.salvar', dados)
    }

    static salvarCallback(dados)
    {
        if (dados.erro)
        {
            switch (dados.erro)
            {
                case 'Caso não informado':
                    alert('Informe o número do caso')
                    document.getElementById('caso').focus()
                    break
                default:
                    alert(`Ocorreu algum erro inesperado (${dados.erro}). A requisição não foi salva`)
            }
            return
        }
        Notifier.send('Requisição salva')
        if (dados.id_requisicao)
        {
            Requisicao.carregaFormularioCCS
            (
                {
                    id_requisicao: dados.id_requisicao,
                    caso: dados.caso,
                    processo: dados.processo
                }
            )
        }
    }

    static carregaFormularioCCS(dados)
    {
        Requisicao.form =
            new Component
            (
                {
                    style:
                    {
                        padding: '30px',
                        display: 'grid',
                        grid_template_columns: '250px auto',
                        gap: '10px'
                    },
                    components:
                    [
                        new Component
                        (
                            {
                                node: 'input',
                                name: 'id_requisicao',
                                attributes:
                                {
                                    type: 'hidden',
                                    value: dados.id_requisicao
                                }
                            }
                        ),

                        new Component('Caso:'),
                        new Component(dados.caso),
                        new Component('Processo Judicial:'),
                        new Component(dados.processo),
                        new Component
                        (
                            {
                                node: 'label',
                                content: 'Arquivos CCS:',
                                attributes:
                                {
                                    for: 'arquivos'
                                }
                            }
                        ),
                        new File
                        (
                            {
                                name: 'arquivos',
                                multiple: true,
                                attributes:
                                {
                                    id: 'arquivos'
                                }
                            }
                        )
                    ]
                }
            )
        PainelControle.carrega
        (
            [
                new Glass
                (
                    {
                        title: 'Upload dos arquivos CCS',
                        style:
                        {
                            margin_top: '30px'
                        },
                        components:
                        [
                            Requisicao.form,
                            new Component
                            (
                                {
                                    style:
                                    {
                                        padding: '0 30px 30px 30px'
                                    },
                                    components:
                                    [
                                        new Button
                                        (
                                            {
                                                content: dados.id_requisicao ? 'Salvar' : 'Salvar e Avançar',
                                                attributes:
                                                {
                                                    onclick: 'Requisicao.salvarCCS()'
                                                }
                                            }
                                        )
                                    ]
                                }
                            )
                        ]
                    }
                )
            ]
        )
    }

    static salvarCCS()
    {
        var dados = Requisicao.form.getValues()
        Server.call('Requisicao.salvarCCS', dados)
    }

    static salvarCCSCallback(dados)
    {
        if (dados.erro)
        {
            switch (dados.erro)
            {
                case 'Arquivo inválido':
                    alert(`O arquivo ${dados.nome_arquivo} é inválido`)
                    break
                default:
                    alert(`Ocorreu algum erro inesperado (${dados.erro}). A requisição não foi salva`)
            }
            return
        }
        Notifier.send('Dados do CCS salvos')
        if (dados.id_requisicao)
        {
            Requisicao.carregaFormulario3454
            (
                {
                    id_requisicao: dados.id_requisicao,
                    caso: dados.caso,
                    processo: dados.processo
                }
            )
        }
    }
}

class Conformidade
{
    static titulo = 'Conciliação CCS x Contas Simba'
    
    static icone()
    {
        var icone
        icone = new Icon({type: 'join_right'})
        return icone
    }

    static carrega()
    {
        var components
        components =
            [
                new Container
                (
                    {
                        parse: true,
                        content: '<b>' + Conformidade.titulo + '</b><br><br><i>em construção</i>'
                    }
                )
            ]
        PainelControle.display.set
        (
            'components',
            components
        )
    }
}

class Container extends Glass
{
    static defaults =
        {
            style:
            {
                background_color: '#ffffff',
                padding: '50px',
                margin_top: '30px'
            }
        }

    constructor(parameters)
    {
        parameters =
            {
                ...Container.defaults,
                ...parameters
            }
        super(parameters)
    }
}

class Logo extends Component
{
    static defaults =
        {
            style:
                {
                    font_family: 'simba',
                    font_size: '30px',
                    color: 'gray',
                }
        }

    constructor(parametros)
    {
        parametros =
            {
                ...Logo.defaults,
                ...{content: config.title},
                ...parametros
            }
        super(parametros)
    }
}

class Pagina
{
    static titulo
    static largura = 1300
    static altura_cabecalho = 83
    static cores =
        {
            fundo: '#f4f4f4'
        }
    static cabecalho
    static header
    static corpo

    static start()
    {
        document.title = config.title
        Fonts.add('satoshi-variable', '/fonts/satoshi-variable.ttf')
        Cadastro.start()
        Authenticator.show_form = Pagina.telaBoasVindas
        if (config.usuario)
        {
            this.home()
        }
        else
        {
            this.telaBoasVindas()
        }
    }

    static criaEstrutura()
    {
        var icone_logo, icone_usuario
        Page.body.set
        (
            'style', 
            {
                min_width: this.largura + 'px',
                font_family: 'satoshi-variable, sans-serif',
                color: styles['text_color_normal'],
                background: Pagina.cores['fundo']
            }
        )
        icone_logo = new Icon()
        icone_logo.setAttribute('onclick', 'alert("' + this.titulo + '")')
        icone_logo.setStyle('cursor', 'pointer')
        if (this.header)
        {
            this.header.destroy()
        }

        if (config.user)
        {
            icone_usuario = Usuario.icone()
            icone_usuario.setStyle('height', '100%')
            Usuario.ativaMenu(icone_usuario)
        }
        else
        {
            icone_usuario = null
        }

        this.header = 
            new Header
            (
                {
                    nickname: 'header',
                    user: icone_usuario,
                    logo: icone_logo,
                    style:
                        {
                            margin: 'auto',
                            width: Pagina.largura + 'px',
                            display: 'flex',
                            align_items: 'center',
                            justify_content: 'space-between',
                            height: '80px'
                        }
                }
            )
        if (this.cabecalho)
        {
            this.cabecalho.destroy()
        }
        this.cabecalho =
            new Component
            (
                {
                    nickname: 'cabecalho',
                    style:
                    {
                        background_color: '#ffffff'
                    },
                    components:
                        [
                            this.header
                        ]
                }
            )
        if (this.corpo)
        {
            this.corpo.destroy()
        }
        this.corpo = 
            new Component
            (
                {
                    nickname: 'corpo',
                    style:
                    {
                        width: this.largura + 'px',
                        margin: 'auto',
                        min_height: '100px',
                        display: 'flex',
                        justify_content: 'space-between'
                    }
                }
            )
        Page.body.set
        (
            'components',
            [
                this.cabecalho, 
                this.corpo
            ]
        )
        //
    }

    static home(dados)
    {
        Pagina.criaEstrutura()
        PainelControle.carregaMenu()
        Requisicao.carregaFormularioCadastro(dados)
    }

    static telaBoasVindas()
    {
        var gap = 20
        Pagina.criaEstrutura()
        Pagina.corpo.set
        (
            'components',
            [
                new Component
                (
                    {
                        style: 
                        {
                            margin_top: '20px',
                            width: (Pagina.largura - gap) + 'px',
                            display: 'grid',
                            grid_template_columns: '65% 35%',
                            gap: gap + 'px'
                        },
                        components:
                        [
                            new Glass
                            (
                                {
                                    style: 
                                    {
                                        min_height: '200px',
                                        overflow: 'auto',
                                        padding: '25px 80px',
                                        text_align: 'center'
                                    },
                                    parse: true,
                                    components:
                                    [
                                        new Component
                                        (
                                            {
                                                node: 'p',
                                                parse: true,
                                                content: 
                                                    'Você está acessando o ' + 
                                                    '<span style="font-weight: bold; color: ' + styles['text_color_highlight'] + '">' + 
                                                        config.title + 
                                                    '</span>' + 
                                                    ', módulo de gestão de ordens judiciais/extrajudiciais',
                                                style: {padding: '10px 0'}
                                            }
                                        ),
                                        new Component
                                        (
                                            {
                                                content: '© 2024 ' + config.title + '. Todos os direitos reservados',
                                                style: 
                                                {
                                                    margin_top: '20px',
                                                    color: '#aaa',
                                                    font_style: 'italic',
                                                    font_size: 'small',
                                                    text_align: 'center'
                                                }
                                            }
                                        )
                                    ]
                                }
                            ),
                            Autenticacao.formulario()
                        ]
                    }
                )
            ]
        )
        Autenticacao.authenticator.focusEmail()
    }

    static carregando()
    {
        var component
        component = new Component(str.app.loading)
        component.setStyle('color', styles.text_color_discreet)
        component.setStyle('padding', '20px')
        return component
    }
}

class PainelControle
{
    static display = 
        new Component
        (
            {
                style: {width: '100%'}
            }
        )
    static menu =
        new SideMenu
        (
            {
                items: 
                [
                    {
                        label: 'Cadastro de Requisição',
                        action: Requisicao.carregaFormularioCadastro
                    },
                    {
                        label: 'Conformidade de Atendimentos',
                        action: Conformidade.carrega
                    }
                ],
                display: PainelControle.display,
                style:
                {
                    margin_top: '30px',
                    width: '250px',
                    min_width: '250px',
                    max_width: '250px'
                }
            }
        )

    /*
    static carregaMenu()
    {
        Pagina.header.set
        (
            'core',
            this.menu()
        )
    }

    static menu()
    {
        var menu
        menu =
            new Tabsheet
            (
                {
                    background_color: 'transparent',
                    style:
                    {
                        font_size: 'small',
                        margin: 'auto'
                    },
                    items:
                    [
                        Tabsheet.item
                        (
                            'color',
                            {
                                icon: Requisicao.icone(),
                                text: Requisicao.titulo, 
                                onclick: 'Requisicao.carrega()',
                                background_color: '#ffffff'
                            }
                        ),
                        Tabsheet.item
                        (
                            'color',
                            {
                                icon: Conciliacao.icone(), 
                                text: Conciliacao.titulo, 
                                onclick: 'Conciliacao.carrega()',
                                background_color: '#ffffff'
                            }
                        ),
                        Tabsheet.item
                        (
                            'color',
                            {
                                icon: Quarentena.icone(), 
                                text: Quarentena.titulo, 
                                onclick: 'Quarentena.carrega()',
                                background_color: '#ffffff'
                            }
                        ),
                        Tabsheet.item
                        (
                            'color',
                            {
                                icon: Relatorio.icone(), 
                                text: Relatorio.titulo, 
                                onclick: 'Relatorio.carrega()',
                                background_color: '#ffffff'
                            }
                        ),
                        Tabsheet.item
                        (
                            'color',
                            {
                                icon: CadastroAtendimento.icone(), 
                                text: CadastroAtendimento.titulo, 
                                onclick: 'CadastroAtendimento.carrega()',
                                background_color: '#ffffff'
                            }
                        )
                    ],
                    active: 0,
                    trigger: Tabsheet.trigger('color')
                }
            )
        return menu
    }
    */

    static carregaMenu()
    {
        Pagina.corpo.set
        (
            'components',
            [
                PainelControle.menu,
                PainelControle.display
            ]
        )
    }

    static carrega(components)
    {
        PainelControle.display.set
        (
            'components',
            components
        )
    }
}

/*
class Quarentena
{
    static titulo = 'Quarentena de Casos'
    
    static icone()
    {
        var icone
        icone = new Icon({type: 'add_to_queue'})
        return icone
    }

    static carrega()
    {
        PainelControle.carrega
        (
            new Container
            (
                {
                    parse: true,
                    content: '<b>' + this.titulo + '</b><br><br><i>em construção</i>'
                }
            )
        )
    }
}
*/

/*
class Relatorio
{
    static titulo = 'Relatório'
    
    static icone()
    {
        var icone
        icone = new Icon({type: 'assignment'})
        return icone
    }

    static components()
    {
        var components
        components =
            [
                new Container
                (
                    {
                        parse: true,
                        content: '<b>' + this.titulo + '</b><br><br><i>em construção</i>'
                    }
                )
            ]
        return components
    }
}
*/

/*
class Requisicao
{
    static titulo = 'Requisições'

    static menu

    static banner

    static tipos =
        [
            'Novas requisições',
            'Requisições em atendimento',
            'Requisições atendidas',
            'Casos em mora',
            'Falsas pendências de atendimento'
        ]

    static icone()
    {
        var icone
        icone = new Icon({type: 'view_timeline'})
        return icone
    }
    
    static carrega()
    {
        PainelControle.display.set('components', [Pagina.carregando()])
    }

    static carregaCallback(dados)
    {
        var i, components, items, item, css_value
        css_value = ''
        components = []
        items = []
        for (i in Requisicao.tipos)
        {
            components.push
            (
                new Glass
                (
                    {
                        nickname: 'item_' + i,
                        style:
                        {
                            text_align: 'center',
                            font_weight: 'bold'
                        },
                        components:
                        [
                            new Component
                            (
                                {
                                    nickname: 'quantidade',
                                    style:
                                    {
                                        color: styles['text_color_highlight'],
                                        font_size: '42px'
                                    }
                                }
                            ),
                            new Component
                            (
                                {
                                    style:
                                    {
                                        color: styles['text_color_normal'],
                                        font_size: '24px'
                                    },
                                    content: Requisicao.tipos[i]
                                }
                            )
                        ]
                    }
                )
            )
            css_value += (css_value ? ' ' : '') + 'auto'
            item = Tabsheet.item('check', {})
            item.set('nickname', 'item_' + i)
            items.push(item)
        }
        this.menu = 
            new Tabsheet
            (
                {
                    items: items,
                    active: 0,
                    style:
                    {
                        margin_bottom: '20px',
                        font_size: 'smaller',
                        font_weight: 'bold'
                    },
                    trigger: Tabsheet.trigger('check')
                }
            )
        this.banner =
            new Component
            (
                {
                    style:
                    {
                        margin_top: '30px',
                        display: 'inline-grid',
                        gap: '20px',
                        grid_template_columns: css_value
                    },
                    components: components
                }
            )
        PainelControle.carrega
        (
            [
                this.banner,
                new Container
                (
                    {
                        components:
                        [
                            this.menu,
                            new Datatable
                            (
                                {
                                    columns: ['Caso', 'Requisição', 'Data Recebimento', 'Ações'],
                                    searchable_columns: [0, 1, 2],
                                    total: 4,
                                    rows:
                                        [
                                            ['002154', '5489654153', '26/08/2024', ''],
                                            ['002237', '7305468700', '12/07/2024', ''],
                                            ['003446', '3475699001', '07/08/2024', ''],
                                            ['002346', '4578697441', '20/08/2024', '']
                                        ]
                                }
                            )
                        ]
                    }
                )
            ]
        )
        // stubs
        this.setContagem(0, 4)
        this.setContagem(1, 125)
        this.setContagem(2, 12563)
        this.setContagem(3, 21)
        this.setContagem(4, 0) 
    }

    static setContagem(indice, quantidade)
    {
        this.banner.getComponent('item_' + indice, 'quantidade').set
        (
            'content',
            Format.number(quantidade)
        )
        this.menu.getComponent('item_' + indice, 'text').set
        (
            'content',
            (
                quantidade ?
                    '(' + Format.number(quantidade) + ') ' 
                :
                    ''
            ) +
            Requisicao.tipos[indice]
        )
    }
}
*/

class Usuario
{
    static autenticado = false
    
    static nome = ''
    
    static id = null
    
    static menu

    static icone()
    {
        var icone
        icone = new Icon({type: 'user'})
        return icone
    }

    static ativaMenu(component)
    {
        this.menu =
            new Menu
            (
                {
                    component: component,
                    items:
                        [
                            Menu.defaultItem('logout', 'Sair', 'Authenticator.logout()')
                        ],
                    vertex: 3,
                    top: false,
                    style:
                        {
                            ...Menu.defaults.style,
                            ...
                            {
                                background_color: '#ffffff'
                            }
                        }
                }
            )
    }

    static destroiMenu()
    {
        this.menu.destroy()
    }
}

Pagina.start()