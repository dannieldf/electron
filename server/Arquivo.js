class Arquivo
{

    static salvar()
    {
        var sql
        sql = 
            `
            insert into arquivo
            (
                nome,
                tipo,
                conteudo,
                tamanho,
                hash
            )
            values
            (
                
            )
            `
    }

    static apagar()
    {

    }

    static substituir()
    {

    }
}

exports.module = Arquivo