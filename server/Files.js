class Files
{
    static fs = require('fs')
    
    static listar(path, arquivos = []) 
    {
        var i, lista, stat
        lista = Files.fs.readdirSync(path)
        for (i in lista)
        {
            stat = Files.fs.statSync(path + '/' + lista[i])
            if (stat.isDirectory())
            {
                Files.listar(path + '/' + lista[i], arquivos)
            }
            else
            {
                arquivos.push(lista[i])
            }
        }
        return arquivos
    }

    static mime(path)
    {
        var mime = require('mime-types')
        return mime.lookup(path)
    }
}
module.exports = Files