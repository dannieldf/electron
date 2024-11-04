class Pagina
{
    static getHtml(escopo = null)
    {
        var html, root, script_original, script_novo
        root = __dirname + '/../'
        html = fs.readFileSync(root + 'index.html', 'utf8')
        script_original = '<script src="js/app.js" defer></script>'
        script_novo = 
            (
                escopo ?
                    '<script>' + 
                        'var escopo = ' + 
                        JSON.stringify(escopo) +
                    '</script>'
                :
                    ''
            ) +
            '<script src="/js/app.js" defer></script>'
        html = html.replace(script_original, script_novo)
        return html
    }

    static async home()
    {
        const [class_name, method_name] = metodo_inicial.split('.')
        const user_class = require('./' + class_name)
        return await user_class[method_name]()
    }
}
module.exports = Pagina