class Component
{
    static defaults =
        {
            node: 'div',
            xmlns: null,
            name: '',
            nickname: '',
            style: {},
            attributes: {},
            parse: false,
            content: '',
            components: [],
            ondestroy: null,
            onposition: null
        };

    static instances = {};

    static repositioning = false;

    index;

    name;

    nickname;
    
    parse;
    
    element;

    parent = null;

    components = [];

    events = 
        {
            destroy: [],
            position: []
        };

    lastPosition;

    constructor(parameters = {})
    {
        var i, j;
        this.index = Page.nextSequence();
        Component.instances[this.index] = this;
        parameters = 
            {
                ...Component.defaults,
                ...parameters
            };
        switch (parameters.node)
        {
            case 'head':
                this.element = document.head;
                break;
            case 'body':
                this.element = document.body;
                break;
            default:
                this.element = 
                    have(parameters.xmlns) ?
                        document.createElementNS(parameters.xmlns, parameters.node)
                    :
                        document.createElement(parameters.node);
        }
        delete parameters.node;
        delete parameters.xmlns;
        for (i in this.events)
        {
            this['on' + i] = 
                new Function
                (
                    'event', 
                    "Component.callEvent(event, '" + i + "', " + this.index + ");"
                );
        }
        this.updatePosition();
        for (i in parameters)
        {
            this.set(i, parameters[i]);
        }
        Component.repositionAll(this);
    }

    set(key, value)
    {
        var i;
        switch (key)
        {
            case 'name':
                this.name = value;
                break;
            case 'nickname':
                this.nickname = value;
                break;
            case 'parse':
                this.parse = value ? true : false;
                this.set('content', this.element.innerText);
                break;
            case 'content':
                for (i in this.components)
                {
                    this.components[i].destroy();
                }
                this.element[this.parse ? 'innerHTML' : 'innerText'] = value;
                break;
            case 'components':
                this.clear();
                if (have(value))
                {
                    for (i in value)
                    {
                        this.append(value[i]);
                    }
                }
                break;
            case 'style':
                if (have(value))
                {
                    for (i in value)
                    {
                        this.element.style[Format.attribute(i)] = value[i];
                    }
                }
                break;
            case 'attributes':
                if (have(value))
                {
                    for (i in value)
                    {
                        this.element.setAttribute(Format.attribute(i), value[i]);
                    }
                }
                break;
            case 'ondestroy':
                this.events.destroy = 
                    typeof value == 'function' ? 
                        [value] 
                    : 
                        [];
                break;
            case 'onposition':
                this.events.position = 
                    typeof value == 'function' ? 
                        [value] 
                    : 
                        [];
                break;
        }
        if (this.changedPosition())
        {
            this.onposition();
            this.updatePosition();
            Component.repositionAll(this);
        }
    }

    setAttribute(key, value)
    {
        this.element.setAttribute(Format.attribute(key), value);
        if (this.changedPosition())
        {
            this.onposition();
            this.updatePosition();
            Component.repositionAll(this);
        }
    }

    setStyle(key, value)
    {
        this.element.style[Format.attribute(key)] = value;
        if (this.changedPosition())
        {
            this.onposition();
            this.updatePosition();
            Component.repositionAll(this);
        }
    }

    append(component)
    {
        if (this == component)
        {
            Error
            (
                str.component['appending_itself'], 
                'Component', 
                'append', 
                component
            );
        }
        if (!component instanceof Component)
        {
            Error
            (
                str.component['invalid_component'], 
                'Component', 
                'append', 
                component
            );
        }
        this.element.appendChild(component.element);
        this.components.push(component);
        component.parent = this;
    }

    insertBefore(new_component, existing_component)
    {
        var i;
        if (!new_component instanceof Component)
        {
            Error
            (
                str.component['invalid_component'], 
                'Component', 
                'insertBefore', 
                new_component
            );
        }
        if (!existing_component instanceof Component)
        {
            Error
            (
                str.component['invalid_component'], 
                'Component', 
                'insertBefore', 
                existing_component
            );
        }
        for (i in this.components)
        {
            if (this.components[i] == new_component)
            {
                return false;
            }
        }
        for (i in this.components)
        {
            if (this.components[i] == existing_component)
            {
                this.element.insertBefore
                (
                    new_component.element, 
                    this.components[i].element
                );
                this.components.splice(i, 0, new_component);
                new_component.parent = this;
                return true;
            }
        }
        return false;
    }

    removeChild(component)
    {
        var i;
        if (!component instanceof Component)
        {
            Error
            (
                str.component['invalid_component'], 
                'Component', 
                'removeChild', 
                component
            );
        }
        for (i in this.components)
        {
            if (this.components[i] == component)
            {
                this.components[i].destroy();
                return true;
            }
        }
        return false;
    }

    clear()
    {
        while (this.components.length)
        {
            this.components[0].destroy();
        }
        if (this.changedPosition())
        {
            this.onposition();
            this.updatePosition();
            Component.repositionAll(this);
        }
    }

    destroy(cascade = true)
    {
        var i;
        this.ondestroy();
        if (cascade)
        {
            while (this.components.length)
            {
                this.components[0].destroy();
            }
        }
        if (have(this.parent))
        {
            this.element.parentNode.removeChild(this.element);
            for (i in this.parent.components)
            {
                if (this.parent.components[i] == this)
                {
                    this.parent.components.splice(i, 1);
                    break;
                }
            }
            this.updatePosition();
            Component.repositionAll(this);
        }
        this.element = null;
        delete Component.instances[this.index];
    }

    isParentOf(component)
    {
        var i;
        for (i in this.components)
        {
            if (this.components[i] == component)
            {
                return true;
            }
            else
            {
                if (this.components[i].isParentOf(component))
                {
                    return true;
                }
            }
        }
        return false;
    }

    getComponent()
    {
        var i, j, component, found;
        component = this;
        for (i in arguments)
        {
            found = false;
            for (j in component.components)
            {
                if (component.components[j].nickname == arguments[i])
                {
                    component = component.components[j];
                    found = true;
                    break;
                }
            }
            if (!found)
            {
                return null;
            }
        }
        return component;
    }

    getValue()
    {
        return this.element.value;
    }

    setValue(value)
    {
        this.element.value = value;
    }

    serverParameters()
    {
        var i, parameters;
        parameters = {};
        for (i in this.components)
        {
            if (have(this.components[i].name))
            {
                parameters[this.components[i].name] = this.components[i].getValue();
            }
            parameters =
                {
                    ...parameters,
                    ...this.components[i].serverParameters()
                }
        }
        return parameters;
    }

    html(outer = true)
    {
        return this.element[outer ? 'outerHTML' : 'innerHTML'];
    }

    changedPosition()
    {
        var changed;
        changed = 
            this.lastPosition.left !== this.element.offsetLeft 
            || 
            this.lastPosition.top !== this.element.offsetTop
            ||
            this.lastPosition.height !== this.element.offsetHeight
            ||
            this.lastPosition.width !== this.element.offsetWidth;
        return changed;
    }

    updatePosition()
    {
        this.lastPosition =
            have(this.element)
            &&
            have(this.element.parentNode) ?
                {
                    top: this.element.offsetTop,
                    left: this.element.offsetLeft,
                    width: this.element.offsetWidth,
                    height: this.element.offsetHeight
                }
            :
                {
                    top: null,
                    left: null,
                    width: null,
                    height: null
                };
    }

    static repositionAll(triggerComponent = null)
    {
        var i;
        if (!this.repositioning)
        {
            this.repositioning = true;
            for (i in Component.instances)
            {
                if (Component.instances[i] == triggerComponent)
                {
                    continue;
                }
                if (Component.instances[i].changedPosition())
                {
                    if (typeof Component.instances[i].onposition == 'function')
                    {
                        Component.instances[i].onposition();
                    }
                    Component.instances[i].updatePosition();
                }
            }
            this.repositioning = false;
        }
    }

    static get(index)
    {
        var i;
        for (i in this.instances)
        {
            if (this.instances[i].index == index)
            {
                return this.instances[i];
            }
        }
    }

    static callEvent(eventData, eventName, index)
    {
        var i, instance;
        instance = this.get(index);
        for (i in instance.events[eventName])
        {
            instance.events[eventName][i](eventData);
        }
    }

    static start()
    {
        document.addEventListener
        (
            'resize', 
            Component.repositionAll
        );
        str.component =
            {
                appending_itself: 'it is invalid for a component to attach to itself',
                invalid_component: 'the method parameter should be a valid component'
            };
    }
}

class Audio extends Component
{
    static defaults =
        {
            error_message: '',
            sources_by_type: {}
        };

    error_message = '';

    constructor(parameters = {})
    {
        var i;
        parameters =
            {
                ...Audio.defaults,
                ...{error_message: str.audio.error_message},
                ...parameters
            };
        for (i in parameters)
        {
            this.set(i, parameters[i]);
        }
    }

    set(key, value)
    {
        var i, j;
        switch (key)
        {
            case 'error_message':
                this.error_message = value;
                break;
            case 'sources_by_type':
                j = 0;
                super.set('content', this.error_message);
                for (i in value)
                {
                    this.append
                    (
                        new Component
                        (
                            {
                                nickname: 'source_' + (++j),
                                node: 'source',
                                attributes:
                                {
                                    type: i,
                                    src: value[i]
                                }
                            }
                        )
                    );
                }
                break;
            default:
                super.set(i, value);
        }
    }

    start()
    {
        str.audio =
            {
                error_message: 'Your browser does not support the audio tag.'
            };
    }
}

class Button extends Component
{
    static defaults =
        {
            size: 'normal',
            type: 'primary',
            disabled: false,
            style: {}
        };

    static domains =
        {
            type: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link'],
            size: ['large', 'larger', 'medium', 'small', 'smaller', 'x-large', 'x-small', 'xx-large', 'xx-small', 'xxx-large']
        };

    userStyle;

    constructor(parameters)
    {
        var i;
        super({node: 'button'});
        this.element.addEventListener
        (
            'mouseover', 
            new Function
            (
                'Component.get(' + this.index + ').changeStatus(true);'
            )
        );
        this.element.addEventListener
        (
            'mouseout', 
            new Function
            (
                'Component.get(' + this.index + ').changeStatus(false);'
            )
        );
        parameters = 
            {
                ...Button.defaults,
                ...parameters
            };
        for (i in parameters)
        {
            this.set(i, parameters[i]);
        }
    }

    set (key, value)
    {
        switch (key)
        {
            case 'type':
                this.type = Format.validValue(value, Button.domains[key]);
                this.set('style', this.getStyle(false));
                break;
            case 'disabled':
                this.disabled = value ? true : false;
                this.setStyle('opacity', this.disabled ? '.5' : '1');
                break;
            case 'size':
                this.size = Format.validValue(value, Button.domains[key], 'medium');
                this.set('style', this.getStyle(false));
                break;
            case 'style':
                this.userStyle = value;
                value = this.getStyle(false);
            default:
                super.set(key, value);
        }
    }

