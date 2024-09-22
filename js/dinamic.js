class Usuario
{
    static autenticado = false;
    
    static nome = '';
    
    static id = null;
    
    static menu;

    static icone()
    {
        var icone;
        icone = new Icone({type: 'user'});
        return icone;
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
                            Menu.defaultItem('Sair', 'Autenticacao.logout()', 'logout')
                        ],
                    vertex: 3,
                    top: false,
                    style:
                        {
                            ...Menu.defaults.style,
                            ...
                            {
                                background_color: styles['#ffffff']
                            }
                        }
                }
            );
    }

    static destroiMenu()
    {
        this.menu.destroy();
    }
}

class Autenticacao
{
    static formulario()
    {
        var components;
        components =
            [
                new Component
                (
                    {
                        style:
                            {
                                display: 'flex',
                                margin_top: '15px'
                            },
                        components:
                            [
                                new Component
                                (
                                    {
                                        node: 'label',
                                        content: 'Email: ',
                                        style:
                                        {
                                            padding: '10px',
                                            cursor: 'pointer',
                                            width: '30%',
                                            text_align: 'right',
                                            display: 'inline-block'
                                        },
                                        attributes:
                                        {
                                            for: 'email'
                                        }
                                    }
                                ),
                                
                                new Input
                                (
                                    {
                                        attributes:
                                        {
                                            id: 'email',
                                            value: 'augusto.cesar@domus.rm'
                                        },
                                        style:
                                        {
                                            width: '70%'
                                        }
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
                                display: 'flex',
                                margin_top: '15px'
                            },
                        components:
                            [
                                new Component
                                (
                                    {
                                        node: 'label',
                                        content: 'Senha: ',
                                        style:
                                        {
                                            padding: '10px',
                                            cursor: 'pointer',
                                            width: '30%',
                                            text_align: 'right',
                                            display: 'inline-block'
                                        },
                                        attributes:
                                        {
                                            for: 'senha'
                                        }
                                    }
                                ),
                                
                                new Input
                                (
                                    {
                                        attributes:
                                        {
                                            type: 'password',
                                            id: 'senha',
                                            value: '1234567890'
                                        },
                                        style:
                                        {
                                            width: '70%'
                                        }
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
                            display: 'grid',
                            gap: '10px',
                            grid_template_columns: 'auto auto',
                            margin_top: '20px',
                            text_align: 'center'
                        },
                        components:
                        [
                            new Button
                            (
                                {
                                    type: 'secondary',
                                    content: 'Esqueci a senha',
                                    attributes:
                                        {
                                            onclick: 'Autenticacao.ajudaSenha();'
                                        }
                                }
                            ),
                            new Button
                            (
                                {
                                    type: 'primary',
                                    content: 'Entrar',
                                    attributes:
                                        {
                                            onclick: 'Autenticacao.envia();'
                                        }
                                }
                            )
                        ]
                    }
                )
            ];
        return components;
    }

    static envia()
    {
        this.sucesso();
    }

    static sucesso()
    {
        var icone;
        PainelControle.carrega();
        icone = Usuario.icone();
        icone.setStyle('height', '100%');
        Pagina.header.set
        (
            'user', 
            icone
        );
        Usuario.ativaMenu(icone);
    }

    static logout()
    {
        Usuario.destroiMenu();
        Pagina.header.set('core', null);
        Pagina.header.set('user', null);
        Pagina.home();
    }

    static ajudaSenha()
    {
        alert('Em construção');
    }
}

class PainelControle
{
    static carrega()
    {
        Pagina.header.set
        (
            'core',
            this.menu()
        );
        Requisicao.carrega();
    }

    static menu()
    {
        var menu;
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
                                onclick: 'Requisicao.carrega();',
                                background_color: '#ffffff'
                            }
                        ),
                        Tabsheet.item
                        (
                            'color',
                                {
                                icon: Conciliacao.icone(), 
                                text: Conciliacao.titulo, 
                                onclick: 'Conciliacao.carrega();',
                                background_color: '#ffffff'
                            }
                        ),
                        Tabsheet.item
                        (
                            'color',
                            {
                                icon: Quarentena.icone(), 
                                text: Quarentena.titulo, 
                                onclick: 'Quarentena.carrega();',
                                background_color: '#ffffff'
                            }
                        ),
                        Tabsheet.item
                        (
                            'color',
                            {
                                icon: Relatorio.icone(), 
                                text: Relatorio.titulo, 
                                onclick: 'Relatorio.carrega();',
                                background_color: '#ffffff'
                            }
                        ),
                        Tabsheet.item
                        (
                            'color',
                                {
                                    icon: CadastroAtendimento.icone(), 
                                    text: CadastroAtendimento.titulo, 
                                    onclick: 'CadastroAtendimento.carrega();',
                                    background_color: '#ffffff'
                                }
                        )
                    ],
                    active: 0,
                    trigger: Tabsheet.trigger('color')
                }
            );
        return menu;
    }
}

class Requisicao
{
    static titulo = 'Requisições';

    static menu;

    static banner;

    static tipos =
        [
            'Novas requisições',
            'Requisições em atendimento',
            'Requisições atendidas',
            'Casos em mora',
            'Falsas pendências de atendimento'
        ];

    static icone()
    {
        var icone;
        icone = new Icone({type: 'view_timeline'});
        return icone;
    }
    
