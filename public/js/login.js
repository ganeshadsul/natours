const hideAlerts = () => {
    const el = document.querySelector('.alert')
    if(el) el.parentElement.removeChild(el)
}
const showAlerts = (type, msg) => {
    hideAlerts()
    const markUp = `<div class="alert alert--${type}">${msg}</div>`
    document.querySelector('body').insertAdjacentHTML('afterbegin', markUp)

    window.setTimeout(hideAlerts, 5000);
}


const login = async (email, password) => {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            }
        })

        if(response.data.status === 'success') {
            // alert('Logged in successfully!')
            showAlerts('success', 'Logged in successfully!')
            window.setTimeout(() => {
                location.assign('/')
            }, 1500)
        }
    } catch (error) {
        showAlerts('error', error.response.data.message);
    }
}

document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault()    

    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    login(email, password)
})