// Public endpoint for Twilio Frontline's CRM Callback URL
const hubspot = require('@hubspot/api-client')
const {tokenCheck,fetchCustomers,fetchCustomerById} = require(Runtime.getFunctions().fn.path);


exports.handler = async function(context, event, callback) {
  const {apiKey,REALM_SID,ACCOUNT_SID,AUTH_TOKEN} = context;
  const hubspotClient = new hubspot.Client({ apiKey })
  const rsp = new Twilio.Response();
  rsp.setHeaders({
    "Content-Type":"application/json"
  });
  
  
  const body = event;
  
  //Token Check Function
  let ok = await tokenCheck(body.Token, REALM_SID, ACCOUNT_SID, AUTH_TOKEN);
  
  if(!ok){
    rsp.setBody({error:"Bad Request"})
    rsp.setStatusCode(400);
    return callback(null, rsp);

  }
    

  switch(event.location){
    case 'GetCustomerDetailsByCustomerId':
    
      let customer = await fetchCustomerById(hubspotClient,body.CustomerId);
      rsp.setBody({
        objects: {
            customer
        }
      });

    break;

    case 'GetCustomersList':
      let customers = await fetchCustomers(hubspotClient,body.PageSize,body.Anchor);
      rsp.setBody({
        objects: {
            customers
        }
      });
    break;
    default:
        rsp.setBody({error:"Bad Request"})
        rsp.setStatusCode(400);    
    break;
  }
  
  

  
  
  

  return callback(null, rsp);
};