    static carrega()
    {
        var i, components, items, item, css_value;
        css_value = '';
        components = [];
        items = [];
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
                                        color: styles['text_color'],
                                        font_size: '24px'
                                    },
                                    content: Requisicao.tipos[i]
                                }
                            )
                        ]
                    }
                )
            );
            css_value += (css_value ? ' ' : '') + 'auto';
            item = Tabsheet.item('check', {});
            item.set('nickname', 'item_' + i)
            items.push(item);
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
            );
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
            );
        Pagina.setComponents
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
        );
        // stubs
        this.setContagem(0, 4);
        this.setContagem(1, 125);
        this.setContagem(2, 12563);
        this.setContagem(3, 21);
        this.setContagem(4, 0); 
    }

    static setContagem(indice, quantidade)
    {
        this.banner.getComponent('item_' + indice, 'quantidade').set
        (
            'content',
            Format.number(quantidade)
        );
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
        );
    }
}

class Conciliacao
{
    static titulo = 'Conciliação CCS x Contas Simba';
    
    static icone()
    {
        var icone;
        icone = new Icone({type: 'join_right'});
        return icone;
    }

    static carrega()
    {
        Pagina.setComponents
        (
            [
                new Container
                (
                    {
                        parse: true,
                        content: '<b>' + this.titulo + '</b><br><br><i>em construção</i>'
                    }
                )
            ]
        );
    }
}

class Quarentena
{
    static titulo = 'Quarentena de Casos';
    
    static icone()
    {
        var icone;
        icone = new Icone({type: 'add_to_queue'});
        return icone;
    }

    static carrega()
    {
        Pagina.setComponents
        (
            [
                new Container
                (
                    {
                        parse: true,
                        content: '<b>' + this.titulo + '</b><br><br><i>em construção</i>'
                    }
                )
            ]
        );
    }
}

class Relatorio
{
    static titulo = 'Relatório';
    
    static icone()
    {
        var icone;
        icone = new Icone({type: 'assignment'});
        return icone;
    }

    static carrega()
    {
        Pagina.setComponents
        (
            [
                new Container
                (
                    {
                        parse: true,
                        content: '<b>' + this.titulo + '</b><br><br><i>em construção</i>'
                    }
                )
            ]
        );
    }
}

class CadastroAtendimento
{
    static titulo = 'Cadastro de Atendimento';
    
    static icone()
    {
        var icone;
        icone = new Icone({type: 'app_registration'});
        return icone;
    }