    getStyle(hover)
    {
        var userStyle, defaultStyle, typeStyle, sizeStyle, finalStyle;
        userStyle = coalesce(this.userStyle, {});
        defaultStyle =
            {
                filter: 'brightness(' + (hover ? '92%' : '100%') + ')',
                font_size: this.size, 
                user_select: 'none', 
                cursor: 'pointer',
                border: 0
            };
        typeStyle =
            this.type ?
                {
                    color: styles['button_' + this.type + '_color'],
                    background_color: styles['button_' + this.type + '_bgcolor']
                }
            :
                {};
        if (this.type == 'link')
        {
            typeStyle['text_decoration'] = hover ? 'underline' : 'none';
        }
        switch (this.size)
        {
            case 'large':
                sizeStyle =
                    {
                        font_size: this.size,
                        padding: '.375rem .75rem', 
                        border_radius: '.25rem'
                    };
                break;
            case 'larger':
                sizeStyle =
                    {
                        font_size: this.size,
                        padding: '.375rem .75rem', 
                        border_radius: '.25rem'
                    };
                break;
            case 'small':
                sizeStyle =
                    {
                        font_size: this.size,
                        padding: '.375rem .75rem', 
                        border_radius: '.25rem'
                    };
                break;
            case 'smaller':
                sizeStyle =
                    {
                        font_size: this.size,
                        padding: '.375rem .75rem', 
                        border_radius: '.25rem'
                    };
                break;
            case 'x-large':
                sizeStyle =
                    {
                        font_size: this.size,
                        padding: '.375rem .75rem', 
                        border_radius: '.25rem'
                    };
                break;
            case 'x-small':
                sizeStyle =
                    {
                        font_size: this.size,
                        padding: '.375rem .75rem', 
                        border_radius: '.25rem'
                    };
                break;
            case 'xx-large':
                sizeStyle =
                    {
                        font_size: this.size,
                        padding: '.375rem .75rem', 
                        border_radius: '.25rem'
                    };
                break;
            case 'xx-small':
                sizeStyle =
                    {
                        font_size: this.size,
                        padding: '.375rem .75rem', 
                        border_radius: '.25rem'
                    };
                break;
            case 'xxx-large':
                sizeStyle =
                    {
                        font_size: this.size,
                        padding: '.375rem .75rem', 
                        border_radius: '.25rem'
                    };
                break;
            case 'medium':
            default:
                sizeStyle =
                    {
                        font_size: this.size,
                        padding: '.75rem .75rem', 
                        border_radius: '.25rem'
                    };
        }
        finalStyle =
            {
                ...defaultStyle,
                ...typeStyle,
                ...sizeStyle,
                ...userStyle
            };
        return finalStyle;
    }

    changeStatus(activated)
    {
        super.set('style', this.getStyle(activated));
    }

}

class Datatable extends Component
{
    static defaults =
        {
            title: '',
            columns: [],
            searchable_columns: [],
            rows: [],
            show_number: true,
            show_check: true,
            toggle_row: true,
            order: [],
            total: 0,
            page: 1,
            per_page: 10
        };

    static instances = {};

    static index = 0;

    table;

    title;

    columns;

    searchable_columns = [];

    rows;

    show_number;

    show_check;

    toggle_row;

    order;
            
    total;

    page;

    per_page;

    max_page_options = 20;

    pages = 0;

    tools;

    constructor(parameters)
    {
        var i, name_in_use;
        super();
        Datatable.instances[this.index] = this;
        parameters =
            {
                ...Datatable.defaults,
                ...parameters
            };
        if (!have(parameters.nickname))
        {
            do
            {
                parameters.nickname = 'Datatable' + (++Datatable.index);
                name_in_use = false;
                for (i in Datatable.instances)
                {
                    if (Datatable.instances[i].nickname == parameters.nickname)
                    {
                        name_in_use = true;
                        break;
                    }
                }
            }
            while (name_in_use);
        }
        delete parameters.components;
        this.tools =
            {
                search: 
                    new Datatable.toolSearch
                    (
                        {datatable_instance: this}
                    ),
                refresh: 
                    new Datatable.toolRefresh
                    (
                        {datatable_instance: this}
                    ),
                pagination: 
                    new Datatable.toolPagination
                    (
                        {datatable_instance: this}
                    ),
                total: 
                    new Datatable.toolTotal
                    (
                        {datatable_instance: this}
                    )
            };
        this.append
        (
            new Component
            (
                {
                    nickname: 'header',
                    style:
                        {
                            display: 'flex',
                            overflow: 'auto'
                        },
                    components:
                        [
                            new Component
                            (
                                {
                                    nickname: 'tools',
                                    components: 
                                        [
                                            this.tools['search'],
                                            this.tools['refresh'],
                                            this.tools['pagination'],
                                            this.tools['total']
                                        ],
                                    style:
                                        {
                                            font_size: 'small',
                                            display: 'flex'
                                        }
                                }
                            )
                        ]
                }
            )
        );
        this.append
        (
            new Table
            (
                {
                    nickname: 'table',
                    style:
                        {
                            width: '100%',
                            border_collapse: 'collapse',
                            border_top: styles['datatable_border'],
                            border_bottom: styles['datatable_border']
                        }
                }
            )
        );
        for (i in parameters)
        {
            this.set(i, parameters[i]);
        }
    }

    set(key, value)
    {
        var i, component;
        switch (key)
        {
            case 'title':
                this[key] = value;
                if (have(value))
                {
                    component = this.getTitle();
                    component.set
                    (
                        'components', 
                        [
                            new Icon
                            (
                                {
                                    type: 'dataset',
                                    style: {margin_right: '5px', color: '#ccc'}
                                }
                            ),
                            new Component
                            (
                                {
                                    content: value
                                }
                            )
                        ]
                    );
                }
                else
                {
                    component = this.getComponent('header', 'title');
                    if (have(component))
                    {
                        component.destroy();
                    }
                }
                break;
            case 'columns':
                this[key] = value;
                this.redrawTable();
                this.tools['search'].refreshColumns();
                break;
            case 'searchable_columns':
                this[key] = value;
                this.tools['search'].refreshColumns();
                break;
            case 'rows':
                this[key] = value;
                this.redrawTable();
                break;
            case 'toggle_row':
                this[key] = value ? true : false;
                this.redrawTable();
                break;
            case 'show_number':
                this[key] = value ? true : false;
                this.redrawTable();
                break;
            case 'show_check':
                this[key] = value ? true : false;
                this.redrawTable();
                break;
            case 'order':
                this[key] = value;
                break;
            case 'total':
                this[key] = value;
                this.setPages();
                this.tools['total'].refreshValue();
                this.tools['pagination'].refreshOptions();
                break;
            case 'page':
                this[key] = value;
                this.tools['pagination'].refreshValue();
                break;
            case 'per_page':
                this[key] = value;
                this.setPages();
                this.tools['pagination'].refreshOptions();
                this.tools['pagination'].refreshValue();
                break;
            default:
                super.set(key, value);
        }
    }

    redrawTable()
    {
        var i, j, table, rows, cols, style;
        table = this.getComponent('table');
        table.clear();
        rows = [];
        cols = [];
        for (i in this.columns)
        {
            cols.push
            (
                Format.isString(this.columns[i]) ?
                    {
                        content: this.columns[i],
                        parse: true,
                        style:
                            {
                                font_weight: 'bold',
                                text_align: 'center',
                                user_select: 'none'
                            }
                    }
                :
                    this.columns[i]
            );
        }
        rows.push(cols);
        for (i in this.rows)
        {
            cols = [];
            for (j in this.rows[i])
            {
                cols.push
                (
                    Format.isString(this.rows[i][j]) ?
                        {
                            content: this.rows[i][j],
                            parse: false,
                            style:
                                {
                                    text_align: 'center'
                                }
                        }
                    :
                        this.rows[i][j]
                );
            }
            rows.push(cols);
        }
        table.set('rows', rows);
        for (i in rows)
        {
            style = 
                i == 0 ?
                    {
                        color: styles['datatable_head_color'],
                        background_color: styles['datatable_head_bgcolor']
                    }
                :
                    this.toggleRowColor ?
                        i % 2 ?
                            {
                                color: styles['datatable_row_color_1'],
                                background_color: styles['datatable_row_bgcolor_1']
                            }
                        :
                            {
                                color: styles['datatable_row_color_2'],
                                background_color: styles['datatable_row_bgcolor_2']
                            }
                    :
                        {
                            color: styles['datatable_row_color_1'],
                            background_color: styles['datatable_row_bgcolor_1']
                        }
                ;
            table.setRow(i, 'style', style);
        }
    }

    getTitle()
    {
        var header, title;
        header = this.getComponent('header');
        title = header.getComponent('title');
        if (!have(title))
        {
            title = 
                new Component
                (
                    {
                        nickname: 'title',
                        style:
                            {
                                width: '100%',
                                padding: '0 15px',
                                color: '#5f5f5f',
                                background_color: '#f0f0f0',
                                display: 'flex',
                                align_items: 'center',
                                font_weight: 'bold',
                                white_space: 'nowrap'
                            }
                    }
                );
            header.insertBefore
            (
                title,
                header.getComponent('tools')
            );
        }
        return title;
    }
    
    setPages()
    {
        this.pages = Math.ceil(this.total / this.per_page);
    }

    static tool =
        class extends Component
        {
            static defaults =
                {
                    nickname: '',
                    style:
                        {
                            padding: '0 10px',
                            height: '40px',
                            border_left: 'dotted 1px #ccc',
                            display: 'flex',
                            align_items: 'center',
                            background_color: '#ffffff',
                            white_space: 'nowrap'
                        },
                    attributes:
                        {
                            onmouseover: 'this.style["background-color"] = styles["background_color_highlight"];',
                            onmouseout: 'this.style["background-color"] = "#ffffff"'
                        }
                };

            constructor(parameters)
            {
                parameters =
                    {
                        ...Datatable.tool.defaults,
                        ...parameters
                    };
                super(parameters);
            }
        };

