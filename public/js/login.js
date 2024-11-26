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

const logout = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: '/api/v1/users/logout',
        })

        if(response.data.status === 'success') {
            showAlerts('success', response.data.message)
            window.setTimeout(() => {
                location.reload(true)
            }, 1500)
        }
    } catch(err) {
        showAlerts('error', 'Error logging out! Try again later.')
    }
}

let formElement = document.querySelector('.form')
if(formElement) {
    formElement.addEventListener('submit', e => {
        e.preventDefault()    
    
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        login(email, password)
    })
}
const logoutBtn = document.querySelector('.nav__el--logout')
if(logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault()
        logout()
    })
}