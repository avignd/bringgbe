const cryptoJS = require('crypto-js');
const xmlhttprequest = require('xmlhttprequest');
const config = require('../config');

class BringgService{

    static requestBringgApi(url, params, type){
        params.timestamp = Date.now();
        params.access_token = config.accessToken;
        params.signature = cryptoJS.HmacSHA1(this.encodeQuery(params), config.secretKey).toString();

        let request = new xmlhttprequest.XMLHttpRequest();
        if(type === 'GET') {
            url +=  '?' + this.encodeQuery(params);
        }
        request.open(type, url, false);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(params));

        if(request.status === 200) {
            return JSON.parse(request.responseText);
        }
        else{
            console.log(request.status);
            return null;
        }
    }

    static encodeQuery(params){
        let query_params = '';
        for (let key in params) {
            let value = params[key];
            if (query_params.length > 0) {
                query_params += '&';
            }
            query_params += key + '=' + encodeURIComponent(value);
        }
        return query_params;
    }
}

module.exports = BringgService;