class Cookies
{
    static get(request)
    {
        const cookies = {}
        const cookie_header = request.headers.cookie
        if (cookie_header) 
        {
            cookie_header.split(';').forEach
            (
                function(cookie) 
                {
                    const [name, value] = cookie.split('=')
                    cookies[name.trim()] = decodeURIComponent(value)
                }
            )
        }
        return cookies
    }

    static revalidate(cookies)
    {
        var sessao
        if (cookies)
        {
            sessao = session.usuarios[cookies['session_id']] ?? null
            if (sessao)
            {
                cookies.remember = sessao.usuario.remember
            }
            else
            {
                cookies = null
            }
        }
        return cookies
    }
}

module.exports = Cookies