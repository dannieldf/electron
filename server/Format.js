class Format
{
    static ucfirst(texto)
    {
        texto = 
            texto.charAt(0).toUpperCase()
            + 
            texto.slice(1).toLowerCase()
        return texto
    }
}
module.exports = Format