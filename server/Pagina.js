class Pagina
{
    static getHtml(escopo = null)
    {
        //var fs, html, root, index
        var fs, html, root, index, script_original, script_novo
        fs = require('fs')
        root = __dirname + '/../'
        html = fs.readFileSync(root + 'index.html', 'utf8')
        /*
        if (escopo)
        {
            index = html.indexOf('<script')
            html = 
                html.substring(0, index) +
                '<script>' + 
                    'var escopo = ' + JSON.stringify(escopo) +
                '</script>' +
                html.substring(index)
        }
        */
        script_original = '<script src="js/app.js" defer></script>'
        script_novo = 
            (
                escopo ?
                    '<script>' + 
                        'var escopo = ' + JSON.stringify(escopo) +
                    '</script>'
                :
                    ''
            ) +
            '<script src="/js/app.js" defer></script>'
        html = html.replace(script_original, script_novo)
        return html
    }
}
module.exports = Pagina