    static start()
    {
        str.datatable =
            {
                refresh: 'Atualizar Lista',
                total: 'Total',
                page: 'Página',
                first: 'primeira',
                last: 'última'
            };
        styles.datatable_head_color = '#5f5f5f';
        styles.datatable_head_bgcolor = '#ffffff';
        styles.datatable_row_color_1 = '#5f5f5f';
        styles.datatable_row_bgcolor_1 = '#ffffff';
        styles.datatable_row_color_2 = '#5f5f5f';
        styles.datatable_row_bgcolor_2 = '#efefef';
        styles.datatable_border = 'solid 2px #aaa';

        Datatable.toolSearch = 
            class extends Datatable.tool
            {
                static defaults =
                    {
                        datatable_instance: null  
                    };
            
                datatable_instance;

                constructor(parameters)
                {
                    var i;
                    parameters.nickname = 'search';
                    if (!isset(parameters['components']))
                    {
                        parameters['components'] =
                            [
                                new Select
                                (
                                    {
                                        nickname: 'searchable_columns',
                                        style:
                                        {
                                            color: styles['text_color_highlight'],
                                            background_color: styles['background_color_highlight'],
                                            border_radius: '5px 0 0 5px'
                                        }
                                    }
                                ),
                                new Component
                                (
                                    {
                                        style:
                                        {
                                            display: 'flex',
                                            align_items: 'center',
                                            padding_right: '10px',
                                            border: styles['input_border'],
                                            background_color: '#ffffff'
                                        },
                                        components:
                                        [
                                            new Input
                                            (
                                                {
                                                    nickname: 'search',
                                                    attributes:
                                                    {
                                                        type: 'search'
                                                    },
                                                    style:
                                                    {
                                                        min_width: '180px',
                                                        border_width: 0,
                                                        outline: 'none',
                                                        font_size: 'small',
                                                        background_color: '#ffffff'
                                                    }
                                                }
                                            ),
                                            new Svg
                                            (
                                                {
                                                    attributes:
                                                    {
                                                        width: 17,
                                                        height: 18,
                                                        viewbox: '0 0 17 18',
                                                        fill: '#ffffff'
                                                    },
                                                    components:
                                                    [
                                                        new Svg
                                                        (
                                                            {
                                                                node: 'path',
                                                                attributes:
                                                                {
                                                                    d: 'M8.38867 16.3125C4.15117 16.3125 0.701172 12.8625 0.701172 8.625C0.701172 4.3875 4.15117 0.9375 8.38867 0.9375C12.6262 0.9375 16.0762 4.3875 16.0762 8.625C16.0762 12.8625 12.6262 16.3125 8.38867 16.3125ZM8.38867 2.0625C4.76617 2.0625 1.82617 5.01 1.82617 8.625C1.82617 12.24 4.76617 15.1875 8.38867 15.1875C12.0112 15.1875 14.9512 12.24 14.9512 8.625C14.9512 5.01 12.0112 2.0625 8.38867 2.0625ZM16.2637 17.0632C16.1212 17.0632 15.9787 17.0107 15.8662 16.8983L14.3662 15.3983C14.2616 15.2924 14.2029 15.1496 14.2029 15.0007C14.2029 14.8519 14.2616 14.7091 14.3662 14.6033C14.5837 14.3858 14.9437 14.3858 15.1612 14.6033L16.6612 16.1033C16.8787 16.3208 16.8787 16.6807 16.6612 16.8983C16.5487 17.0107 16.4062 17.0632 16.2637 17.0632Z',
                                                                    fill: styles['text_color_highlight']
                                                                }
                                                            }
                                                        )
                                                    ]
                                                }
                                            )
                                        ]
                                    }
                                )
                            ];
                    }
                    parameters =
                        {
                            ...Datatable.toolSearch.defaults,
                            ...parameters
                        };
                    super(parameters);
                    this.datatable_instance = parameters['datatable_instance'];
                }

                refreshColumns()
                {
                    var i, component, all_columns, serchable_columns;
                    component = this.getComponent('searchable_columns');
                    component.clear();
                    all_columns = this.datatable_instance.columns;
                    serchable_columns = this.datatable_instance.searchable_columns;
                    for (i in all_columns)
                    {
                        if (serchable_columns.includes(parseInt(i)))
                        {
                            component.append
                            (
                                new Component
                                (
                                    {
                                        node: 'option',
                                        attributes: {value: i},
                                        content: all_columns[i]
                                    }
                                )
                            );
                        }
                    }
                }
            };

        Datatable.toolRefresh =
            class extends Datatable.tool
            {
                static defaults =
                    {
                        datatable_instance: null  
                    };
            
                datatable_instance;
                
                constructor(parameters)
                {
                    var i;
                    parameters.nickname = 'refresh';
                    if (!isset(parameters.components))
                    {
                        parameters['components'] =
                            [ 
                                new Button
                                (
                                    {
                                        type: 'primary',
                                        style:
                                        {
                                            display: 'flex',
                                            align_items: 'center'
                                        },
                                        components: 
                                        [
                                            new Svg
                                            (
                                                {
                                                    attributes:
                                                    {
                                                        width: 18,
                                                        height: 21,
                                                        viewbox: '0 0 18 21',
                                                        fill: 'none'
                                                    },
                                                    style:
                                                    {
                                                        margin_right: '7px'
                                                    },
                                                    components:
                                                    [
                                                        new Svg
                                                        (
                                                            {
                                                                node: 'path',
                                                                attributes:
                                                                {
                                                                    d: 'M8.76106 20.4257C3.92755 20.4257 -0.00634766 16.4918 -0.00634766 11.6583C-0.00634766 9.92009 0.496825 8.2276 1.47268 6.79432C1.82337 6.2759 2.54001 6.12342 3.05843 6.47412C3.57685 6.82482 3.72933 7.54145 3.37863 8.05988C2.73212 9.03738 2.36212 10.1716 2.30785 11.3423C2.25357 12.513 2.51705 13.6766 3.07034 14.7097C3.62363 15.7428 4.44614 16.607 5.45067 17.2107C6.45521 17.8143 7.60435 18.135 8.77631 18.1386C10.4937 18.1346 12.1397 17.4505 13.3541 16.2361C14.5685 15.0217 15.2525 13.3758 15.2566 11.6583C15.2525 9.94089 14.5685 8.29495 13.3541 7.08054C12.1397 5.86613 10.4937 5.1821 8.77631 5.17807C8.01392 5.17807 7.28203 5.2848 6.56539 5.49827C6.27424 5.58426 5.96097 5.55257 5.69294 5.41C5.42491 5.26743 5.22354 5.02538 5.13211 4.73589C4.94914 4.12598 5.28459 3.48558 5.8945 3.30261C6.8246 3.0129 7.78521 2.87567 8.77631 2.87567C13.6098 2.87567 17.5437 6.80957 17.5437 11.6431C17.5437 16.4766 13.5946 20.4257 8.76106 20.4257Z',
                                                                    fill: styles['button_primary_color']
                                                                }
                                                            }
                                                        ),
                                                        new Svg
                                                        (
                                                            {
                                                                node: 'path',
                                                                attributes:
                                                                {
                                                                    d: 'M5.13202 5.77271C4.87281 5.77271 4.59835 5.68122 4.38488 5.49825C4.15812 5.29702 4.01977 5.01455 3.99979 4.71203C3.97981 4.40951 4.07982 4.1113 4.27815 3.882L6.82451 0.969695C7.23619 0.497018 7.96808 0.436027 8.44076 0.862961C8.91344 1.27465 8.95918 2.00654 8.54749 2.47921L6.00113 5.39152C5.75717 5.63548 5.45222 5.77271 5.13202 5.77271Z',
                                                                    fill: styles['button_primary_color']
                                                                }
                                                            }
                                                        ),
                                                        new Svg
                                                        (
                                                            {
                                                                node: 'path',
                                                                attributes:
                                                                {
                                                                    d: 'M8.09013 7.93792C7.86141 7.93792 7.61745 7.86169 7.41923 7.72446L4.46118 5.55929C4.33987 5.47032 4.23731 5.35828 4.15937 5.2296C4.08143 5.10093 4.02964 4.95814 4.00698 4.80941C3.98431 4.66069 3.99122 4.50895 4.0273 4.3629C4.06337 4.21685 4.12792 4.07935 4.21722 3.95828C4.30619 3.83697 4.41823 3.73441 4.5469 3.65647C4.67558 3.57853 4.81837 3.52674 4.9671 3.50408C5.11582 3.48142 5.26756 3.48832 5.41361 3.5244C5.55966 3.56047 5.69716 3.62502 5.81822 3.71432L8.77627 5.87949C9.27944 6.24543 9.40143 6.96207 9.02023 7.48049C8.79152 7.7702 8.44082 7.93792 8.09013 7.93792Z',
                                                                    fill: styles['button_primary_color']
                                                                }
                                                            }
                                                        )
                                                    ]
                                                }
                                            ),
                                            new Component
                                            (
                                                {
                                                    content: str.datatable['refresh']
                                                }
                                            )
                                        ],
                                        size: 'small'
                                    }
                                )
                            ];
                    }
                    parameters =
                        {
                            ...Datatable.toolRefresh.defaults,
                            ...parameters
                        };
                    super(parameters);
                    this.datatable_instance = parameters['datatable_instance'];
                }
            }
        
        Datatable.toolPagination = 
            class extends Datatable.tool
            {
                static defaults =
                    {
                        datatable_instance: null  
                    };
            
                datatable_instance;
            
                constructor(parameters)
                {
                    var i;
                    parameters.nickname = 'pagination';
                    if (!isset(parameters.components))
                    {
                        parameters.components = 
                            [
                                new Component
                                (
                                    {
                                        node: 'label',
                                        content: str.datatable['page'] + ': ',
                                        attributes: 
                                            {
                                                for: parameters.datatable_instance.nickname + '_page'
                                            },
                                        style: 
                                            {
                                                margin_right: '10px',
                                                cursor: 'pointer',
                                                user_select: 'none'
                                            }
                                    }
                                ),
                                new Button
                                (
                                    {
                                        nickname: 'backward',
                                        type: 'primary',
                                        size: 'small',
                                        components: 
                                        [
                                            new Svg
                                            (
                                                {
                                                    attributes:
                                                    {
                                                        width: 10,
                                                        height: 8,
                                                        viewbox: '0 0 10 8',
                                                        fill: 'none'
                                                    },
                                                    components:
                                                    [
                                                        new Svg
                                                        (
                                                            {
                                                                node: 'path',
                                                                attributes:
                                                                {
                                                                    d: 'M2.26367 4.75H8.26367C8.67367 4.75 9.01367 4.41 9.01367 4C9.01367 3.59 8.67367 3.25 8.26367 3.25H2.26367C1.85367 3.25 1.51367 3.59 1.51367 4C1.51367 4.41 1.85367 4.75 2.26367 4.75Z',
                                                                    fill: styles['button_primary_color']
                                                                }
                                                            }
                                                        ),
                                                        new Svg
                                                        (
                                                            {
                                                                node: 'path',
                                                                attributes:
                                                                {
                                                                    d: 'M4.26365 7.75C4.45365 7.75 4.64365 7.68 4.79365 7.53C4.93313 7.38886 5.01135 7.19843 5.01135 7C5.01135 6.80157 4.93313 6.61114 4.79365 6.47L2.32365 4L4.79365 1.53C4.93313 1.38886 5.01135 1.19843 5.01135 1C5.01135 0.801572 4.93313 0.61114 4.79365 0.470002C4.50365 0.180002 4.02365 0.180002 3.73365 0.470002L0.73365 3.47C0.44365 3.76 0.44365 4.24 0.73365 4.53L3.73365 7.53C3.88365 7.68 4.07365 7.75 4.26365 7.75Z',
                                                                    fill: styles['button_primary_color']
                                                                }
                                                            }
                                                        )
                                                    ]
                                                }
                                            )
                                        ]
                                    }
                                ),
                                new Input
                                (
                                    {
                                        nickname: 'page',
                                        attributes:
                                            {
                                                type: 'search',
                                                id: parameters.datatable_instance.nickname + '_page',
                                                list: parameters.datatable_instance.nickname + '_pages',
                                                onfocus: 'this.value = "";',
                                                onblur: 'Component.get(' + parameters.datatable_instance.index + ').tools["pagination"].newValue(this.value);',
                                            },
                                        style: 
                                            {
                                                width: '60px',
                                                margin: '0 5px',
                                                padding: '5px 0',
                                                text_align: 'center',
                                                background_color: '#ffffff'
                                            }
                                    }
                                ),
                                new Component
                                (
                                    {
                                        node: 'datalist',
                                        nickname: 'pagelist',
                                        attributes: 
                                        {
                                            id: parameters.datatable_instance.nickname + '_pages'
                                        }
                                    }
                                ),
                                new Button
                                (
                                    {
                                        nickname: 'forward',
                                        type: 'primary',
                                        size: 'small',
                                        components:
                                        [
                                            new Svg
                                            (
                                                {
                                                    attributes:
                                                    {
                                                        width: 10,
                                                        height: 8,
                                                        viewbox: '0 0 10 8',
                                                        fill: 'none'
                                                    },
                                                    components:
                                                    [
                                                        new Svg
                                                        (
                                                            {
                                                                node: 'path',
                                                                attributes:
                                                                {
                                                                    d: 'M7.5 4.75H1.5C1.09 4.75 0.75 4.41 0.75 4C0.75 3.59 1.09 3.25 1.5 3.25H7.5C7.91 3.25 8.25 3.59 8.25 4C8.25 4.41 7.91 4.75 7.5 4.75Z',
                                                                    fill: styles['button_primary_color']
                                                                }
                                                            }
                                                        ),
                                                        new Svg
                                                        (
                                                            {
                                                                node: 'path',
                                                                attributes:
                                                                {
                                                                    d: 'M5.50002 7.75C5.31002 7.75 5.12002 7.68 4.97002 7.53C4.83054 7.38886 4.75232 7.19843 4.75232 7C4.75232 6.80157 4.83054 6.61114 4.97002 6.47L7.44002 4L4.97002 1.53C4.83054 1.38886 4.75232 1.19843 4.75232 1C4.75232 0.801572 4.83054 0.61114 4.97002 0.470002C5.26002 0.180002 5.74002 0.180002 6.03002 0.470002L9.03002 3.47C9.32002 3.76 9.32002 4.24 9.03002 4.53L6.03002 7.53C5.88002 7.68 5.69002 7.75 5.50002 7.75Z',
                                                                    fill: styles['button_primary_color']
                                                                }
                                                            }
                                                        )
                                                    ]
                                                }
                                            ) 
                                        ]
                                    }
                                )
                            ];
                    }
                    parameters =
                        {
                            ...Datatable.toolPagination.defaults,
                            ...parameters
                        };
                    super(parameters);
                    this.datatable_instance = parameters['datatable_instance'];
                }
            
                refreshOptions()
                {
                    var i, options, step;
                    options = [];
                    if (have(this.datatable_instance.rows))
                    {
                        if (this.datatable_instance.pages > this.datatable_instance.max_page_options)
                        {
                            step = 
                                Math.ceil
                                (
                                    this.datatable_instance.pages 
                                    / 
                                    this.datatable_instance.max_page_options
                                );
                            options.push
                            (
                                new Component
                                (
                                    {
                                        node: 'option',
                                        attributes: {value: 1},
                                        content: str.datatable['first']
                                    }
                                )
                            );
                            for (i = step; i <= this.datatable_instance.pages; i += step)
                            {
                                if (i == this.datatable_instance.pages)
                                {
                                    break;
                                }
                                options.push
                                (
                                    new Component
                                    (
                                        {
                                            node: 'option',
                                            attributes: {value: i}
                                        }
                                    )
                                );
                            }
                            if (this.datatable_instance.pages > 1)
                            {
                                options.push
                                (
                                    new Component
                                    (
                                        {
                                            node: 'option',
                                            attributes: {value: this.datatable_instance.pages},
                                            content: str.datatable['last']
                                        }
                                    )
                                );
                            }
                        }
                        else
                        {
                            for (i = 1; i <= this.datatable_instance.pages; i++)
                            {
                                options.push
                                (
                                    new Component
                                    (
                                        {
                                            node: 'option',
                                            attributes: {value: i},
                                            content: i == 1 ? 'primeira' : (i == this.datatable_instance.pages ? 'última' : '')
                                        }
                                    )
                                );
                            }
                        }
                    }
                    this.getComponent('pagelist').set
                    (
                        'components',
                        options
                    );
                }
            
                refreshValue()
                {
                    this.getComponent('page').setValue
                    (
                        this.datatable_instance.page
                    );
                    this.getComponent('backward').set
                    (
                        'disabled',
                        this.datatable_instance.page <= 1
                    );
                    this.getComponent('forward').set
                    (
                        'disabled',
                        this.datatable_instance.page >= this.datatable_instance.pages
                    );
                }

                newValue(page)
                {
                    page = parseInt(page.trim());
                    if (page > 0 && page <= this.datatable_instance.pages)
                    {
                        this.datatable_instance.page = page;
                        this.refreshValue();
                    }
                }
            };

        Datatable.toolTotal =
            class extends Datatable.tool
            {
                static defaults =
                    {
                        datatable_instance: null  
                    };
            
                datatable_instance;
                
                constructor(parameters)
                {
                    var i;
                    parameters.nickname = 'refresh';
                    if (!isset(parameters.components))
                    {
                        parameters['components'] =
                            [ 
                                new Component
                                (
                                    {
                                        nickname: 'value',
                                        style:
                                        {
                                            user_select: 'none'
                                        }
                                    }
                                )
                            ];
                    }
                    parameters =
                        {
                            ...Datatable.toolTotal.defaults,
                            ...parameters
                        };
                    super(parameters);
                    this.datatable_instance = parameters['datatable_instance'];
                }

                refreshValue()
                {
                    this.getComponent('value').set
                    (
                        'content',
                        str.datatable['total'] + ': ' + this.datatable_instance.total
                    );
                }
            }
    }
}

