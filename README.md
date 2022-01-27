Twilio Serverless framework for integrating hubspot with Twilio Frontline



## (A) Prerequisites
You will need:
1. A Free [Hubspot Account](https://www.hubspot.com)
2. A [Twilio Account](https://www.twilio.com) 
3. Twilio phone numbers enabled for SMS and [WhatsApp](https://www.twilio.com/whatsapp). You will need to onboard WhatsApp to gain access to the WhatsApp Business API.
4. A [Twilio Frontline](https://www.twilio.com/frontline) Instance. Follow the instructions on the [node-js-demo-quickstart](https://www.twilio.com/docs/frontline/nodejs-demo-quickstart) until the "Configure the Twilio Frontline Integration Service" section.
5. Twilio CLI and [Twilio Serverless Toolkit](https://www.twilio.com/docs/labs/serverless-toolkit) installed.

Optional:
1. Microsoft Azure AD App registration for integration into Single Sign-On and Identity APIs for Workers. See section C on configuring SSO with Azure AD.

## (B) Instructions

1. Pull the repository
2. Install dependencies via npm / yarn

```bash
npm install
```

3. Copy .env.example to .env 
```bash
cp .env.example .env
```
4. Fill in the environment values in the copied .env file. You will need 
- your [Hubspot API key](https://knowledge.hubspot.com/integrations/how-do-i-get-my-hubspot-api-key), 
- the [Frontline Realm SID](https://www.twilio.com/console/frontline/sso) - via console
- the Twilio Conversations Service SID associated with your Twilio Frontline instance.
- Microsoft Azure AD Application Registration App ID, App Secret and Tenant ID (Optional, useful for getting Worker Name etc)


5. Deploy the code to twilio:


```bash
# Automatically deploy to a development environment with frontline-hubspot as a name prefix. 
# If you want a different name, edit package.json's name attribute, or adjust .twilioserverlessrc
twilio serverless:deploy
```
```bash
# Specify production environment
twilio serverless:deploy ---production

```
6. Visit the [Twilio Console](https://www.twilio.com/console/functions/overview/services) and look for the recently deployed service. Click on Service Details and take note of the domain of the deployed environment (e.g. `frontline-hubspot-0000.twil.io`)
7. Go to the [Twilio Frontline Configuration page](https://www.twilio.com/console/frontline/configure). Under each URL, put the following and press save. Replace `${DOMAIN}` with the domain obtained in step 6.

|Name                                | URL                                   |
|------------------------------------|---------------------------------------|
|CRM Callback URL                    | `https://${DOMAIN}/get_contact`       |
|Outgoing Conversations Callback URL | `https://${DOMAIN}/outbound_callback` |
|Templates Callback URL              | `https://${DOMAIN}/templates_callback`|


8. Configure the Webhooks for the [Conversations API](https://www.twilio.com/console/conversations/configuration/webhooks). Under Post-Event URL, put in the following URL `https://${DOMAIN}/conversation_callback`, replacing `${DOMAIN}` with the domain obtained in step 6.

9. Test Your integration in the Frontline App.

## (C) Configuring SSO integration and worker contact integration with Azure AD.(Optional)
If you are not using the example Okta integration in the Twilio quick start, you can configure Frontline to login via Azure AD login (Microsoft 365). This will also allow you to read Worker (Agent) name and data via your Active Directory Information. You will need administrator privileges in your Azure AD tenant.


### SAML SSO Integration
Before starting, make sure a Twilio Frontline service has been setup. After that, visit the [Frontline Console SSO configuration page](https://www.twilio.com/console/frontline/sso) and leave it open. You may fill in the company name beforehand in the Twilio Console.

#### Configuring  Azure AD
1. Visit [Enterprise applications](https://aad.portal.azure.com/#blade/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/AllApps) in the Azure Active Directory Admin Center. Click **New Application**
2. Click on **Create your own application**
3. Type in a name. Leave the selection as 'Non-gallery App'. Wait for the app to be created.

![C.Step3](/readmefiles/C3.jpg)
---
4. Navigate to **Users and groups** in the Azure AD Admin portal and add any users/groups you want to have access to Twilio Frontline. 

5. Navigate to  **Single Sign On**. Click **SAML** when prompted to select a single sign-on method.

![C.Step5](/readmefiles/C5.jpg)
---
6. Edit the *Basic SAML Configuration* 
- Set the Reply URL (Assertion Consumer Service URL) to `https://iam.twilio.com/v2/saml2/authenticate/JBxxxx`. Replace the example Realm SID, `JBxxxx`, with your own Realm SID, which you can find on the [Frontline Console SSO configuration page](https://www.twilio.com/console/frontline/sso).

- Set the Identifier (Entity ID) to `https://iam.twilio.com/v2/saml2/metadata/JBxxxx`. Again, replace the Realm SID (`JBxxxx`) with your own Realm SID. 

- Press Save. The configuration should look something like this:

![C.Step6](/readmefiles/C6.jpg)
---
7. Under *User Attributes & Claims* , edit it so it looks like the screenshot below. You will need to add the **email** and **roles** claims that are required by Twilio Frontline. 

![C.Step7a](/readmefiles/C7a.jpg)
- `email` should be mapped to user.mail attribute

![C.Step7-email](/readmefiles/C7-email.jpg)

- `roles` should be a constant (agent), so type it in in double quotes when adding (i.e Name: Source:`"agent"` for the source)

![C.Step7-roles](/readmefiles/C7-roles.jpg)
- Once done, click on **SAML-based Sign-on** at the top to continue

#### Configuring the Twilio Frontline Console SSO Configuration
![C.Step8](/readmefiles/C8.jpg)

8. Download the base64 encoded version of the SAML Signing Certificate. Open the File with a text editor and copy the contents of the file to  the **X.509 Certificate** field in the *Frontline Console SSO configuration page*
9. Copy the *Login URL* and paste it to the **SSO URL** field in the *Frontline Console SSO configuration page*
10. Copy the *Azure AD Identifier*  and  paste it into the **Identity provider issuer URL** field in the *Frontline Console SSO configuration page*
![C.Step10](/readmefiles/C10.jpg)


11. Save your changes on both the Azure AD side and the Twilio Console side.
12. Test login on the Twilio Frontline Mobile App.


### Application Setup
14. Visit the Azure Active Directory Admin Center and navigate to the [App registrations page](https://aad.portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps). Search for the application under "All Applications". Click on the application.
![C.Step14](/readmefiles/C14.jpg)
---

15. Take note of the Application (client) ID and Directory (tenant) ID. This will be used for app integration (Section B, Step 4)

![C.Step15](/readmefiles/C15.jpg)

17. Navigate to **Certificate & Secrets**. Under Client secrets, click **New Client Secret**. Fill in the details and press Add. Take note of the generated App Secret value - this will be used for app integration (Section B, Step 4)

18. Navigate to **API Permissions**. Click **Add a permission**, and select **Microsoft Graph** ->  **Application Permissions**. Search for `User.Read.All` and add it as a permission. Click **Grant admin Consent for (OrganisationName)**


## Credits
Props to the Twilio Support Team for helping to answer questions and issues encountered while implementing this.

Have any questions or need help to do any custom implementations?
Feel free to drop us an email at hello@thunderquote.com.


## Changelog
2022-01-28 
Updated to use latest version (v2) of the Twilio Frontline Callbacks (https://www.twilio.com/docs/frontline/callback-versions) Note that this version of the code is NOT compatible with v1 
