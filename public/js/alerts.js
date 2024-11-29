export const hideAlerts = () => {
    const el = document.querySelector('.alert')
    if(el) el.parentElement.removeChild(el)
}
export const showAlerts = (type, msg) => {
    hideAlerts()
    const markUp = `<div class="alert alert--${type}">${msg}</div>`
    document.querySelector('body').insertAdjacentHTML('afterbegin', markUp)

    window.setTimeout(hideAlerts, 5000);
}

export default showAlerts;