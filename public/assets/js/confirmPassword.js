//Logic for account confirmation

//container for the module
const app ={};

app.emailMatch = () => {
    const pass = document.querySelector('#pass')
    const confirmPass = document.querySelector('#confirmPass')
    const formError = document.querySelector('#formError')
    const errorField = document.querySelector('#errorField')
    confirmPass.addEventListener('blur',e=>{
        if(pass.value != e.target.value ){
            errorField.innerHTML = "passwords did not match"
            formError.style.display = 'block'
        }
    })
    confirmPass.addEventListener('focus',e=>{
            formError.style.display = 'none'
    })
}

app.getData = () => {
    
    const formError = document.querySelector('#formError')
    formError.style.display = 'none';
    const form = document.querySelector('form');
    form.addEventListener('submit',e=>{
        e.preventDefault();
        const data = {};
        const actionUrl = e.target.action
        data.password = document.querySelector('#pass').value;
        app.client(actionUrl,data);

    })
}

app.client = (url,data) => {
    const options = {};
    options.body = JSON.stringify(data);
    options.method = 'PUT';
    options.headers = {
        'Content-Type': 'application/json'
    }

    fetch(url,options).then( res => res.json())
    .then( data => {
        if(data.message){
        const formSuccess = document.querySelector('#formSuccess')
        const successField = document.querySelector('#successField')
        successField.innerHTML = data.message;
        formSuccess.style.display = 'block';

        }else{
            const formError = document.querySelector('#formError')
            const errorField = document.querySelector('#errorField')
            errorField.innerHTML = "An error has occured";
            formError.style.display = 'block'
        }
    })

}




app.init = () => {
    app.emailMatch();
    app.getData();
}

window.onload = () => {
    app.init()
}