    static carrega()
    {
        Pagina.setComponents
        (
            [
                new Container
                (
                    {
                        style: 
                        {
                            display: 'grid',
                            grid_template_columns: 'auto auto',
                            gap: '10'
                        },
                        components:
                        [
                            new Glass
                            (
                                {
                                    title: 'Upload de arquivos padrão',
                                    components:
                                    [
                                        new Glass
                                        (
                                            {
                                                title: 'Opção #1 - arquivos CCS Sisbajud',
                                                components:
                                                [
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
                                                                new Button
                                                                (
                                                                    {
                                                                        type: 'primary',
                                                                        content: 'Escolher o arquivo'
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
                                                title: 'Opção #2 - arquivos CCS Simba Manual',
                                                components:
                                                [
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
                                                                new Button
                                                                (
                                                                    {
                                                                        type: 'primary',
                                                                        content: 'Escolher o arquivo'
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
                                                            content: 'Salvar'
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
        );
    }
}

class Icone extends Svg
{
    static defaults =
        {
            type: 'app',
            cor1: '#e35150',
            cor2: '#0d173f',
            cor3: '#ffffff',
            width: 0,
            height: 0,
            attributes: {fill: 'none'}
        };

    cor1;

    cor2;

    cor3;

    width = 0;

    height = 0;

    type;

    constructor(parameters)
    {
        var i, width, height;
        parameters = isset(parameters) ? parameters : {};
        width = isset(parameters.width);
        height = isset(parameters.height);
        parameters =
            {
                ...Icone.defaults,
                ...parameters
            };
        super();
        for (i in parameters)
        {
            if 
            (
                (i == 'width' && !width) 
                || 
                (i == 'height' && !height)
            )
            {
                continue;
            }
            this.set(i, parameters[i]);
        }
    }

    set(key, value)
    {
        var data;
        switch (key)
        {
            case 'type':
                this[key] = value;
                this.clear();
                data = this.data();
                this.set('components', data.components);
                this.set('width', data.width);
                this.set('height', data.height);
                break;
            case 'cor1':
            case 'cor2':
                this[key] = value;
                this.set('type', this.type);
                break;
            case 'width':
            case 'height':
                this[key] = value;
                this.setAttribute(key, value);
                this.setAttribute('viewBox', '0 0 ' + this.width + ' ' + this.height);
                break;
            default:
                super.set(key, value);
        }
    }

    data()
    {
        var data;
        switch (this.type)
        {
            case 'add_to_queue':
                data =
                    {
                        width: 21,
                        height: 23,
                        components:
                        [
                            Icone.path
                            (
                                'M10.5003 13.25C10.0903 13.25 9.75027 12.91 9.75027 12.5V7.25C9.75027 6.84 10.0903 6.5 10.5003 6.5C10.9103 6.5 11.2503 6.84 11.2503 7.25V12.5C11.2503 12.91 10.9103 13.25 10.5003 13.25ZM10.5003 16.75C10.3686 16.7513 10.238 16.7263 10.116 16.6765C9.99413 16.6267 9.88338 16.5531 9.79027 16.46C9.70027 16.36 9.63027 16.25 9.57027 16.13C9.5221 16.0092 9.49831 15.88 9.50027 15.75C9.50027 15.49 9.61027 15.23 9.79027 15.04C10.1603 14.67 10.8403 14.67 11.2103 15.04C11.3903 15.23 11.5003 15.49 11.5003 15.75C11.5003 15.88 11.4703 16.01 11.4203 16.13C11.3703 16.25 11.3003 16.36 11.2103 16.46C11.1172 16.5531 11.0064 16.6267 10.8845 16.6765C10.7626 16.7263 10.632 16.7513 10.5003 16.75Z',
                                this.cor1
                            ),
                            Icone.path
                            (
                                'M10.4999 22.2509C9.82989 22.2509 9.14989 22.0809 8.54989 21.7309L2.60989 18.3009C1.40989 17.6009 0.659889 16.3109 0.659889 14.9209V8.08096C0.659889 6.69096 1.40989 5.40096 2.60989 4.70097L8.54989 1.27097C9.74989 0.570972 11.2399 0.570972 12.4499 1.27097L18.3899 4.70097C19.5899 5.40096 20.3399 6.69096 20.3399 8.08096V14.9209C20.3399 16.3109 19.5899 17.6009 18.3899 18.3009L12.4499 21.7309C11.8499 22.0809 11.1699 22.2509 10.4999 22.2509ZM10.4999 2.25097C10.0899 2.25097 9.66989 2.36097 9.29989 2.57097L3.35989 6.00096C2.61989 6.43096 2.15989 7.22096 2.15989 8.08096V14.9209C2.15989 15.7709 2.61989 16.5709 3.35989 17.0009L9.29989 20.4309C10.0399 20.8609 10.9599 20.8609 11.6899 20.4309L17.6299 17.0009C18.3699 16.5709 18.8299 15.7809 18.8299 14.9209V8.08096C18.8299 7.23096 18.3699 6.43096 17.6299 6.00096L11.6899 2.57097C11.3299 2.36097 10.9099 2.25097 10.4999 2.25097Z',
                                this.cor1
                            )
                        ]
                    };
                return data;
            case 'app':
                data = 
                    {
                        height: 47,
                        width: 41,
                        components: 
                        [
                            Icone.path
                            (
                                'M20.6745 0.442682C21.9573 1.40157 23.3704 2.14597 24.7414 2.96187C25.6666 3.51281 26.6171 4.03431 27.5718 4.57684V12.4498C25.1788 11.0788 22.832 9.73718 20.5778 8.44605C16.2165 10.9736 11.8469 13.5012 7.4183 16.0667V38.9917C6.08511 38.5207 5.05052 37.7006 3.90238 37.1118C2.72059 36.5062 1.6145 35.7618 0.5 35.0931V12.1891C1.05935 11.8442 1.68599 11.4573 2.31264 11.0746C4.86547 9.51429 7.5655 8.20633 10.051 6.52406C11.052 5.84695 12.2296 5.4348 13.281 4.82077C14.938 3.85768 16.5488 2.81467 18.1932 1.83055C18.6937 1.53195 19.2572 1.3511 19.7619 1.05671C20.0016 0.917921 20.1656 0.648759 20.3633 0.438477C20.4685 0.438477 20.5736 0.438477 20.6787 0.438477L20.6745 0.442682Z',
                                this.cor2
                            ),
                            Icone.path
                            (
                                'M40.4999 35.1265C38.9396 36.0139 37.4004 36.8719 35.8779 37.7635C34.2713 38.7097 32.69 39.6981 31.0877 40.6485C30.2465 41.1448 29.376 41.5906 28.5306 42.0785C26.5792 43.2098 24.5437 44.1939 22.7058 45.5271C22.0918 45.9729 21.3011 46.179 20.4558 46.5575C18.2856 45.3084 16.0398 44.0173 13.7898 42.7219V34.9709C16.1492 36.3419 18.374 37.6415 20.5777 38.9242C25.0147 36.3714 29.4264 33.8354 33.9307 31.2489V8.37012C36.1639 9.65284 38.3214 10.8935 40.4999 12.1426V35.1265Z',
                                this.cor1
                            ),
                            Icone.path
                            (
                                'M13.7438 27.7751V19.5068C16.0359 18.1904 18.3279 16.8824 20.6074 15.5745C22.9584 16.9371 25.2883 18.2913 27.5762 19.6245V27.6868C25.2673 29.0284 22.9878 30.3531 20.62 31.7284C18.3784 30.4415 16.0947 29.1293 13.7438 27.7793V27.7751Z',
                                this.cor2
                            )
                        ]
                    };
                return data;
            case 'app_registration':
                data =
                    {
                        width: 23,
                        height: 23,
                        components:
                        [
                            Icone.path
                            (
                                'M14.4995 22.25H8.49951C3.06951 22.25 0.749512 19.93 0.749512 14.5V8.49999C0.749512 3.07 3.06951 0.75 8.49951 0.75H10.4995C10.9095 0.75 11.2495 1.09 11.2495 1.5C11.2495 1.91 10.9095 2.25 10.4995 2.25H8.49951C3.88951 2.25 2.24951 3.88999 2.24951 8.49999V14.5C2.24951 19.11 3.88951 20.75 8.49951 20.75H14.4995C19.1095 20.75 20.7495 19.11 20.7495 14.5V12.5C20.7495 12.09 21.0895 11.75 21.4995 11.75C21.9095 11.75 22.2495 12.09 22.2495 12.5V14.5C22.2495 19.93 19.9295 22.25 14.4995 22.25Z',
                                this.cor1
                            ),
                            Icone.path
                            (
                                'M7.99987 17.1889C7.38987 17.1889 6.82987 16.9689 6.41987 16.5689C5.92987 16.0789 5.71987 15.3689 5.82987 14.6189L6.25987 11.6089C6.33987 11.0289 6.71987 10.2789 7.12987 9.86894L15.0099 1.98896C16.9999 -0.00103906 19.0199 -0.00103906 21.0099 1.98896C22.0999 3.07896 22.5899 4.18895 22.4899 5.29895C22.3999 6.19895 21.9199 7.07895 21.0099 7.97895L13.1299 15.8589C12.7199 16.2689 11.9699 16.6489 11.3899 16.7289L8.37987 17.1589C8.24987 17.1889 8.11987 17.1889 7.99987 17.1889ZM16.0699 3.04896L8.18987 10.9289C7.99987 11.1189 7.77987 11.5589 7.73987 11.8189L7.30987 14.8289C7.26987 15.1189 7.32987 15.3589 7.47987 15.5089C7.62987 15.6589 7.86987 15.7189 8.15987 15.6789L11.1699 15.2489C11.4299 15.2089 11.8799 14.9889 12.0599 14.7989L19.9399 6.91895C20.5899 6.26895 20.9299 5.68895 20.9799 5.14895C21.0399 4.49895 20.6999 3.80895 19.9399 3.03896C18.3399 1.43896 17.2399 1.88896 16.0699 3.04896Z',
                                this.cor1
                            ),
                            Icone.path
                            (
                                'M19.35 9.33001C19.28 9.33001 19.21 9.32001 19.15 9.30001C17.8504 8.92996 16.6667 8.23424 15.7112 7.27875C14.7558 6.32325 14.06 5.13964 13.69 3.84002C13.6374 3.64779 13.6624 3.44259 13.7597 3.26864C13.857 3.09469 14.0187 2.9659 14.21 2.91003C14.61 2.80003 15.02 3.03003 15.13 3.43003C15.73 5.56002 17.42 7.25002 19.55 7.85002C19.95 7.96002 20.18 8.38002 20.07 8.78001C19.98 9.12001 19.68 9.33001 19.35 9.33001Z',
                                this.cor1
                            )
                        ]
                    };
                return data;
            case 'assignment':
                data =
                    {
                        width: 19,
                        height: 23,
                        components:
                        [
                            Icone.path
                            (
                                'M13.5008 22.25H5.50079C2.48079 22.25 0.750793 20.52 0.750793 17.5V7.74999C0.750793 4.6 2.35079 3 5.50079 3C5.91079 3 6.25079 3.34 6.25079 3.75C6.25066 3.94702 6.28937 4.14213 6.36471 4.32418C6.44004 4.50623 6.55053 4.67164 6.68984 4.81095C6.82915 4.95026 6.99456 5.06075 7.17661 5.13608C7.35866 5.21142 7.55377 5.25013 7.75079 5.25H11.2508C12.0808 5.25 12.7508 4.58 12.7508 3.75C12.7508 3.34 13.0908 3 13.5008 3C16.6508 3 18.2508 4.6 18.2508 7.74999V17.5C18.2508 20.52 16.5208 22.25 13.5008 22.25ZM4.85079 4.52C3.27079 4.65 2.25079 5.36 2.25079 7.74999V17.5C2.25079 19.72 3.28079 20.75 5.50079 20.75H13.5008C15.7208 20.75 16.7508 19.72 16.7508 17.5V7.74999C16.7508 5.36 15.7308 4.66 14.1508 4.52C13.9801 5.15896 13.6034 5.72377 13.0791 6.12693C12.5548 6.53009 11.9122 6.74909 11.2508 6.74999H7.75079C6.95079 6.74999 6.20079 6.43999 5.63079 5.87C5.25079 5.49 4.99079 5.03 4.85079 4.52Z',
                                this.cor1
                            ),
                            Icone.path
                            (
                                'M11.2507 6.74999H7.75072C6.95072 6.74999 6.20072 6.43999 5.63072 5.86999C5.06072 5.29999 4.75072 4.54999 4.75072 3.74999C4.75072 2.1 6.10072 0.75 7.75072 0.75H11.2507C12.0507 0.75 12.8007 1.06 13.3707 1.63C13.9407 2.2 14.2507 2.95 14.2507 3.74999C14.2507 5.39999 12.9007 6.74999 11.2507 6.74999ZM7.75072 2.25C7.45381 2.2493 7.16339 2.33685 6.91634 2.50153C6.66928 2.66621 6.47674 2.90059 6.36315 3.17491C6.24957 3.44923 6.22006 3.75112 6.27838 4.04224C6.3367 4.33337 6.48022 4.60059 6.69072 4.80999C6.97072 5.08999 7.35072 5.24999 7.75072 5.24999H11.2507C11.5476 5.25069 11.838 5.16314 12.0851 4.99846C12.3322 4.83378 12.5247 4.5994 12.6383 4.32508C12.7519 4.05076 12.7814 3.74887 12.7231 3.45774C12.6647 3.16662 12.5212 2.89939 12.3107 2.69C12.0307 2.41 11.6507 2.25 11.2507 2.25H7.75072ZM9.50072 13.25H5.50072C5.09072 13.25 4.75072 12.91 4.75072 12.5C4.75072 12.09 5.09072 11.75 5.50072 11.75H9.50072C9.91072 11.75 10.2507 12.09 10.2507 12.5C10.2507 12.91 9.91072 13.25 9.50072 13.25ZM13.5007 17.25H5.50072C5.09072 17.25 4.75072 16.91 4.75072 16.5C4.75072 16.09 5.09072 15.75 5.50072 15.75H13.5007C13.9107 15.75 14.2507 16.09 14.2507 16.5C14.2507 16.91 13.9107 17.25 13.5007 17.25Z',
                                this.cor1
                            )
                        ]
                    };
                return data;
            case 'backward':
                data =
                    {
                        width: 10,
                        height: 8,
                        components:
                        [
                            Icone.path
                            (
                                'M2.26367 4.75H8.26367C8.67367 4.75 9.01367 4.41 9.01367 4C9.01367 3.59 8.67367 3.25 8.26367 3.25H2.26367C1.85367 3.25 1.51367 3.59 1.51367 4C1.51367 4.41 1.85367 4.75 2.26367 4.75Z',
                                this.cor3
                            ),
                            Icone.path
                            (
                                'M4.26365 7.75C4.45365 7.75 4.64365 7.68 4.79365 7.53C4.93313 7.38886 5.01135 7.19843 5.01135 7C5.01135 6.80157 4.93313 6.61114 4.79365 6.47L2.32365 4L4.79365 1.53C4.93313 1.38886 5.01135 1.19843 5.01135 1C5.01135 0.801572 4.93313 0.61114 4.79365 0.470002C4.50365 0.180002 4.02365 0.180002 3.73365 0.470002L0.73365 3.47C0.44365 3.76 0.44365 4.24 0.73365 4.53L3.73365 7.53C3.88365 7.68 4.07365 7.75 4.26365 7.75Z',
                                this.cor3
                            )
                        ]
                    };
                return data;
            case 'forward':
                data =
                    {
                        width: 10,
                        height: 8,
                        components:
                        [
                            Icone.path
                            (
                                'M7.5 4.75H1.5C1.09 4.75 0.75 4.41 0.75 4C0.75 3.59 1.09 3.25 1.5 3.25H7.5C7.91 3.25 8.25 3.59 8.25 4C8.25 4.41 7.91 4.75 7.5 4.75Z',
                                this.cor3
                            ),
                            Icone.path
                            (
                                'M5.50002 7.75C5.31002 7.75 5.12002 7.68 4.97002 7.53C4.83054 7.38886 4.75232 7.19843 4.75232 7C4.75232 6.80157 4.83054 6.61114 4.97002 6.47L7.44002 4L4.97002 1.53C4.83054 1.38886 4.75232 1.19843 4.75232 1C4.75232 0.801572 4.83054 0.61114 4.97002 0.470002C5.26002 0.180002 5.74002 0.180002 6.03002 0.470002L9.03002 3.47C9.32002 3.76 9.32002 4.24 9.03002 4.53L6.03002 7.53C5.88002 7.68 5.69002 7.75 5.50002 7.75Z',
                                this.cor3
                            )
                        ]
                    };
                return data;
            case 'join_right':
                data = 
                    {
                        width: 23,
                        height: 23,
                        components:
                        [
                            Icone.path
                            (
                                'M14.4996 22.25C14.3674 22.2504 14.2375 22.2156 14.1232 22.1492C14.0089 22.0828 13.9143 21.9871 13.8491 21.8721C13.784 21.7571 13.7506 21.6268 13.7524 21.4946C13.7543 21.3625 13.7913 21.2331 13.8596 21.12L14.9096 19.37C15.1196 19.01 15.5796 18.9 15.9396 19.11C16.2996 19.32 16.4096 19.78 16.1996 20.14L15.9296 20.59C18.6896 19.94 20.7596 17.46 20.7596 14.5C20.7596 14.09 21.0996 13.75 21.5096 13.75C21.9196 13.75 22.2596 14.09 22.2596 14.5C22.2496 18.77 18.7696 22.25 14.4996 22.25ZM1.49957 9.24999C1.08957 9.24999 0.749573 8.90999 0.749573 8.49999C0.749573 4.23 4.22957 0.750003 8.49957 0.750003C8.63176 0.749614 8.76168 0.784405 8.87598 0.850806C8.99029 0.917206 9.08487 1.01283 9.15001 1.12785C9.21516 1.24287 9.24853 1.37316 9.24669 1.50534C9.24486 1.63752 9.20789 1.76683 9.13957 1.88L8.08957 3.63C7.87957 3.99 7.41957 4.1 7.05957 3.89C6.97465 3.83964 6.90053 3.773 6.84146 3.69389C6.78239 3.61479 6.73954 3.52479 6.71538 3.42907C6.69122 3.33334 6.68621 3.23379 6.70066 3.13613C6.71511 3.03847 6.74873 2.94462 6.79957 2.86L7.06957 2.41C4.30957 3.06 2.23957 5.54 2.23957 8.49999C2.2409 8.59801 2.22273 8.69531 2.18614 8.78625C2.14954 8.87719 2.09525 8.95995 2.0264 9.02973C1.95755 9.0995 1.87553 9.15491 1.78509 9.19272C1.69465 9.23053 1.5976 9.25 1.49957 9.24999ZM17.1796 6.99899C17.0496 6.99899 16.9196 6.96899 16.7996 6.89899L12.8296 4.599C12.7441 4.54918 12.6693 4.483 12.6095 4.40424C12.5497 4.32548 12.506 4.23569 12.4809 4.14001C12.4558 4.04434 12.4498 3.94465 12.4633 3.84667C12.4768 3.74868 12.5095 3.65433 12.5596 3.569C12.7696 3.209 13.2296 3.089 13.5796 3.299L17.1796 5.379L20.7496 3.309C21.1096 3.099 21.5696 3.229 21.7696 3.579C21.9796 3.939 21.8496 4.399 21.4996 4.609L17.5496 6.88899C17.4396 6.95899 17.3096 6.99899 17.1796 6.99899Z',
                                this.cor1
                            ),
                            Icone.path
                            (
                                'M17.18 11.2499C16.72 11.2499 16.25 11.1499 15.88 10.9399L13.48 9.60994C12.7 9.17994 12.11 8.16994 12.11 7.27994V4.73994C12.11 3.83995 12.7 2.83995 13.49 2.39995L15.89 1.06995C16.63 0.659951 17.74 0.659951 18.49 1.06995L20.89 2.39995C21.67 2.82995 22.26 3.83995 22.26 4.72994V7.26994C22.26 8.16994 21.67 9.16994 20.89 9.59994L18.49 10.9299C18.1 11.1499 17.64 11.2499 17.18 11.2499ZM16.61 2.36995L14.21 3.69995C13.91 3.86995 13.61 4.37994 13.61 4.71994V7.25994C13.61 7.60994 13.91 8.11994 14.21 8.27994L16.61 9.61994C16.9 9.77994 17.46 9.77994 17.75 9.61994L20.15 8.28994C20.45 8.11994 20.75 7.60994 20.75 7.26994V4.72994C20.75 4.37995 20.45 3.86995 20.15 3.70995L17.75 2.37995C17.46 2.20995 16.89 2.20995 16.61 2.36995ZM5.82104 17.9989C5.69104 17.9989 5.56104 17.9689 5.44104 17.8989L1.47105 15.5989C1.31214 15.493 1.19952 15.3305 1.15604 15.1445C1.11256 14.9585 1.14148 14.763 1.23692 14.5975C1.33237 14.4321 1.48719 14.3091 1.66996 14.2537C1.85274 14.1982 2.04976 14.2144 2.22104 14.2989L5.82104 16.3789L9.39104 14.3089C9.75104 14.0989 10.211 14.2289 10.411 14.5789C10.621 14.9389 10.491 15.3989 10.141 15.6089L6.19104 17.8889C6.08104 17.9589 5.95104 17.9989 5.82104 17.9989Z',
                                this.cor1
                            ),
                            Icone.path
                            (
                                'M5.8205 22.068C5.4105 22.068 5.0705 21.728 5.0705 21.318V17.238C5.0705 16.828 5.4105 16.488 5.8205 16.488C6.2305 16.488 6.5705 16.828 6.5705 17.238V21.318C6.5705 21.738 6.2405 22.068 5.8205 22.068Z',
                                this.cor1
                            ),
                            Icone.path
                            (
                                'M5.81957 22.2499C5.35957 22.2499 4.88957 22.1499 4.51957 21.9399L2.11957 20.6099C1.33957 20.1799 0.749573 19.1699 0.749573 18.28V15.74C0.749573 14.84 1.33957 13.84 2.11957 13.41L4.51957 12.08C5.25957 11.67 6.37957 11.67 7.11957 12.08L9.51957 13.41C10.2996 13.84 10.8896 14.85 10.8896 15.74V18.28C10.8896 19.1799 10.2996 20.1799 9.50957 20.6199L7.10957 21.9499C6.74957 22.1499 6.28957 22.2499 5.81957 22.2499ZM5.24957 13.37L2.84957 14.7C2.54957 14.87 2.24957 15.38 2.24957 15.72V18.2599C2.24957 18.6099 2.54957 19.1199 2.84957 19.2799L5.24957 20.6099C5.53957 20.7699 6.09957 20.7699 6.38957 20.6099L8.78957 19.2799C9.08957 19.1099 9.38957 18.5999 9.38957 18.2599V15.72C9.38957 15.37 9.08957 14.86 8.78957 14.7L6.38957 13.36C6.10957 13.21 5.53957 13.21 5.24957 13.37Z',
                                this.cor1
                            )
                        ]
                    };
                return data;
            case 'reload':
                data =
                    {
                        width: 18,
                        height: 21,
                        components:
                        [
                            Icone.path
                            (
                                '',
                                this.cor3
                            ),
                            Icone.path
                            (
                                '',
                                this.cor3
                            ),
                            Icone.path
                            (
                                '',
                                this.cor3
                            )
                        ]
                    };
                return data;
            case 'search':
                data = 
                    {
                        width: 17,
                        height: 18,
                        components:
                        [
                            Icone.path
                            (
                                'M8.38867 16.3125C4.15117 16.3125 0.701172 12.8625 0.701172 8.625C0.701172 4.3875 4.15117 0.9375 8.38867 0.9375C12.6262 0.9375 16.0762 4.3875 16.0762 8.625C16.0762 12.8625 12.6262 16.3125 8.38867 16.3125ZM8.38867 2.0625C4.76617 2.0625 1.82617 5.01 1.82617 8.625C1.82617 12.24 4.76617 15.1875 8.38867 15.1875C12.0112 15.1875 14.9512 12.24 14.9512 8.625C14.9512 5.01 12.0112 2.0625 8.38867 2.0625ZM16.2637 17.0632C16.1212 17.0632 15.9787 17.0107 15.8662 16.8983L14.3662 15.3983C14.2616 15.2924 14.2029 15.1496 14.2029 15.0007C14.2029 14.8519 14.2616 14.7091 14.3662 14.6033C14.5837 14.3858 14.9437 14.3858 15.1612 14.6033L16.6612 16.1033C16.8787 16.3208 16.8787 16.6807 16.6612 16.8983C16.5487 17.0107 16.4062 17.0632 16.2637 17.0632Z',
                                this.cor1
                            )
                        ]
                    };
                return data;
            case 'user':
                data =
                    {
                        width: 33,
                        height: 37,
                        components:
                        [
                            Icone.path
                            (
                                'M16.5 19.75C11.2167 19.75 6.91668 15.45 6.91668 10.1667C6.91668 4.88337 11.2167 0.583374 16.5 0.583374C21.7834 0.583374 26.0834 4.88337 26.0834 10.1667C26.0834 15.45 21.7834 19.75 16.5 19.75ZM16.5 3.08337C14.6228 3.08778 12.8236 3.83547 11.4962 5.1629C10.1688 6.49033 9.42109 8.28944 9.41668 10.1667C9.42109 12.044 10.1688 13.8431 11.4962 15.1705C12.8236 16.4979 14.6228 17.2456 16.5 17.25C18.3773 17.2456 20.1764 16.4979 21.5038 15.1705C22.8313 13.8431 23.5789 12.044 23.5834 10.1667C23.5789 8.28944 22.8313 6.49033 21.5038 5.1629C20.1764 3.83547 18.3773 3.08778 16.5 3.08337ZM30.8167 36.4167C30.1334 36.4167 29.5667 35.85 29.5667 35.1667C29.5667 29.4167 23.7 24.75 16.5 24.75C9.30002 24.75 3.43335 29.4167 3.43335 35.1667C3.43335 35.85 2.86668 36.4167 2.18335 36.4167C1.50002 36.4167 0.93335 35.85 0.93335 35.1667C0.93335 28.05 7.91668 22.25 16.5 22.25C25.0834 22.25 32.0667 28.05 32.0667 35.1667C32.0667 35.85 31.5 36.4167 30.8167 36.4167Z',
                                this.cor1
                            )
                        ]
                    };
                return data;
            case 'view_timeline':
                data = 
                    {
                        width: 21,
                        height: 23,
                        components:
                        [
                            Icone.path
                            (
                                'M10.5 8.24999C10.4 8.24999 10.31 8.22999 10.21 8.18999C10.0732 8.13407 9.95627 8.03846 9.87428 7.91548C9.7923 7.7925 9.74902 7.64779 9.75002 7.49999V1.5C9.75002 1.09 10.09 0.75 10.5 0.75C10.91 0.75 11.25 1.09 11.25 1.5V5.68999L11.97 4.96999C12.26 4.67999 12.74 4.67999 13.03 4.96999C13.32 5.25999 13.32 5.73999 13.03 6.02999L11.03 8.02999C10.89 8.16999 10.69 8.24999 10.5 8.24999Z',
                                this.cor1
                            ),
                            Icone.path
                            (
                                'M10.501 8.25103C10.311 8.25103 10.121 8.18103 9.971 8.03103L7.971 6.03104C7.83152 5.8899 7.7533 5.69947 7.7533 5.50104C7.7533 5.30261 7.83152 5.11218 7.971 4.97104C8.261 4.68104 8.741 4.68104 9.031 4.97104L11.031 6.97104C11.321 7.26104 11.321 7.74103 11.031 8.03103C10.881 8.18103 10.691 8.25103 10.501 8.25103ZM14.5 22.25H6.5C0.75 22.25 0.75 19.2 0.75 16.5V15.5C0.75 13.27 0.75 10.75 5.5 10.75C6.69 10.75 7.13 11.04 7.75 11.5C7.78 11.53 7.82 11.55 7.85 11.59L8.87 12.67C9.73 13.58 11.29 13.58 12.15 12.67L13.17 11.59C13.2 11.56 13.23 11.53 13.27 11.5C13.89 11.03 14.33 10.75 15.52 10.75C20.27 10.75 20.27 13.27 20.27 15.5V16.5C20.25 20.32 18.32 22.25 14.5 22.25ZM5.5 12.25C2.25 12.25 2.25 13.27 2.25 15.5V16.5C2.25 19.24 2.25 20.75 6.5 20.75H14.5C17.48 20.75 18.75 19.48 18.75 16.5V15.5C18.75 13.27 18.75 12.25 15.5 12.25C14.78 12.25 14.63 12.34 14.2 12.66L13.23 13.69C12.8802 14.0634 12.4573 14.3609 11.9877 14.5639C11.518 14.7669 11.0116 14.8711 10.5 14.87C9.98835 14.8711 9.48196 14.7669 9.0123 14.5639C8.54265 14.3609 8.11978 14.0634 7.77 13.69L6.8 12.66C6.37 12.34 6.22 12.25 5.5 12.25Z',
                                this.cor1
                            ),
                            Icone.path
                            (
                                'M3.50034 12.25C3.09034 12.25 2.75034 11.91 2.75034 11.5V7.50002C2.75034 5.56002 2.75034 3.15002 6.43033 2.80002C6.84033 2.76002 7.21033 3.06002 7.25033 3.48002C7.29033 3.89002 6.99033 4.26002 6.57033 4.30002C4.25034 4.51002 4.25034 5.45002 4.25034 7.50002V11.5C4.25034 11.91 3.91034 12.25 3.50034 12.25ZM17.5013 12.248C17.0913 12.248 16.7513 11.908 16.7513 11.498V7.49802C16.7513 5.44802 16.7513 4.50802 14.4313 4.28802C14.2339 4.26782 14.0525 4.17016 13.9269 4.01646C13.8013 3.86276 13.7418 3.66554 13.7613 3.46802C13.8013 3.05802 14.1613 2.74802 14.5813 2.79802C18.2613 3.14802 18.2613 5.55802 18.2613 7.49802V11.498C18.2562 11.697 18.1741 11.8863 18.0324 12.0261C17.8907 12.166 17.7004 12.2455 17.5013 12.248Z',
                                this.cor1
                            )
                        ]
                    };
                return data;
        }
    }

    static path(d, fill)
    {
        var path;
        path =
            new Svg
            (
                {
                    node: 'path',
                    attributes:
                    {
                        fill: fill,
                        d: d
                    }
                }
            );
        return path;
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
        };

    constructor(parametros)
    {
        parametros =
            {
                ...Logo.defaults,
                ...{content: Pagina.titulo},
                ...parametros
            };
        super(parametros);
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
        };

    constructor(parameters)
    {
        parameters =
            {
                ...Container.defaults,
                ...parameters
            };
        super(parameters);
    }
}

class Pagina
{
    static titulo;
    static largura = 1300;
    static altura_cabecalho = 83;
    static cores =
        {
            fundo: '#f4f4f4'
        };
    static cabecalho;
    static header;
    static corpo;

    static home()
    {
        var gap = 20;
        Pagina.setComponents
        (
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
                                                        this.titulo + 
                                                    '</span>' + 
                                                    ', módulo de gestão de ordens judiciais/extrajudiciais',
                                                style: {padding: '10px 0'}
                                            }
                                        ),
                                        new Component
                                        (
                                            {
                                                node: 'img',
                                                style:
                                                {
                                                    margin: '20px auto',
                                                    border_radius: '10px',
                                                    display: 'block',
                                                    width: '70%',
                                                    border: 'solid 1px #ccc'
                                                },
                                                attributes:
                                                {
                                                    src: img['home']
                                                }
                                            }
                                        ),
                                        new Component
                                        (
                                            {
                                                content: '© 2024 ' + Pagina.titulo + '. Todos os direitos reservados',
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
                            
                            new Glass
                            (
                                {
                                    style: 
                                    {
                                        min_height: '200px',
                                        overflow: 'auto',
                                        padding: '0px'
                                    },
                                    icon: 'login',
                                    title: 'Login',
                                    components: 
                                    [
                                        new Component
                                        (
                                            {
                                                style: {padding: '20px'},
                                                components: Autenticacao.formulario()
                                            }
                                        )
                                    ]
                                }
                            )
                        ]
                    }
                )
            ]
        );
    }

    static setComponents(components)
    {
        this.corpo.set('components', components);
    }

    static inicia()
    {
        var icone;
        this.titulo = 'Simba Premium';
        document.title = this.titulo;
        img['home'] = 'data:image/jpeg;base64,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';
        Fonts.add('satoshi-variable', 'fonts/satoshi-variable.ttf');
        Page.body.set
        (
            'style', 
            {
                background_repeat: 'no-repeat',
                background_attachment: 'fixed',
                background_size: '100% 100%',
                min_width: this.largura + 'px',
                font_family: 'satoshi-variable, sans-serif',
                color: styles['text_color'],
                background: Pagina.cores['fundo']
            }
        );
        icone = new Icone();
        icone.setAttribute('onclick', 'alert("' + this.titulo + '");');
        icone.setStyle('cursor', 'pointer');
        this.header = 
            new Header
            (
                {
                    nickname: 'header',
                    logo: icone,
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
            );
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
            );
        this.corpo = 
            new Component
            (
                {
                    nickname: 'corpo',
                    style:
                    {
                        width: this.largura + 'px',
                        margin: 'auto',
                        min_height: '100px'
                    }
                }
            );
        Page.body.set
        (
            'components',
            [
                this.cabecalho, 
                this.corpo
            ]
        );
        Pagina.home();
    }
}

Pagina.inicia();