class File extends Component
{
    static defaults =
        {
            accept: '',
            multiple: false,
            files: []
        };

    accept = null;

    multiple = null;

    files = null;

    constructor(parameters)
    {
        var i;
        super();
        this.append
        (
            new Component
            (
                {
                    nickname: 'input',
                    node: 'input',
                    style:
                    {
                        display: 'none'
                    },
                    attributes:
                    {
                        onchange: 'Component.get(' + this.index + ').change();',
                        type: 'file'
                    }
                }
            )
        );
        this.append
        (
            new Component
            (
                {
                    nickname: 'drag_area',
                    style:
                    {
                        height: '100px',
                        cursor: 'pointer',
                        color: styles['text_color_normal'],
                        background_color: styles['background_color_normal'],
                        display: 'flex',
                        justify_content: 'center',
                        align_items: 'center',
                        user_select: 'none',
                        border_radius: '10px'
                    },
                    attributes:
                    {
                        ondragover: 'event.preventDefault();',
                        ondragenter: 'Component.get(' + this.index + ').dragenter();',
                        ondragleave: 'Component.get(' + this.index + ').dragleave();',
                        ondrop: 'Component.get(' + this.index + ').drop();',
                        onmouseover: 'Component.get(' + this.index + ').mouseover();',
                        onmouseout: 'Component.get(' + this.index + ').mouseout();',
                        onclick: 'Component.get(' + this.index + ').click();'
                    }
                }
            )
        );
        parameters = 
            {
                ...File.defaults,
                ...parameters
            };
        for (i in parameters)
        {
            this.set(i, parameters[i]);
        }
    }

    set (key, value)
    {
        var i;
        switch (key)
        {
            case 'accept':
                this.accept = value;
                this.getComponent('input').setAttribute
                (
                    'accept', 
                    value
                );
                break;
            case 'multiple':
                this.multiple = value ? true : false;
                this.getComponent('input').setAttribute
                (
                    'multiple', 
                    this.multiple
                );
                this.getComponent('drag_area').set
                (
                    'content', 
                    this.multiple ? str.file['drag_many'] : str.file['drag_one']
                );
                break;
            case 'files':
                this.files = [];
                for (i in value)
                {
                    this.add
                    (
                        false,
                        value[i],
                        false
                    );
                }
                break;
            default:
                super.set(key, value);
        }
    }

    clear()
    {
        var i;
        for (i in this.files)
        {
            this.remove(this.files[i].index);
        }
    }

    add(from_client, file_data, trashed)
    {
        var listing, component, index;
        index = Page.nextSequence();
        if (trashed)
        {

        }
        else
        {
            if (!this.multiple)
            {
                this.clear();
            }
            if (file_data.type.match(/^image\/.*/))
            {
                component =
                    new Component
                    (
                        {
                            node: 'img',
                            style:
                            {
                                max_height: '200px',
                                max_width: '200px',
                                box_sizing: 'border-box',
                                border: '0',
                                margin: '0',
                                cursor: 'pointer'
                            }
                        }
                    );
            }
            else if (file_data.type.match(/^video\/.*/))
            {
                component = new Video();

            }
            else if (file_data.type.match(/^audio\/.*/))
            {
                component = new Audio();
            }
            else
            {
                component =
                    new Component
                    (
                        {
                            content: file_data.name,
                            style:
                            {
                                text_align: 'left'
                            }
                        }
                    );
            }
            if (!have(listing))
            {
                listing =
                    new Component
                    (
                        {
                            nickname: 'listing',
                            style:
                            {
                                overflow: 'auto',
                                max_height: '200px',
                                margin_top: '5px'
                            }
                        }
                    );
                this.append(listing);
            }
            listing.append
            (
                new Component
                (
                    {
                        nickname: 'file_row_' + index,
                        attributes:
                        {
                            onmouseover: 
                                'this.style.backgroundColor = "' + styles['background_color_highlight'] + '";',
                            onmouseout: 
                                'this.style.backgroundColor = "initial";'
                        },
                        style:
                        {
                            padding: '10px',
                            display: 'flex',
                            align_items: 'flex-start',
                            justify_content: 'space-between',
                            overflow: 'auto'
                        },
                        components:
                        [
                            new Component
                            (
                                {
                                    nickname: 'number',
                                    content: (this.files.length + 1) + '.',
                                    style:
                                    {
                                        font_weight: 'bold',
                                        margin_right: '4px'
                                    }
                                }
                            ),
                            new Component
                            (
                                {
                                    style:
                                    {
                                        width: '100%'
                                    },
                                    components:
                                    [
                                        component
                                    ]
                                }
                            ),
                            new Icon
                            (
                                {
                                    type: 'info',
                                    style: 
                                    {
                                        cursor: 'pointer',
                                        user_select: 'none',
                                        color: styles['text_color_normal']
                                    }
                                }
                            ),
                            new Icon
                            (
                                {
                                    type: 'delete',
                                    style: 
                                    {
                                        cursor: 'pointer',
                                        user_select: 'none',
                                        color: styles['text_color_highlight']
                                    }
                                }
                            )
                        ]
                    }
                )
            );
            component.set('nickname', 'file_' + index);
            this.files.push
            (
                {
                    index: index,
                    from_client: from_client, 
                    file_data: file_data,
                    trashed: trashed
                }
            );
            return index;
        }
    }

    remove(index)
    {
        var i, j, listing;
        listing = this.getComponent('listing');
        if (this.files.length == 1)
        {
            this.removeChild('listing');
        }
        else
        {
            listing.getComponent('file_row_' + index).destroy();
            j = 0;
            for (i in listing.components)
            {
                listing.components[i].getComponent('number').set('content', ++j + '.');
            }
        }
        for (i in this.files)
        {
            if (this.files[i].index == index)
            {
                this.files.splice(i, 1);
                break;
            }
        }
    }

    choose()
    {

    }

    change()
    {
        this.processUpload
        (
            this.getComponent('input').element.files
        );
    }

    click()
    {
        this.getComponent('input').element.click();
    }

    mouseover()
    {
        this.getComponent('drag_area').setStyle
        (
            'text_decoration', 
            'underline'
        );
    }

    mouseout()
    {
        this.getComponent('drag_area').setStyle
        (
            'text_decoration', 
            'none'
        );
    }

    highlight(on)
    {
        var drag_area;
        drag_area = this.getComponent('drag_area');
        if (on)
        {
            drag_area.setStyle
            (
                'background_color', 
                styles['background_color_highlight']
            );
            drag_area.setStyle
            (
                'color', 
                styles['text_color_highlight']
            );
        }
        else
        {
            drag_area.setStyle
            (
                'background_color', 
                styles['background_color_normal']
            );
            drag_area.setStyle
            (
                'color', 
                styles['text_color_normal']
            );
        }
    }

    dragenter()
    {
        this.highlight(true);
        event.preventDefault();
    }

    dragleave()
    {
        this.highlight(false);
        event.preventDefault();
    }

    drop()
    {
        event.preventDefault();
        this.highlight(false);
        if
        (
            !isset(event) 
            || 
            !isset(event.dataTransfer) 
            || 
            !isset(event.dataTransfer.files)
        )
        {
            return;
        }
        switch (event.dataTransfer.files.length)
        {
            case 0:
                Notifier.send
                (
                    new Component
                    (
                        {
                            content: str.file['no_file']
                        }
                    )
                );
                return;
            case 1:
                break;
            default:
                if (!this.multiple)
                {
                    Notifier.send
                    (
                        new Component
                        (
                            {
                                content: str.file['only_one_allowed']
                            }
                        )
                    );
                    return;
                }
        }
        this.processUpload(event.dataTransfer.files);
    }

    processUpload(files)
    {
        var i, file_reader, component_index;
        for (i = 0; i < files.length; i++)
        {
            if (typeof files[i] != 'object')
            {
                continue;
            }
            component_index = 
                this.add
                (
                    true,
                    files[i],
                    false
                );
            if (files[i].type.match(/^[audio|image|video]\/.*/))
            {
                file_reader = new FileReader();
                file_reader.onload =
                    new Function
                    (
                        "Component.get(" + this.index + ").srcLoad(" + component_index + ", '" + files[i].type + "');"
                    );
                file_reader.readAsDataURL(files[i]);
            }
        };
    }

