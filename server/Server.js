class Server
{
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
    
    static create()
    {
        const {createServer} = require('node:http')
        this.listener = 
            createServer
            (
                function(request, response)
                {
                    var url, fs, root, url_parse, parameters, call, ajax, resource, pagina, escopo, html, files, user_class, class_name, method_name, payload
                    url = require('url')
                    fs = require('fs')
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
                    ajax = request.method.toLowerCase() == 'post'
                    if (url_parse.pathname == '/')
                    {
                        console.log(url_parse.pathname + ' (raiz)')
                        pagina = require(root + 'server/Pagina')
                        response.setHeader('Content-Type', 'text/html')
                        response.statusCode = 200
                        response.end
                        (
                            pagina.getHtml
                            (
                                {script: 'default'}
                            )
                        )
                    }
                    else if (Server.validResource(call))
                    {
                        console.log(url_parse.pathname + ' (recurso aberto)')
                        files = require(root + 'server/Files')
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
                        class_name = call[0]
                        method_name = call[1]
                        try 
                        {
                            user_class = require(root + 'server/' + class_name)
                            if (ajax) 
                            {
                                const formidable = require('formidable')
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
                                    function(error, fields, files)
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
                                        payload = user_class[method_name](fields, files)
                                        response.setHeader('Content-Type', 'application/json')
                                        response.statusCode = 200
                                        response.end(JSON.stringify(payload))
                                    }
                                )
                            }
                            else
                            {
                                parameters = url_parse.query
                                payload = 
                                {
                                    method: class_name + '.' + method_name,
                                    argument: user_class[method_name](parameters)
                                }
                                if (typeof payload.script == 'undefined')
                                {
                                    payload.script = 'default'
                                }
                                pagina = require(root + 'server/Pagina')
                                html = pagina.getHtml(payload)
                                response.setHeader('Content-Type', 'text/html')
                                response.statusCode = 200
                                response.end(html)
                            }
                        }
                        catch (error) 
                        {
                            if (ajax)
                            {
                                response.statusCode = 400
                                response.end()
                            }
                            else
                            {
                                escopo = {script: 'error'}
                                pagina = require(root + 'server/Pagina')
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
                                    request_path: url_parse.pathname,
                                    request_parameters: parameters
                                },
                                error
                            )
                        }
                    }
                    else
                    {
                        console.log(url_parse.pathname + ' (chamada invalida)')
                        escopo = {script: 'error'}
                        pagina = require(root + 'server/Pagina')
                        html = pagina.getHtml(escopo)
                        response.setHeader('Content-Type', 'text/html')
                        response.statusCode = 200
                        response.end(html)
                        Server.error
                        (
                            'url_module_not_found',
                            {
                                request_mode: request.method.toLowerCase(),
                                request_path: url_parse.pathname,
                                request_parameters: parameters
                            },
                            {}
                        )
                    }
                }
            )
        this.listener.listen
        (
            this.port, 
            this.hostname,
            function()
            {
                console.log('Servidor rodando em http://' + Server.hostname + ':' + Server.port)
            }
        )
    }

    static error(error_type, parameters, error)
    {
        console.log('Lançado erro do tipo "' + error_type + '"', error)
    }

    static validResource(call)
    {
        var i, files, root, path, arquivos, arquivo
        call = call.slice()
        root = __dirname + '/../'
        if (call.length < 2)
        {
            return false
        }
        path = call.shift()
        if (!Server.open_folders.includes(path))
        {
            return false
        }
        files = require(root + 'server/Files')
        arquivos = files.listar(root + path)
        arquivo = call.join('/')
        return arquivos.includes(arquivo)
    }
}

module.exports = Server;