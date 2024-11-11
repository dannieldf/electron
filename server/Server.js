class Server
{
    static multer = require('multer')
    static path = require('path')
    static express = require('express')
    static app = Server.express()
    static metodos = {}
    static upload = 
        Server.multer
        (
            {
                dest: 'uploads',
                limits: {fileSize: app.max_tamanho_arquivo}
            }
        )
    static pastas_publicas =
        [
            'js',
            'img',
            'audio',
            'video',
            'docs',
            'fonts'
        ]

    static getUsuario(req)
    {
        const sent_cookies = cookies.get(req)
        const usuario = session.validate(sent_cookies)
        return [usuario, sent_cookies]
    }

    static async home(req, res)
    {
        const [usuario, sent_cookies] = Server.getUsuario(req)
        const metodo_default = 'Pagina.home'
        const metodo =
            (
                usuario ?
                    await config.get
                    (
                        'metodo_inicial', 
                        metodo_default, 
                        usuario.id
                    )
                :
                    metodo_default
            )
            .split('.')
        await Server.processaUrl
        (
            metodo[0],
            metodo[1],
            {},
            usuario,
            sent_cookies,
            req,
            res
        )
    }

    static async get(req, res)
    {
        const [usuario, sent_cookies] = Server.getUsuario(req)
        await Server.processaUrl
        (
            req.params[0],
            req.params[1],
            req.query,
            usuario,
            sent_cookies,
            req,
            res
        )
    }

    static async processaUrl(classe, metodo, parametros, usuario, sent_cookies, req, res)
    {
        try 
        {
            const dados_metodo = Server.metodos[classe + '.' + metodo]
            if (dados_metodo.ajax)
            {
                throw new Error('Incompatibilidade ajax')
            }
            switch (dados_metodo.acessibilidade)
            {
                case 'C':
                    if (!usuario)
                    {
                        //redirecionar para tela de login
                    }
                    break
                case 'D':
                    if (usuario)
                    {
                        //matar sessão
                        session.exclui(usuario.session)
                        usuario = null
                    }
                    break
                case 'N':
                    // direcionar para pagina de erro
                    return
            }
            const root = __dirname + '/../'
            const user_class = require(root + 'server/' + classe)
            sent_cookies = cookies.revalidate(sent_cookies)
            const payload =
                {
                    callback:
                    {
                        script: 'default',
                        method: classe + '.' + metodo,
                        argument:
                            usuario ?
                                await user_class[metodo]
                                (
                                    parametros, 
                                    usuario, 
                                    null, 
                                    req, 
                                    res
                                )
                            :
                                parametros
                    },
                    user: usuario,
                    versao_desktop: app.versao_desktop,
                    instituicao: app.instituicao,
                    servidor_app: app.servidor_app,
                    servidor_bd: app.servidor_bd,
                    timeout: session.getTimeout(sent_cookies ? sent_cookies.remember : false),
                    title: titulo
                }
            const html = pagina.getHtml(payload)
            res.setHeader('Content-Type', 'text/html')
            res.statusCode = 200
            res.end(html)
        }
        catch (error) 
        {
            console.log(error)
            Server.errorPage(res, usuario)
        }
    }

    static async ajax(req, res)
    {
        try
        {
            const chamada = req.params.classe + '.' + req.params.metodo
            const metodo = Server.metodos[chamada]
            if (!metodo)
            {
                throw new Error(`O metodo chamado ${chamada} deve estar registrado na tabela METODO`)
            }
            if (!metodo.ajax)
            {
                throw new Error('Incompatibilidade ajax')
            }
            const [usuario, sent_cookies] = Server.getUsuario(req)
            switch (metodo.acessibilidade)
            {
                case 'C':
                    if (!usuario)
                    {
                        //redirecionar para tela de login
                    }
                    break
                case 'D':
                    if (usuario)
                    {
                        //matar sessão
                        session.exclui(usuario.session)
                        usuario = null
                    }
                    break
                case 'N':
                    // direcionar para pagina de erro
                    return
            }
            const root = __dirname + '/../'
            const user_class = require(root + 'server/' + req.params.classe)
            const fields = req.body
            const files = 
                req.files ?
                    await Promise.all
                    (
                        req.files.map
                        (
                            function(file)
                            {
                                delete fields[file.fieldname]
                                console.log('Campo do arquivo: ' + file.fieldname)
                                return file
                                //const filePath = Server.path.join(__dirname, '../' + file.path)
                                //const content = fs.readFileSync(filePath)
                                //const mimeType = file.mimetype
                                //const name = file.originalname
                                //const size = file.size
                                //return {name, mimeType, size, content: content.toString('base64')}
                            }
                        )
                    )
                :
                    []
            const payload = 
                await user_class[req.params.metodo]
                (
                    fields,
                    usuario,
                    files,
                    req,
                    res,
                    sent_cookies
                )
            res.json(payload)
        }
        catch (error)
        {
            console.log(error)
            res.status(400)
            res.json({})
        }
    }

    static errorPage(res, usuario)
    {
        var escopo, html
        escopo = 
            {
                callabck: {script: 'error'},
                usuario: usuario
            }
        html = pagina.getHtml(escopo)
        res.send(html)
    }

    static getUrl(metodo = '', parametros = null)
    {
        var i, classe, separador, url, porta
        porta = this.https ? 443 : 80
        porta = this.port != porta ? ':' + this.port : ''
        url = this.https ? 'https://' : 'http://'
        url += 'www' + this.hostname
        url += porta
        if (metodo)
        {
            [classe, metodo] = metodo.split('.')
            url += '/' + classe + '/' + metodo
            if (parametros)
            {
                url += '/'
                separador = '?'
                for (i in parametros)
                {
                    url += separador + i + '=' + parametros[i]
                    separador = '&'
                }
            }
        }
        url = encodeURI(url)
        return url
    }

    static async start()
    {
        var i, sql, consulta
        sql =
            `
            select
                classe || '.' || metodo as metodo,
                acessibilidade,
                ajax
            from metodo
            `
        consulta = await db.query(sql)
        for (i of consulta.rows)
        {
            this.metodos[i.metodo] = 
                {
                    acessibilidade: i.acessibilidade,
                    ajax: i.ajax
                }
        }
        Server.app.use
        (
            Server.express.urlencoded
            (
                {extended: true}
            )
        )
        Server.app.use
        (
            Server.express.json()
        )
        for (i of Server.pastas_publicas)
        {
            Server.app.use
            (
                '/' + i,
                Server.express.static(i)
            )
        }
        Server.app.get
        (
            '/',
            Server.home
        )
        Server.app.get
        (
            '/:classe/:metodo', 
            Server.get
        )
        Server.app.post
        (
            '/:classe/:metodo', 
            Server.upload.array('files', app.max_arquivos_upload), 
            Server.ajax
        )
        Server.app.listen
        (
            app.port, 
            function()
            {
                console.log('Servidor rodando na porta ' + app.port)
            }
        )
    }
}
/*
class Server
{
    static https = false
    static hostname = '127.0.0.1'
    static port = 8080
    static listener = null
    static open_folders = ['js', 'img', 'audio', 'video', 'fonts']
    static errors =
        {
            undefined: {}, // tem que ser o primeiro para gerar codigo zero
            url_module_not_found: {},
            payload_post_invalid: {}
        }
    static metodos = {}

    static async processRequest(request, response)
    {
        var url, root, url_parse, call, resource, method, usuario, sent_cookies
        url = require('url')
        root = __dirname + '/../'
        url_parse = url.parse(request.url, true)
        if (url_parse.pathname == '/favicon.ico')
        {
            url_parse.pathname = '/img/favicon.ico'
        }
        call = 
            url_parse.pathname.replace
            (
                /^\/+|\/+$/gm, 
                ''
            )
            .split('/')
        sent_cookies = cookies.get(request)
        usuario = session.validate(sent_cookies)
        if (url_parse.pathname == '/')
        {
            console.log(url_parse.pathname + ' (raiz)')
            console.log('Usuario ' + (usuario && Object.keys(usuario).length ? 'SIM' : 'NAO'))
            method = 'Pagina.home'
            method =
                (
                    usuario ?
                        await config.get
                        (
                            'metodo_inicial', 
                            method, 
                            usuario.id
                        )
                    :
                        method
                )
                .split('.')
            Server.processaMetodo
            (
                method[0], 
                method[1],
                usuario,
                sent_cookies,
                request, 
                response,
                url_parse
            )
        }
        else if (Server.validResource(call))
        {
            //console.log(url_parse.pathname + ' (recurso aberto)')
            resource = root + call[call.length - 2] + '/' + call[call.length - 1] 
            response.setHeader
            (
                'Content-Type', 
                files.mime(resource)
            )
            response.statusCode = 200
            fs.readFile
            (
                resource, 
                function(error, data)
                {
                    response.end(data)
                }
            )
        }
        else if (call.length == 2)
        {
            console.log(url_parse.pathname + ' (metodo)')
            //console.log('Cookies ' + (sent_cookies && Object.keys(sent_cookies).length ? 'SIM' : 'NAO'))
            console.log('Usuario ' + (usuario && Object.keys(usuario).length ? 'SIM' : 'NAO'))
            Server.processaMetodo
            (
                call[0], 
                call[1],
                usuario, 
                sent_cookies,
                request, 
                response,
                url_parse
            )
        }
        else
        {
            //console.log(url_parse.pathname + ' (chamada invalida)')
            server.errorPage(false, request, response, usuario, url_parse)
        }
    }

    static async processaMetodo
    (
        class_name, 
        method_name,
        usuario, 
        sent_cookies,
        request, 
        response,
        url_parse
    )
    {
        //console.log('usuario', usuario)
        var metodo, ajax, payload, user_class, root, html, escopo
        root = __dirname + '/../'
        ajax = request.method.toLowerCase() == 'post'
        try 
        {
            metodo = Server.metodos[class_name + '.' + method_name]
            if (!metodo)
            {
                throw new Error(`O metodo chamado ${class_name + '.' + method_name} deve estar registrado na tabela METODO`)
            }
            if 
            (
                (metodo.ajax && !ajax)
                || 
                (!metodo.ajax && ajax)
            )
            {
                throw new Error('Incompatibilidade ajax')
            }
            switch (metodo.acessibilidade)
            {
                case 'C':
                    if (!usuario)
                    {
                        //redirecionar para tela de login
                    }
                    break
                case 'D':
                    if (usuario)
                    {
                        //matar sessão
                        session.exclui(usuario.session)
                        usuario = null
                    }
                    break
                case 'N':
                    // direcionar para pagina de erro
                    return
            }
            user_class = require(root + 'server/' + class_name)
            sent_cookies = cookies.revalidate(sent_cookies)
            if (ajax)
            {
                const form =
                    new formidable.IncomingForm
                    (
                        {
                            multiples: true, 
                            allowEmptyFiles: true, 
                            minFileSize: 0
                        }
                    )
                form.parse
                (
                    request, 
                    async function(error, fields, files)
                    {
                        if (error) 
                        {
                            Server.error
                            (
                                'payload_post_invalid', 
                                {
                                    request_mode: 'ajax',
                                    request_module: class_name + '.' + method_name,
                                    request_data: request
                                },
                                error
                            )
                        }
                        try 
                        {
                            fields = fields ? JSON.parse(fields.p[0]) : {}
                        }
                        catch (error)
                        {
                            Server.error
                            (
                                'payload_post_invalid', 
                                {
                                    request_mode: 'ajax',
                                    request_module: class_name + '.' + method_name,
                                    request_data: request
                                },
                                error
                            )
                        }
                        //console.log(`${class_name}.${method_name}()`, usuario)
                        payload = 
                            await user_class[method_name]
                            (
                                fields, 
                                usuario, 
                                files, 
                                request, 
                                response
                            )
                        response.setHeader('Content-Type', 'application/json')
                        response.statusCode = 200
                        response.end(JSON.stringify(payload))
                    }
                )
            }
            else
            {
                payload =
                    {
                        callback:
                        {
                            script: 'default',
                            method: class_name + '.' + method_name,
                            argument:
                                usuario ?
                                    await user_class[method_name]
                                    (
                                        url_parse.query, 
                                        usuario, 
                                        null, 
                                        request, 
                                        response
                                    )
                                :
                                    url_parse.query
                        },
                        user: usuario,
                        versao_desktop: app.versao_desktop,
                        instituicao: app.instituicao,
                        servidor_app: app.servidor_app,
                        servidor_bd: app.servidor_bd,
                        timeout: session.getTimeout(sent_cookies ? sent_cookies.remember : false),
                        title: titulo
                    }
                html = pagina.getHtml(payload)
                response.setHeader('Content-Type', 'text/html')
                response.statusCode = 200
                response.end(html)
            }
        }
        catch (error) 
        {
            server.errorPage(ajax, request, response, usuario, url_parse)
        }
    }

    static errorPage(ajax, request, response, usuario, url_parse)
    {
        var escopo, html
        if (ajax)
        {
            response.statusCode = 400
            response.end()
        }
        else
        {
            escopo = {callabck: {script: 'error'}, usuario: usuario}
            html = pagina.getHtml(escopo)
            response.setHeader('Content-Type', 'text/html')
            response.statusCode = 200
            response.end(html)
        }
        Server.error
        (
            'url_module_not_found',
            {
                request_mode: request.method.toLowerCase(),
                request_path: url_parse.pathname
            },
            ''
        )
    }

    static error(error_type, parameters, error)
    {
        console.log('Lançado erro do tipo "' + error_type + '"', error)
    }

    static validResource(call)
    {
        var i, root, path, arquivos, arquivo
        call = call.slice()
        if (call.length < 2)
        {
            return false
        }
        path = call.shift()
        if (!Server.open_folders.includes(path))
        {
            return false
        }
        root = __dirname + '/../'
        arquivos = files.listar(root + path)
        arquivo = call.join('/')
        return arquivos.includes(arquivo)
    }

    static getUrl(metodo = '', parametros = null)
    {
        var i, classe, separador, url, porta
        porta = this.https ? 443 : 80
        porta = this.port != porta ? ':' + this.port : ''
        url = this.https ? 'https://' : 'http://'
        url += 'www' + this.hostname
        url += porta
        if (metodo)
        {
            [classe, metodo] = metodo.split('.')
            url += '/' + classe + '/' + metodo
            if (parametros)
            {
                url += '/'
                separador = '?'
                for (i in parametros)
                {
                    url += separador + i + '=' + parametros[i]
                    separador = '&'
                }
            }
        }
        url = encodeURI(url)
        return url
    }
    
    static async start()
    {
        var i, sql, consulta
        const {createServer} = require('node:http')
        this.listener = createServer(this.processRequest)
        this.listener.listen
        (
            this.port, 
            this.hostname,
            function()
            {
                console.log('Servidor rodando em http://' + Server.hostname + ':' + Server.port)
            }
        )
        sql =
            `
            select
                classe || '.' || metodo as metodo,
                acessibilidade,
                ajax
            from metodo
            `
        consulta = await db.query(sql)
        for (i of consulta.rows)
        {
            this.metodos[i.metodo] = 
                {
                    acessibilidade: i.acessibilidade,
                    ajax: i.ajax
                }
        }
    }
}
*/

module.exports = Server;