    srcLoad(component_index, type)
    {
        var component, parameters;
        component = this.getComponent('file_' + component_index);
        if (type.match(/^image\/.*/))
        {
            component.setAttribute('scr', event.target.result);
        }
        else
        {
            parameters = {};
            parameters[type] = event.target.result;
            component.set('sources_by_type', parameters);
        }
    }

    getValue()
    {
        return this.name && this.files.length ? this.files : null;
    }

    static start()
    {
        str.file =
            {
                drag_one: 'arraste um arquivo aqui ou clique',
                drag_many: 'arraste arquivos aqui ou clique',
                clear: 'limpar',
                trash: 'lixeira',
                no_file: 'nenhum arquivo localizado',
                only_one_allowed: 'envie  somente um arquivo'
            }
    }
}

class Fonts
{
    static add(name, url)
    {
        Head.addStyle
        (
            '@font-face', 
            {
                font_family: name,
                src: 'url("' + url + '")'
            }
        );
    }
}

class Format
{
    static attribute(value)
    {
        return value.replace(/_/g, '-');
    }

    static isString(test)
    {
        return typeof test === 'string' || test instanceof String;
    }

    static validValue(value, domain, coalesce = null)
    {
        return domain.includes(value) ? value : coalesce;
    }

    static number(value)
    {
        return value.toLocaleString();
    }
}

class Glass extends Component
{
    static defaults =
        {
            icon: 'stack',
            title: '',
            style:
                {
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.22)',
                    border_radius: '5px',
                    box_shadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    backdrop_filter: 'blur(5px)',
                    _webkit_backdrop_filter: 'blur(5px)'
                }
        };

    constructor(parameters)
    {
        parameters.style =
            {
                ...Glass.defaults.style,
                ...isset(parameters.style) ? parameters.style : {}
            };
        if (parameters.title)
        {
            parameters.components.unshift
            (
                parameters.icon ?
                    new Component
                    (
                        {
                            style: 
                            {
                                background_color: styles['background_color_title'],
                                color: styles['text_color_normal'],
                                padding: '13px',
                                user_select: 'none',
                                display: 'flex',
                                align_items: 'center'
                            },
                            components:
                            [
                                new Icon
                                (
                                    {
                                        type: parameters.icon,
                                        style:
                                        {
                                            margin_right: '5px' 
                                        }
                                    }
                                ),
                                new Component
                                (
                                    {
                                        content: parameters.title,
                                        style: 
                                        {
                                            font_weight: 'bold',
                                            display: 'inline'
                                        }
                                    }
                                )
                            ]
                        }
                    )
                :
                    new Component
                    (
                        {
                            content: parameters.title,
                            style: 
                            {
                                font_weight: 'bold',
                                background_color: styles['background_color_title'],
                                color: styles['text_color_normal'],
                                user_select: 'none',
                                padding: '13px',
                                display: 'flex',
                                align_items: 'center'
                            }
                        }
                    )
            );
        }
        super
        (
            {
                ...parameters,
                ...Glass.parameters
            }
        );
    }
}

class Head
{
    static style = null;

    static addStyle(key, value)
    {
        var i, html = '';
        if (!this.style)
        {
            this.style = new Component({node: 'style'});
            Page.head.append(this.style);
        }
        html += ' ' + key + ' {';
        for (i in value)
        {
            html += Format.attribute(i) + ':' + value[i] + ';';
        }
        html += '}';
        this.style.element.innerHTML += html;
    }
}

class Header extends Component
{
    static defaults =
        {
            logo: null,
            core: null,
            user: null
        };

    logo = null;
    
    core = null;

    user = null;

    nicknames = 
        {
            logo: 'logo',
            core: 'core',
            user: 'user'
        };

    constructor(parameters)
    {
        var i;
        parameters = 
            {
                ...Header.defaults,
                ...parameters
            };
        super({});
        for (i in parameters)
        {
            this.set(i, parameters[i]);
        }
        this.element.style['display'] = 'flex';
    }

    set(key, value)
    {
        var i, container, component, components;
        switch (key)
        {
            case 'logo':
                component = this.getComponent(this.nicknames['logo']);
                if (have(component))
                {
                    this.removeChild(component);
                }
                this[key] = value;
                if (have(value))
                {
                    if (have(value.nickname))
                    {
                        this.nicknames['logo'] = value.nickname;
                    }
                    value.set('nickname', this.nicknames['logo']);
                    component = 
                        coalesce
                        (
                            this.getComponent(this.nicknames['core']),
                            this.getComponent(this.nicknames['user'])
                        );
                    if (have(component))
                    {
                        this.insertBefore(value, component);
                    }
                    else
                    {
                        this.append(value);
                    }
                }
                else
                {
                    this.nicknames['logo'] = 'logo';
                }
                break;
            case 'core':
                component = this.getComponent(this.nicknames['core']);
                if (have(component))
                {
                    this.removeChild(component);
                }
                this[key] = value;
                if (have(value))
                {
                    if (have(value.nickname))
                    {
                        this.nicknames['core'] = value.nickname;
                    }
                    value.set('nickname', this.nicknames['core']);
                    component = this.getComponent(this.nicknames['user'])
                    if (have(component))
                    {
                        this.insertBefore(value, component);
                    }
                    else
                    {
                        this.append(value);
                    }
                }
                else
                {
                    this.nicknames['core'] = 'core';
                }
                break;
            case 'user':
                component = this.getComponent(this.nicknames['user']);
                if (have(component))
                {
                    this.removeChild(component);
                }
                this[key] = value;
                if (have(value))
                {
                    if (have(value.nickname))
                    {
                        this.nicknames['user'] = value.nickname;
                    }
                    value.set('nickname', this.nicknames['user']);
                    this.append(value);
                }
                else
                {
                    this.nicknames['user'] = 'user';
                }
                break;
            default:
                super.set(key, value);
        }
    }

    static defaultLogo(parameters)
    {
        var logo, defaults;
        defaults =
            {
                icon: null,
                text: null,
                font_size: 30,
                font_family: 'garamound',
                padding: 15
            };
        parameters =
            {
                ...defaults,
                ...parameters
            };
        logo = 
            new Component
            (
                {
                    content: parameters.text,
                    parse: true,
                    style:
                    {
                        font_size: parameters.font_size + 'px',
                        font_family: parameters.font_family,
                        display: 'flex',
                        align_items: 'center'
                    }
                }
            );
        if (have(parameters.icon))
        {
            logo.setStyle('margin_left', parameters.padding);
            logo = 
                new Component
                (
                    {
                        nickname: 'logo',
                        components:
                        [
                            parameters.icon,
                            logo
                        ],
                        style:
                        {
                            display: 'flex',
                            align_items: 'center'
                        }
                    }
                );
        }
        else
        {
            logo.set('nickname', 'logo');
        }
        return logo;
    }

    static defaultUserMenu(parameters)
    {
        var defaults, icon, user_menu;
        defaults =
            {
                nickname: 'user',
                icon_type: 'person',
                style:
                    {
                        color: styles['text_color_normal'],
                        display: 'flex',
                        align_items: 'center',
                        justify_content: 'center',
                        cursor: 'pointer',
                        user_select: 'none',
                        font_size: 'xxx-large'
                    },
                items: []
            };
        parameters =
            {
                ...defaults,
                ...parameters
            };
        parameters['type'] = parameters['icon_type'];
        delete(parameters['icon_type']);
        icon = new Icon(parameters);
        user_menu = 
            new Menu
            (
                {
                    component: icon,
                    items: parameters.items,
                    vertex: 3,
                    top: false,
                    style:
                        {
                            ...Menu.defaults.style,
                            ...
                            {
                                background_color: styles['background_color_normal']
                            }
                        }
                }
            );
        return {icon: icon, user_menu: user_menu};
    }
}

class Icon extends Component
{
	static defaults =
        {
            node: 'i',
            style: 
                {
                    vertical_align: 'middle', 
                    user_select: 'none'
                },
            type: 'clear'
        };

	constructor(parameters) 
	{
        parameters = 
            {
                ...Icon.defaults,
                ...parameters
            };
        parameters.parse = true;
        parameters.content = parameters.type;
        delete parameters.type;
		super(parameters);
		this.element.className = 'material-icons';
	}

    static start()
    {
        Page.head.append
        (
            new Component
            (
                {
                    node: 'link',
                    attributes:
                    {
                        rel: 'stylesheet',
                        href: 'https://fonts.googleapis.com/icon?family=Material+Icons'
                    }
                }
            )
        );
    }
}

class Input extends Component
{
    static defaults =
        {
            size: 'medium'
        };

    static domains =
        {
            size: ['large', 'larger', 'medium', 'small', 'smaller', 'x-large', 'x-small', 'xx-large', 'xx-small', 'xxx-large']
        };

    userStyle;

    constructor(parameters)
    {
        parameters = 
            {
                ...Input.defaults,
                ...parameters,
                ...{node: 'input'}
            };
        super(parameters);
    }

    set (key, value)
    {
        switch (key)
        {
            case 'size':
                this[key] = Format.validValue(value, Input.domains['size'], 'medium');
                super.set('style', this.getStyle());
                break;
            case 'style':
                this.userStyle = value;
                value = this.getStyle();
            default:
                super.set(key, value);
        }
    }

    getStyle()
    {
        var padding, userStyle, defaultStyle, finalStyle;
        userStyle = coalesce(this.userStyle, {});
        padding = 
            {
                'large': 10, 
                'larger': 10, 
                'medium': 10,
                'small': 10,
                'smaller': 10,
                'x-large': 10, 
                'x-small': 10, 
                'xx-large': 10, 
                'xx-small': 10, 
                'xxx-large': 10
            };
        defaultStyle =
            {
                font_size: this.size,
                border: styles['input_border'],
                border_radius: styles['input_radius'],
                padding: padding[this.size] + 'px',
                box_sizing: 'border-box',
                margin: 0
            };
        finalStyle =
            {
                ...defaultStyle,
                ...userStyle
            };
        return finalStyle;
    }
}

class Keys
{
    static pressed = [];

    static codes =
        {
            backspace: 8,
            enter: 13,
            shift: 16,
            ctrl: 17,
            alt: 18,
            pausebreak: 19,
            capslock: 20,
            pageup: 33,
            pagedown: 34,
            end: 35,
            home: 36,
            left: 37,
            up: 38,
            right: 39,
            down: 40,
            printscreen: 44,
            insert: 45,
            delete: 46,
            esc: 27,
            f1: 112,
            f2: 113,
            f3: 114,
            f4: 115,
            f5: 116,
            f6: 117,
            f7: 118,
            f8: 119,
            f9: 120,
            f10: 121,
            f11: 122,
            f12: 123,
            numlock: 144,
            scrolllock: 145
        };

    static start()
    {
        document.addEventListener
        (
            'keydown',
            Keys.keydown
        );
        document.addEventListener
        (
            'keyup',
            Keys.keyup
        );
    }

    static keydown()
    {
        Keys.pressed.push(event.keyCode);
    }

    static keyup()
    {
        Keys.pressed.splice(Keys.pressed.indexOf(event.keyCode), 1);
    }

    static getCode(key)
    {
        var keyCode;
        keyCode = 
            isNaN(key) ?
                Object.keys(Keys.codes).includes(key) ?
                    Keys.codes[key]
                :
                    String.fromCharCode(key)
            :
                key;
        return keyCode;
    }

    static isPressed(list)
    {
        var i, keyCode;
        if (!isArray(list))
        {
            list = [list];
        }
        for (i in list)
        {
            keyCode = Keys.getCode(list[i]);
            if (!Keys.pressed.includes(keyCode))
            {
                return false;
            }
        }
        return true;
    }
}

class Notifier
{
    static active = true;

    static component = null;

    static items = [];

