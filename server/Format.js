class Format
{
    static bcrypt = require('bcryptjs')

    static ucfirst(texto)
    {
        texto = 
            texto.charAt(0).toUpperCase()
            + 
            texto.slice(1).toLowerCase()
        return texto
    }

    static valor(valor)
    {
        var separado
        separado = valor.split('.')
        valor = 
            (
                separado[0] ? 
                    separado[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                :
                    '0'
            ) + 
            ',' +
            (
                separado.length == 2 ? 
                    separado[1].padEnd(2, '0')
                :
                    '00'
            );
        return 'R$ ' + valor
    }

    static clearMask(valor)
    {
        return valor.replace(/[^\d,]/g, '')
    }
    
    static cpf(cpf)
    {
        return cpf ? cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : ''
    }

    static cnpj(cnpj)
    {
        return cnpj ? cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : ''
    }

    static validaCpf(cpf)
    {
        var i, soma, resto;
        soma = 0
        for (i = 1; i <= 9; i++)
        {
            soma += parseInt(cpf.substring(i - 1, i)) * (11 - i)
        }
        resto = (soma * 10) % 11
        if (resto == 10 || resto == 11) 
        {
            resto = 0
        }
        if (resto != parseInt(cpf.substring(9, 10))) 
        {
            return false
        }
        soma = 0
        for (i = 1; i <= 10; i++)
        {
            soma += parseInt(cpf.substring(i - 1, i)) * (12 - i)
        }
        resto = (soma * 10) % 11
        if (resto == 10 || resto == 11)
        {
            resto = 0
        }
        if (resto != parseInt(cpf.substring(10, 11))) 
        {
            return false
        }
        return true
    }

    static validaCnpj(cnpj)
    {
        var i, b, n
        b = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        if (cnpj.length !== 14)
        {
            return false
        }
        for (i = 0, n = 0; i < 12; n += cnpj[i] * b[++i]);
        if (cnpj[12] != (((n %= 11) < 2) ? 0 : 11 - n))
        {
            return false
        }
        for (i = 0, n = 0; i <= 12; n += cnpj[i] * b[i++]);
        if (cnpj[13] != (((n %= 11) < 2) ? 0 : 11 - n))
        {
            return false
        }
        return true
    }
    
    static validaEmail(email) 
    {
        var regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        return regex.test(email)
    }

    static bcryptEncode(text)
    {
        var rounds, salt, hash
        rounds = typeof app.bcrypt_salt_rounds == 'undefined' ? 10 : app.bcrypt_salt_rounds
        salt = this.bcrypt.genSaltSync(rounds)
        hash = this.bcrypt.hashSync(`${data} ${text}`, salt)
        return hash
    }

    static bcryptDecode(text, hash)
    {
        return this.bcrypt.compareSync(`${data} ${text}`, hash)
    }

    static isString(value)
    {
        return typeof value === 'string' || value instanceof String
    }
}
module.exports = Format