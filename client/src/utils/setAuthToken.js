import axios from 'axios';
const setAuhtToken = token => {
    if(token) {
        // aply to every request
        axios.defaults.headers.coomen['Authorization'];
    } else {
        // delete auth header
        delete axios.defaults.headers.common['Authorization'];
    }
};

export default setAuhtToken;