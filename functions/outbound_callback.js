
// Public endpoint for Twilio Frontline's Outgoing Conversations Callback Url

const {tokenCheck} = require(Runtime.getFunctions().fn.path);
exports.handler = async function(context, event, callback) {
    
    const {REALM_SID,ACCOUNT_SID,AUTH_TOKEN} = context;

    
    const location = event.location;
    const rsp = new Twilio.Response();
    rsp.setHeaders({
        "Content-Type":"application/json"
    });
    
    let ok = await tokenCheck(event.Token, REALM_SID, ACCOUNT_SID, AUTH_TOKEN);
    if(!ok){
        rsp.setBody({error:"Bad Request"})
        rsp.setStatusCode(400);
        return callback(null, rsp);

    }

    switch (location) {
        case 'GetProxyAddress': 
            if(event.Channel && event.Channel.type === 'whatsapp') {
                rsp.setBody({ proxy_address: context.whatsapp });
            } else {
                rsp.setBody({ proxy_address: context.sms });
            }
        break;
        default: 
            rsp.setBody({error:"Bad Request"})
            rsp.setStatusCode(400);    

        break;
    }
    return callback(null, rsp);

};