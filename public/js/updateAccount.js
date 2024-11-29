import showAlerts from '/js/alerts.js'

const updateUserInfo = async (name, email) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: '/api/v1/users/update-my-details',
            data: {
                name,
                email
            }
        })
        if(res.data.status === 'success') {
            showAlerts('success', 'User info updated.')
            return res.data.data.user
        }
        return null;
    } catch (error) {
        showAlerts('error', 'Somethine went wrong!')
    }
}
const updateUSerPassword = async(currentPassword, password, passwordConfirm) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: '/api/v1/users/update-password',
            data: {
                currentPassword, password, passwordConfirm
            }
        })
        if(res.data.status === 'success') {
            showAlerts('success', 'Password changed successfully.')
        }
        return null;
    } catch (error) {
        console.log(error);
        showAlerts('error', 'Somethine went wrong!')
    }
}

let updateUserInfoForm = document.querySelector('.update-user-form')
if(updateUserInfoForm) {
    updateUserInfoForm.addEventListener('submit', async (e) => {
        e.preventDefault()

        const email = document.getElementById('email').value
        const name = document.getElementById('name').value

        const data = await updateUserInfo(name, email)
        if(data) {
            document.getElementById('name').value = data.name
            document.getElementById('email').value = data.email
        }
    })
}

let updateUserPasswordForm = document.querySelector('.form-user-password')
if(updateUserPasswordForm) {
    updateUserPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault()

        const currentPassword = document.getElementById('password-current').value
        const password = document.getElementById('password').value
        const passwordConfirm = document.getElementById('password-confirm').value
        updateUSerPassword(currentPassword, password, passwordConfirm)

        document.getElementById('password-current').value = ''
        document.getElementById('password').value = ''
        document.getElementById('password-confirm').value = ''
    })
}