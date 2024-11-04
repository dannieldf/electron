class Email
{
    static defaults =
        {
            assunto: titulo,
            corpo: '<p>system error</p>',
            corpo_sem_html: 'visualize a mensagem em formato HTML',
            destinatarios: [],
            destinatarios_cc: [],
            destinatarios_cco: [],
            anexos: [],
            modelo_padrao: true
        }

    static mailer

    static async envia(dados)
    {
        var i, info, options, header_desenv
        dados =
            {
                ...Email.defaults,
                ...dados
            }
        if (!Array.isArray(dados.destinatarios) || dados.destinatarios.length == 0)
        {
            return false
        }
        if (dados.modelo_padrao)
        {
            dados.corpo =
                `
                <h1 style="padding '10px 0'; border-bottom: 'solid 1px #dddddd'">
                    ${titulo}
                </h1>
                ${dados.corpo}
                <p style="font-style: 'italic'; padding: '10px 0'; border-top: 'solid 1px #dddddd'; color: '#888888'">
                    Não responda. Esta é uma mensagem automática
                </p>
                `
        }
        options = 
            {
                from: app.nodemailer.email,
                to: dados.destinatarios.join(','),
                cc: dados.destinatarios_cc.join(','),
                cco: dados.destinatarios_cco.join(','),
                subject: dados.assunto,
                text: dados.corpo_sem_html,
                html: dados.corpo
            }
        if (app.servidor_app != 'P')
        {
            header_desenv =
                `
                <div style="background-color: lightgoldenrodyellow">
                    Esta é uma cópia da mensagem enviada pelo sistema em ambiente de desenvolvimento.
                    Em ambiente de produção, esta mensagem seria enviada para:
                    <ol>
                `
            for (i in options.to)
            {
                header_desenv += `
                    <li>${options.to[i]}</li>` 
            }
            header_desenv +=
                `
                    </ol>
                </div>`
            options.text = header_desenv + options.text
            options.to = options.from
        }
        try
        {
            info = await this.mailer.sendMail(options)
            return true
        }
        catch(error)
        {
            console.log('Falha no envio de email', error)
            return false
        }
    }

    static start()
    {
        const nodemailer = require('nodemailer')
        this.mailer = nodemailer.createTransport(app.nodemailer)
        if (this.mailer)
        {
            console.log('Cliente de e-mail on')
        }
        else
        {
            throw new Error('Cliente de e-mail NÃO SUBIU')
        }
    }
}

module.exports = Email