    static send
    (
        component, 
        autodestroy = true, 
        delay = 10000, 
        type = 'warning'
    )
    {
        var style, icons, index, item;
        if (!this.active)
        {
            return;
        }
        index = Page.nextSequence();
        style =
            {
                padding: '10px',
                border_radius: '5px',
                display: 'flex',
                align_items: 'flex-start',
                justify_content: 'space_between',
                border: 'solid 1px #cdcdcd'
            };
        switch (type)
        {
            case 'error':
                style['background_color'] = '#ffe2e6';
                break;
            case 'warning':
                style['background_color'] = '#f4f44a';
                break;
            case 'success':
                style['background_color'] = '#bdecbd';
                break;
            default:
                error
                (
                    str.notifier['invalid_type'], 
                    'Notifier', 
                    'item', 
                    type
                );
        }
        icons = 
            new Icon
            (
                {
                    type: 'close',
                    attributes:
                    {
                        onclick: 'Notifier.close(' + index + ');'
                    },
                    style:
                    {
                        cursor: 'pointer',
                        user_select: 'none',
                        padding: '4px',
                        display: 'flex',
                        align_items: 'center',
                        justify_content: 'center'
                    }
                }
            );
        if (autodestroy)
        {
            icons =
                new Component
                (
                    {
                        nickname: 'icons',
                        components:
                        [
                            icons,
                            new Icon
                            (
                                {
                                    nickname: 'keep',
                                    type: 'pin_drop',
                                    attributes:
                                    {
                                        onclick: 'Notifier.keep(' + index + ');',
                                        title: str.notifier['keep']
                                    },
                                    style:
                                    {
                                        color: '#cccccc',
                                        cursor: 'pointer',
                                        user_select: 'none',
                                        padding: '4px',
                                        display: 'flex',
                                        align_items: 'center',
                                        justify_content: 'center'
                                    }
                                }
                            )
                        ]
                    }
                );
        }
        item = 
        {
            index: index,
            opacity: 100,
            component: 
                new Component
                (
                    {
                        style: style,
                        components:
                        [
                            new Component
                            (
                                {
                                    components: [component],
                                    style:
                                    {
                                        max_height: '300px',
                                        overflow: 'auto',
                                        width: '100%'
                                    }
                                }
                            ),
                            icons
                        ]
                    }
                ),
            timeout: null,
            fade_interval: null
        };
        this.items.push(item);
        if (!this.component)
        {
            this.component = 
                new Component
                (
                    {
                        style:
                        {
                            display: 'flex',
                            flex_direction: 'column',
                            gap: '10px',
                            padding: '10px',
                            width: '300px',
                            position: 'fixed',
                            bottom: '0',
                            right: '0',
                            max_height: '100%',
                            overflow: 'auto',
                            z_index: Page.getZindex('notification')
                        }
                    }
                );
            Page.body.append(this.component);
        }
        this.component.append(item.component);
        if (autodestroy)
        {
            item.timeout = 
                setTimeout
                (
                    new Function
                    (
                        'Notifier.startFadeout(' + item.index + ');'
                    ), 
                    delay
                );
        }
    }

    static startFadeout(index)
    {
        var i, item;
        for (i in this.items)
        {
            item = this.items[i];
            if (item.index == index)
            {
                item.fade_interval = 
                    setInterval
                    (
                        new Function
                        (
                            'Notifier.fade(' + item.index + ');'
                        ),
                        50
                    );
                return;
            }
        }
    }

    static fade(index)
    {
        var i, item;
        for (i in this.items)
        {
            item = this.items[i];
            if (item.index == index)
            {
                item.opacity--;
                if (item.opacity <= 0)
                {
                    item.opacity = 0;
                }
                item.component.setStyle
                (
                    'opacity', 
                    item.opacity + '%'
                );
                if (!item.opacity)
                {
                    item.component.destroy();
                    delete this.items[i];
                    if (!have(this.items.length))
                    {
                        this.component.destroy();
                        this.component = null;
                    }
                }
                break;
            }
        }
    }

    static close(index)
    {
        var i, item;
        for (i in this.items)
        {
            item = this.items[i];
            if (item.index == index)
            {
                clearTimeout(item.timeout);
                clearInterval(item.fade_interval);
                item.component.destroy();
                delete this.items[i];
                return;
            }
        }
    }

    static keep(index)
    {
        var i, item;
        for (i in this.items)
        {
            item = this.items[i];
            if (item.index == index)
            {
                item.component.setStyle
                (
                    'opacity', 
                    '100%'
                );
                item.component.getComponent('icons', 'keep').setStyle
                (
                    'color', 
                    styles['text_color_highlight']
                );
                clearTimeout(item.timeout);
                clearInterval(item.fade_interval);
                return;
            }
        }
    }

    static start()
    {
        str.notifier =
            {
                keep: 'clique para manter essa notificação',
                invalid_type: 'Invalid type'
            };
    }
}

class Menu
{
    static defaults =
        {
            component: null,
            items: [],
            vertex: null,
            top: null,
            style:
                {
                    background_color: '#ffffff'
                }
        };

    static instances = {};

    index;

    component;

    items;

    vertex;

    top;

    style;

    opened = false;

    container;

    constructor(parameters)
    {
        var i, defaults;
        defaults = Object.assign({}, Menu.defaults);
        defaults.style.border = styles['outline'];
        parameters = 
            {
                ...defaults,
                ...parameters
            };
        this.index = Page.nextSequence();
        Menu.instances[this.index] = this;
        this.component =
            have(parameters.component) ?
                parameters.component
            : 
                new Icon
                (
                    {
                        type: 'menu', 
                        style: {cursor: 'pointer'}
                    }
                );
        this.component.element.addEventListener
        (
            'click', 
            new Function('Menu.click(' + this.index + ');')
        );
        this.items = parameters.items;
        this.vertex = 
            parameters.vertex >= 1 
            && 
            parameters.vertex <= 4 ? 
                parameters.vertex 
            : 
                null;
        this.top = 
            parameters.top === null ? 
                null 
            : 
                (
                    parameters.top ? 
                        true 
                    : 
                        false
                );
        this.style = {};
        for (i in Menu.defaults.style)
        {
            this.style[i] = 
                isset(parameters.style[i]) ?
                    parameters.style[i]
                :
                    Menu.defaults.style[i];
        }
    }

    set()
    {
    }

    position()
    {
        var i, j, positions, vertex, top, coordinates, container;
        container = this.component.element.getBoundingClientRect();
        positions = 
            [
                {
                    vertex: 1,
                    top: true,
                    free_space:
                        {
                            y:
                                container.top
                                -
                                this.container.element.offsetHeight,
                            x:
                                Page.body.element.offsetWidth
                                -
                                container.left
                                +
                                this.container.element.offsetWidth
                        }
                },
                {
                    vertex: 1,
                    top: false,
                    free_space:
                        {
                            y:
                                Page.body.element.offsetHeight
                                -
                                container.top
                                -
                                this.container.element.offsetHeight,
                            x:
                                container.left
                                -
                                this.container.element.offsetWidth
                        }
                },
                {
                    vertex: 2,
                    top: true,
                    free_space:
                        {
                            y:
                                container.top
                                -
                                this.container.element.offsetHeight,
                            x:
                                container.left
                                +
                                container.width
                                -
                                this.container.element.offsetWidth
                        }
                },
                {
                    vertex: 2,
                    top: false,
                    free_space:
                        {
                            y:
                                Page.body.element.offsetHeight
                                -
                                container.top
                                -
                                this.container.element.offsetHeight,
                            x:
                                Page.body.element.offsetWidth
                                -
                                container.left
                                -
                                container.width
                                -
                                this.container.element.offsetWidth
                        }
                },
                {
                    vertex: 3,
                    top: true,
                    free_space:
                        {
                            y:
                                container.top
                                +
                                container.height
                                -
                                this.container.element.offsetHeight,
                            x:
                                Page.body.element.offsetWidth
                                -
                                container.left
                                -
                                container.width
                                -
                                this.container.element.offsetWidth
                        }
                },
                {
                    vertex: 3,
                    top: false,
                    free_space:
                        {
                            y:
                                Page.body.element.offsetHeight
                                -
                                container.top
                                -
                                container.height
                                -
                                this.container.element.offsetHeight,
                            x:
                                container.left
                                +
                                container.width
                                -
                                this.container.element.offsetWidth
                        }
                },
                {
                    vertex: 4,
                    top: true,
                    free_space:
                        {
                            y:
                                container.top
                                +
                                container.height
                                -
                                this.container.element.offsetHeight,
                            x:
                                container.left
                                -
                                this.container.element.offsetWidth
                        }
                },
                {
                    vertex: 4,
                    top: false,
                    free_space:
                        {
                            y:
                                Page.body.element.offsetHeight
                                -
                                container.top
                                -
                                container.height
                                -
                                this.container.element.offsetHeight,
                            x:
                                Page.body.element.offsetWidth
                                -
                                container.left
                                -
                                this.container.element.offsetWidth
                        }
                }
            ];
        j = 0;
        for (i in positions)
        {
            if 
            (
                positions[i].free_space.x 
                + 
                positions[i].free_space.y 
                > 
                positions[j].free_space.x 
                + 
                positions[j].free_space.y
            )
            {
                j = i;
            }
        }
        vertex = 
            this.vertex === null ? 
                positions[j].vertex 
            : 
                this.vertex;
        top = 
            this.top === null ?
                positions[j].top 
            : 
                this.top;
        switch (vertex)
        {
            case 1:
                coordinates =
                    top ?
                        {
                            y: container.top - this.container.element.offsetHeight,
                            x: container.left
                        }
                    :
                        {
                            y: container.top,
                            x: container.left - this.container.element.offsetWidth
                        };
                break;
            case 2:
                coordinates =
                    top ?
                        {
                            y: container.top + this.container.element.offsetHeight,
                            x: container.left + container.width - this.container.element.offsetWidth
                        }
                    :
                        {
                            y: container.top,
                            x: container.left + container.width
                        };
                break;
            case 3:
                coordinates =
                    top ?
                        {
                            y: container.top + container.height - this.container.element.offsetHeight,
                            x: container.left + container.width
                        }
                    :
                        {
                            y: container.top + container.height,
                            x: container.left + container.width - this.container.element.offsetWidth
                        };
                break;
            case 4:
                coordinates =
                    top ?
                        {
                            y: container.top + container.height - this.container.element.offsetHeight,
                            x: container.left - this.container.element.offsetWidth
                        }
                    :
                        {
                            y: container.top + container.height,
                            x: container.left
                        };
                break;
        }
        this.container.set
        (
            'style',
            {
                top: coordinates.y + 'px',
                left: coordinates.x + 'px'
            }
        );
    }

    getContainer()
    {
        if (!have(this.container))
        {
            this.container = 
                new Component
                (
                    {
                        node: 'div',
                        style: this.style,
                        components: this.items
                    }
                );
            this.container.element.style.position = 'fixed';
            this.container.element.onclick = Menu.containerClick;
        }
        return this.container;
    }

    open()
    {
        if (!this.opened)
        {
            this.opened = true;
            Page.body.append(this.getContainer());
            this.position();
        }
    }

    close()
    {
        if (this.opened)
        {
            this.opened = false;
            this.container.destroy(false);
            this.container = null;
        }
    }

    destroy()
    {
        this.close();
        delete Menu.instances[this.index];
    }

    static click(index)
    {
        var menu = Menu.instances[index];
        if (menu.opened)
        {
            menu.close();
        }
        else
        {
            menu.open();
        }
        event.stopPropagation();
    }

    static closeAll()
    {
        var i;
        for (i in Menu.instances)
        {
            Menu.instances[i].close();
        }
    }

    static containerClick(event)
    {
        event.stopPropagation();
    }

    static defaultItem(text, onclick = null, iconType = false)
    {
        var item, height, padding, parameters;
        height = 40;
        padding = height / 6;
        parameters = 
            {
                node: 'div',
                parse: true,
                style: 
                    {
                        height: height + 'px',
                        padding_right: (2 * padding) + 'px',
                        display: 'flex',
                        align_items: 'center',
                        position: 'relative',
                        white_space: 'nowrap'
                    },
                content: text
            };
        onclick = onclick.trim();
        if (have(onclick))
        {
            parameters.attributes = 
                {
                    onclick: 
                        onclick + 
                        (onclick.slice(-1) == ';' ? '' : ';') +
                        'Menu.closeAll();' 
                };
            parameters.style['cursor'] = 'pointer';
        }
        if (iconType === false)
        {
            parameters.style['padding_left'] = padding + 'px';
        }
        else
        {
            parameters.style['padding_left'] = height + padding + 'px';
            if (typeof iconType === 'string' || iconType instanceof String)
            {
                parameters.components =
                    [
                        new Icon
                        (
                            {
                                style: 
                                    {
                                        vertical_align: 'middle', 
                                        text_align: 'center',
                                        user_select: 'none', 
                                        line_height: height + 'px',
                                        width: height + 'px',
                                        position: 'absolute',
                                        top: '0',
                                        left: '0'
                                    },
                                type: iconType
                            }
                        )
                    ];
            }
        }
        item = new Component(parameters);
        return item;
    }

    static start()
    {
        document.addEventListener('click', Menu.closeAll);
    }
}

class Select extends Component
{
    static defaults =
        {
            size: 'medium'
        };

    static domains =
        {
            size: ['large', 'larger', 'medium', 'small', 'smaller', 'x-large', 'x-small', 'xx-large', 'xx-small', 'xxx-large']
        };

    userStyle;

    constructor(parameters)
    {
        parameters = 
            {
                ...Input.defaults,
                ...parameters,
                ...{node: 'select'}
            };
        super(parameters);
    }

    set (key, value)
    {
        switch (key)
        {
            case 'size':
                this[key] = Format.validValue(value, Input.domains['size'], 'medium');
                break;
            case 'style':
                this.userStyle = value;
                value = this.getStyle();
            default:
                super.set(key, value);
        }
    }

    getStyle()
    {
        var padding, userStyle, defaultStyle, finalStyle;
        userStyle = coalesce(this.userStyle, {});
        padding = 
            {
                'large': 10, 
                'larger': 10, 
                'medium': 10,
                'small': 10,
                'smaller': 10,
                'x-large': 10, 
                'x-small': 10, 
                'xx-large': 10, 
                'xx-small': 10, 
                'xxx-large': 10
            };
        defaultStyle =
            {
                font_size: this.size,
                border: styles['input_border'],
                border_radius: styles['input_radius'],
                padding: padding[have(this.size) ? this.size : 'medium'] + 'px'
            };
        finalStyle =
            {
                ...defaultStyle,
                ...userStyle
            };
        return finalStyle;
    }
}

class Server
{
    static defaults =
        {
            http_verb: 'post',
            async: true,
            api_endpoint: 0,
            method: '',
            parameters: {},
            callback: null,
            component_notification_on_error: null
        };
    
    static endpoints =
        [
            'index'
        ];

    static requests = [];

    static call(parameters)
    {
        var i, index, request, form_data, defaults;
        index = Page.nextSequence();
        defaults = Object.assign({}, Server.defaults);
        if (!have(parameters['component_notification_on_error']))
        {
            defaults.component_notification_on_error =
                new Component
                (
                    {
                        content: str.server['conection_failure']
                    }
                );
        }
        parameters = 
            {
                ...Server.defaults,
                ...parameters
            };
        request = new XMLHttpRequest();
        form_data = new FormData();
        request.open
        (
            parameters.http_verb, 
            Server.endpoints[parameters.api_endpoint], 
            parameters.async
        );
        request.onreadystatechange = 
            new Function
            (
                'Server.onready(' + index + ');'
            );
        for (i in parameters.parameters)
        {
            form_data.append
            (
                i, 
                parameters[i]
            );
        }
        Server.requests.push
        (
            {
                index: index,
                request: request
            }
        );
        request.send(form_data);
    }

    static onready(index)
    {
        var request;
        for (i in Server.requests)
        {
            if (Server.requests[i].index == index)
            {
                request = Server.requests[i].request;
                if (request.readyState === 4)
                {
                    if (request.status === 200) 
                    {
                        if (typeof request.callback == 'function')
                        {
                            request.callback(JSON.parse(request.responseText));
                        }
                    }
                    else
                    {
                        console.log('Server error. Request: ', request);
                        if (request.component_notification_on_error)
                        {
                            Notifier.send
                            (
                                request.component_notification_on_error
                            );
                        }
                    }
                    delete Server.requests[i];
                    break;
                }
            }
        }
    }

    static start()
    {
        str.server =
            {
                conection_failure: '#falha na conexão#'
            };
    }
}

class Svg extends Component
{
    static defaults =
    {
        node: 'svg',
        xmlns: 'http://www.w3.org/2000/svg'
    };

    constructor(parameters)
    {
        parameters = 
            {
                ...Svg.defaults,
                ...parameters
            };
        super(parameters);
    }
}

class Table extends Component
{
    static defaults =
        {
            attributes:
                {
                    cellspacing: 0,
                    cellpadding: 10,
                    border: 0
                },
            style: 
                {
                    border_collapse: 'collapse'
                },
            rows: []
        };

    constructor(parameters)
    {
        parameters =
            {
                ...Table.defaults,
                ...parameters,
                ...{node: 'table'}
            };
        super(parameters);
    }

    set(key, value)
    {
        var i, j, tr, td;
        switch (key)
        {
            case 'node':
                break;
            case 'rows':
                this.clear();
                for (i in value)
                {
                    tr = new Component({node: 'tr'});
                    for (j in value[i])
                    {
                        td =
                            new Component
                            (
                                {
                                    ...
                                        Format.isString(value[i][j]) ?
                                            {
                                                content: value[i][j],
                                                parse: this.parse
                                            }
                                        :
                                            value[i][j],
                                    ...
                                        {node: 'td'}
                                }
                            );
                        tr.append(td);
                    }
                    this.append(tr);
                }
                if (this.changedPosition())
                {
                    this.onposition();
                    this.updatePosition();
                    Component.repositionAll(this);
                }
                break;
            default:
                super.set(key, value);
        }
    }

    setRow(row, key, value)
    {
        this.components[row].set(key, value);
    }

    setCol(row, col, key, value)
    {
        this.components[row].components[col].set(key, value);
    }

    setCols(key, value)
    {
        var i, j;
        for (i in this.components)
        {
            for (j in this.components[i].components)
            {
                this.components[i].components[j].set(key, value);
            }
        }
    }
}

class Tabsheet extends Component
{
    static defaults =
        {
            break: false,
            disableds: [],
            gap: 10,
            items: [],
            text_color: '',
            background_color: '',
            text_color_highlight: '',
            background_color_highlight: '',
            trigger: null,
            active: null
        };

    static instances = [];

    break;

    disableds;

    last_active;

    active;

    gap;

    items;

    text_color;

    background_color;

    text_color_highlight;

    background_color_highlight;

    constructor(parameters)
    {
        var i, grid_template_columns;
        parameters =
            {
                ...Tabsheet.defaults,
                ...
                {
                    text_color: styles['text_color_normal'],
                    background_color: styles['background_color_normal'],
                    text_color_highlight: styles['text_color_highlight'],
                    background_color_highlight: styles['background_color_highlight'],
                    trigger: Tabsheet.trigger('color')
                },
                ...parameters
            };
        for (i in parameters.items)
        {
            grid_template_columns = 
                have(grid_template_columns) ? 
                    grid_template_columns + ' auto' 
                : 
                    'auto';
        }
        parameters.style =
            {
                ...coalesce(parameters.style),
                ...
                {
                    overflow: 'auto',
                    display: 'grid',
                    gap: parameters.gap + 'px',
                    grid_template_columns: grid_template_columns
                }
            };
        super();
        for (i in parameters)
        {
            this.set(i, parameters[i]);
        }
    }

    set(key, value)
    {
        var i, components, component;
        switch (key)
        {
            case 'items':
                this.clear();
                components = [];
                for (i in value)
                {
                    value[i].set('nickname', 'item_' + components.length);
                    value[i].element.addEventListener
                    (
                        'click', 
                        new Function
                        (
                            'Component.get(' + this.index + ').click(' + components.length + ');'
                        )
                    );
                    components.push(value[i]);
                }
                this[key] = components;
                this.set('components', components);
                this.last_active = null;
                this.active = null;
                break;
            case 'disableds':
                this[key] = value;
                for (i in value)
                {
                    component = this.getComponent('item_' + value[i]);
                    if (have(component))
                    {
                        component.setStyle('color', 'lightgray');
                    }
                }
                break;
            case 'active':
            case 'text_color':
            case 'background_color':
            case 'text_color_highlight':
            case 'background_color_highlight':
            case 'trigger':
                this[key] = value;
                this.setItem(value);
                break;
            case 'gap':
                this[key] = value;
                this.setStyle('gap', value);
                break;
            default:
                super.set(key, value);
        }
    }

    setItem(i)
    {
        var component;
        component = this.getComponent('item_' + i);
        if (have(component) || i === null)
        {
            this.last_active = this.active;
            this.active = 
                i === null ? 
                    null 
                : 
                    parseInt(i);
            if (typeof this.trigger == 'function')
            {
                this.trigger(this);
            }
        }
    }

    click(i)
    {
        if (!this.disableds.includes(i))
        {
            this.setItem(i);
        }
        if (have(this.items[i].onclick))
        {
            eval(this.items[i].onclick);
        }
    }

    static trigger(type)
    {
        var trigger;
        switch (type)
        {
            case 'border':
                trigger =
                    function()
                    {
                        var item;
                        item = this.getComponent('item_' + this.last_active);
                        if (have(item))
                        {
                            item.setStyle
                            (
                                'border_top_color', 
                                this.background_color
                            );
                        }
                        item = this.getComponent('item_' + this.active);
                        if (have(item))
                        {
                            item.setStyle
                            (
                                'border_top_color',
                                this.background_color_highlight
                            );
                        }
                    };
                return trigger;
            case 'check':
                trigger =
                    function()
                    {
                        var item;
                        item = this.getComponent('item_' + this.last_active);
                        if (have(item))
                        {
                            item.setStyle
                            (
                                'background_color',
                                this.background_color
                            );
                            item.setStyle
                            (
                                'color',
                                this.text_color
                            );
                            item = item.getComponent('check');
                            item.setStyle
                            (
                                'background_color',
                                this.background_color
                            );
                            item.setStyle
                            (
                                'border_color',
                                this.text_color
                            );
                        }
                        item = this.getComponent('item_' + this.active);
                        if (have(item))
                        {
                            item.setStyle
                            (
                                'background_color',
                                this.background_color_highlight
                            );
                            item.setStyle
                            (
                                'color',
                                this.text_color_highlight
                            );
                            item = item.getComponent('check');
                            item.setStyle
                            (
                                'background_color', 
                                this.text_color_highlight
                            );
                            item.setStyle
                            (
                                'border_color',
                                '#ffffff'
                            );
                        }
                    };
                return trigger;
            case 'color':
                trigger =
                    function()
                    {
                        var item;
                        item = this.getComponent('item_' + this.last_active);
                        if (have(item))
                        {
                            item.setStyle
                            (
                                'background_color', 
                                this.background_color
                            );
                            item.setStyle
                            (
                                'color',
                                this.text_color
                            );
                        }
                        item = this.getComponent('item_' + this.active);
                        if (have(item))
                        {
                            item.setStyle
                            (
                                'background_color', 
                                this.background_color_highlight
                            );
                            item.setStyle
                            (
                                'color',
                                this.text_color_highlight
                            );
                        }
                    };
                return trigger;
            default:
                error
                (
                    'Invalid trigger type: Valids: border, check, color.',
                    'Tabsheet', 
                    'trigger', 
                    type 
                );
        }
    }

    static item(type, parameters = {})
    {
        var item, defaults;
        switch (type)
        {
            case 'border':
                defaults = 
                    {
                        text: '',
                        components: null,
                        icon: null,
                        padding: 10,
                        onclick: null,
                        text_color: styles['text_color_normal'],
                        text_color_highlight: styles['text_color_highlight'],
                        background_color: styles['background_color_normal']
                    };
                parameters =
                    {
                        ...defaults,
                        ...parameters
                    }
                item = 
                    new Component
                    (
                        {
                            content: parameters.text,
                            components: parameters.components,
                            style: {display: 'inline-block'}
                        }
                    );
                if (parameters.icon)
                {
                    parameters.icon.set('nickname', 'icon');
                    parameters.icon.setStyle('margin_right', parameters.padding + 'px');
                    parameters.icon.setStyle('color', parameters.text_color_highlight);
                    item =
                        new Component
                        (
                            {
                                components:
                                [
                                    parameters.icon,
                                    item
                                ]
                            }
                        );
                }
                item.setStyle('display', 'flex');
                item.setStyle('align_items', 'center');
                item.setStyle('padding', '5px 15px');
                item.setStyle('user_select', 'none');
                item.setStyle('cursor', 'pointer');
                item.setStyle('border_radius', '3px');
                item.setStyle('background_color', parameters.background_color);
                item.setStyle('color', parameters.text_color);
                item.setStyle('border_top', 'solid 5px ' + parameters.background_color);
                if (have(parameters.onclick))
                {
                    item.setAttribute('onclick', parameters.onclick);
                }
                return item;
            case 'check':
                defaults = 
                    {
                        text: '',
                        components: null,
                        padding: 10,
                        check_size: 24,
                        onclick: null,
                        text_color: styles['text_color_normal'],
                        text_color_highlight: styles['text_color_highlight'],
                        background_color: styles['background_color_normal']
                    };
                parameters =
                    {
                        ...defaults,
                        ...parameters
                    }
                item = 
                    new Component
                    (
                        {
                            style:
                            {
                                display: 'flex',
                                align_items: 'center',
                                padding: '5px 15px',
                                user_select: 'none',
                                cursor: 'pointer',
                                border_radius: '3px',
                                background_color: parameters.background_color,
                                color: parameters.text_color
                            },
                            components:
                            [
                                new Component
                                (
                                    {
                                        nickname: 'check',
                                        style:
                                            {
                                                margin_right: parameters.padding + 'px',
                                                box_sizing: 'border-box',
                                                height: parameters.check_size + 'px',
                                                width: parameters.check_size + 'px',
                                                min_height: parameters.check_size + 'px',
                                                min_width: parameters.check_size + 'px',
                                                border_radius: (parameters.check_size / 2) + 'px',
                                                border: 'solid 1px ' + parameters.text_color,
                                            }
                                    }
                                ),
                                new Component
                                (
                                    {
                                        nickname: 'text',
                                        content: parameters.text,
                                        components: parameters.components,
                                        style: 
                                        {
                                            display: 'inline-block'
                                        }
                                    }
                                )
                            ]
                        }
                    );
                if (have(parameters.onclick))
                {
                    item.setAttribute('onclick', parameters.onclick);
                }
                return item;
            case 'color':
                defaults = 
                    {
                        text: '',
                        components: null,
                        icon: '',
                        padding: 10,
                        onclick: null,
                        text_color: styles['text_color_normal'],
                        text_color_highlight: styles['text_color_highlight'],
                        background_color: styles['background_color_normal']
                    };
                parameters =
                    {
                        ...defaults,
                        ...parameters
                    }
                item = 
                    new Component
                    (
                        {
                            content: parameters.text,
                            components: parameters.components,
                            style: {display: 'inline-block'}
                        }
                    );
                if (have(parameters.icon))
                {
                    parameters.icon.set('nickname', 'icon');
                    parameters.icon.setStyle('margin_right', parameters.padding + 'px');
                    parameters.icon.setStyle('color', parameters.text_color_highlight);
                    item =
                        new Component
                        (
                            {
                                components:
                                [
                                    parameters.icon,
                                    item
                                ]
                            }
                        );
                }
                item.setStyle('display', 'flex');
                item.setStyle('align_items', 'center');
                item.setStyle('padding', '5px 15px');
                item.setStyle('user_select', 'none');
                item.setStyle('cursor', 'pointer');
                item.setStyle('border_radius', '3px');
                item.setStyle('background_color', parameters.background_color);
                item.setStyle('color', parameters.text_color);
                if (have(parameters.onclick))
                {
                    item.setAttribute('onclick', parameters.onclick);
                }
                return item;
            default:
                error
                (
                    'Invalid item type. Valids: border, check, color.',
                    'Tabsheet', 
                    'item', 
                    type
                );
        }
    }
}

class Textarea extends Component
{
    static defaults =
        {
            size: 'medium'
        };

    static domains =
        {
            size: ['large', 'larger', 'medium', 'small', 'smaller', 'x-large', 'x-small', 'xx-large', 'xx-small', 'xxx-large']
        };

    userStyle;

    constructor(parameters)
    {
        parameters = 
            {
                ...Input.defaults,
                ...parameters,
                ...{node: 'textarea'}
            };
        super(parameters);
    }

    set (key, value)
    {
        switch (key)
        {
            case 'size':
                this[key] = Format.validValue(value, Input.domains['size'], 'medium');
                break;
            case 'style':
                this.userStyle = value;
                value = this.getStyle();
            default:
                super.set(key, value);
        }
    }

    getStyle()
    {
        var padding, userStyle, defaultStyle, finalStyle;
        userStyle = coalesce(this.userStyle, {});
        padding = 
            {
                'large': 10, 
                'larger': 10, 
                'medium': 10,
                'small': 10,
                'smaller': 10,
                'x-large': 10, 
                'x-small': 10, 
                'xx-large': 10, 
                'xx-small': 10, 
                'xxx-large': 10
            };
        defaultStyle =
            {
                font_size: this.size,
                border: styles['input_border'],
                border_radius: styles['input_radius'],
                padding: padding[this.size] + 'px',
                height: '300px',
                width: '100%',
                box_sizing: 'border-box'
            };
        finalStyle =
            {
                ...defaultStyle,
                ...userStyle
            };
        return finalStyle;
    }
}

class Video extends Component
{
    static defaults =
        {
            error_message: '',
            sources_by_type: {}
        };

    error_message = '';

    constructor(parameters)
    {
        var i;
        parameters =
            {
                ...Video.defaults,
                ...{error_message: str.video.error_message},
                ...parameters
            };
        for (i in parameters)
        {
            this.set(i, parameters[i]);
        }
    }

    set(key, value)
    {
        var i, j;
        switch (key)
        {
            case 'error_message':
                this.error_message = value;
                break;
            case 'sources_by_type':
                super.set('content', this.error_message);
                j = 0;
                for (i in value)
                {
                    this.append
                    (
                        new Component
                        (
                            {
                                nickname: 'source_' + (++j),
                                node: 'source',
                                attributes:
                                {
                                    type: i,
                                    src: value[i]
                                }
                            }
                        )
                    );
                }
                break;
            default:
                super.set(i, value);
        }
    }

    start()
    {
        str.video =
            {
                error_message: 'Your browser does not support the video tag.'
            };
    }
}

class Page
{
    static head;

    static body;

    static sequence = 0;

    static styles =
        {
            text_color_normal: '#5d6688',
            background_color_normal: '#eff0f4',
            text_color_highlight: '#e35150',
            background_color_highlight: '#fdeeee',
            text_color_discreet: '#888888',
            background_color_discreet: '#eeeeee',
            background_color_title: '#dfe1e8',
            button_primary_color: '#ffffff',
            button_primary_bgcolor: '#e35150',
            button_secondary_color: '#5d6688',
            button_secondary_bgcolor: '#e2e3e7',
            button_success_color: '#ffffff',
            button_success_bgcolor: '#28a745',
            button_danger_color: '#ffffff',
            button_danger_bgcolor: '#dc3545',
            button_warning_color: '#ffffff',
            button_warning_bgcolor: '#ffc107',
            button_info_color: '#ffffff',
            button_info_bgcolor: '#17a2b8',
            button_light_color: '#21253e',
            button_light_bgcolor: '#efefef',
            button_dark_color: '#ffffff',
            button_dark_bgcolor: '#343a40',
            button_link_color: '#007bff',
            button_link_bgcolor: '#ffffff',
            outline: 'solid 1px #c7c7c7',
            input_border: 'solid 1px #e2e3e7',
            input_radius: '3px'
        };

    static img =
        {
        };

    static font =
        {
        };

    static layers = 
        [
            'default', 
            'window', 
            'notification', 
            'menu', 
            'tips'
        ];

    static start()
    {
        window.styles = Object.assign({}, Page.styles);
        window.str = Object.assign({}, Page.str);
        window.img = Object.assign({}, Page.img);
        window.font = Object.assign({}, Page.font);
        window.error = 
            function(msg, className = '', method = '', parameters = '')
            {
                if (method)
                {
                    console.log('Error calling ' + (className ? className + '.' : '') + method + '():', parameters);
                }
                throw msg;
            };
        window.load = 
            function(file, async = false)
            {
                var script, parameters;
                parameters =
                    {
                        node: 'script',
                        attributes:
                            {
                                src: file
                            }
                    };
                if (async)
                {
                    parameters.attributes['async'] = true;
                }
                script = new Component(parameters);
                Page.head.append(script);
            };

        window.isset = 
            function()
            {
                var i;
                for (var i in arguments)
                {
                    if (typeof arguments[i] == 'undefined')
                    {
                        return false;
                    }
                }
                return true;
            };

        window.have = 
            function()
            {
                var i;
                for (i in arguments)
                {
                    if (Array.isArray(arguments[i]))
                    {
                        if (!arguments[i].length)
                        {
                            return false;
                        }
                    }
                    else 
                    {
                        if 
                        (
                            typeof arguments[i] == 'object' 
                            && 
                            arguments[i] 
                            && 
                            arguments[i].constructor === Object
                        )
                        {
                            if (!have(Object.keys(arguments[i])))
                            {
                                return false;
                            }
                        }
                        else
                        {
                            if (typeof arguments[i] == 'undefined' || !arguments[i])
                            {
                                return false;
                            }
                        }
                    }
                }
                return true;
            };

        window.coalesce =
            function()
            {
                var i;
                for (i in arguments)
                {
                    if 
                    (
                        typeof arguments[i] != 'undefined' 
                        && 
                        arguments[i] !== null
                    )
                    {
                        return arguments[i];
                    }
                }
                return null;
            };

        Page.head =
            new Component
            (
                {
                    node: 'head',
                    components:
                        [
                            new Component
                            (
                                {
                                    node: 'meta',
                                    attributes:
                                        {
                                            name: 'viewport',
                                            content: 'width=device-width, initial-scale=1.0'
                                        }
                                }
                            ),
                            new Component
                            (
                                {
                                    node: 'link',
                                    attributes:
                                        {
                                            rel: 'icon', 
                                            type: 'image/x-icon',
                                            href: './img/favicon.ico'
                                        }
                                }
                            )
                        ]
                }
            );
        Page.body = 
            new Component
            (
                {
                    node: 'body',
                    style:
                        {
                            padding: 0,
                            margin: 0,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            overflow: 'auto',
                            color: '#555',
                            font_family: 'sans-serif'
                        }
                }
            );
        Audio.start();
        Component.start();
        Datatable.start();
        File.start();
        Icon.start();
        Keys.start();
        Menu.start();
        Notifier.start();
        Server.start();
        load('js/dinamic.js');
    }

    static nextSequence()
    {
        return ++this.sequence;
    }

    static onresize()
    {

    }

    static getZindex(type)
    {
        var i;
        for (i in this.layers)
        {
            if (this.layers[i] == type)
            {
                return parseInt(i);
            }
        }
    }
}

Page.start();