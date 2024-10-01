const grantTypesEnums = {
    authorizationCode: 'Authorization Code',
    authorizationCodeWithPkce: 'Authorization Code (With PKCE)',
    implicit: 'Implicit',
    passwordCredentials: 'Password Credentials',
    clientCredentials: 'Client Credentials'
}

const inputFieldsEnums = {
    tokenName: 'Token Name',
    grantType: 'Grant Type',
    callbackUrl: 'Callback URL',
    authUrl: 'Auth URL',
    accessTokenUrl: 'Access Token URL',
    codeMethod: 'Code Challenge Method',
    codeVerifier: 'Code Verifier',
    username: 'Username',
    password: 'Password',
    clientId: 'Client ID',
    clientSecret: 'Client Secret',
    scope: 'Scope',
    state: 'State',
    clientAuthentication: 'Client Authentication',
    refreshTokenUrl: 'Refresh Token URL',
}

const codeMethodTypesEnums = {
    sh256: 'sh-256',
    plain: 'Plain',
}

const clientAuthenticationTypeEnums = {
    sendOnHeaders: 'Send as Basic Auth header',
    sendOnBody: 'Send client credentials in body',
}

const authorizationTypes = {
    noAuth: 'No Auth',
    basicAuth: 'Basic Auth',
    oauth2: 'OAuth 2.0',
}

const addAuthorizationDataTypes = {
    select: 'Select',
    requestHeaders: 'Request Headers',
    requestUrl: 'Request URL',
}

export { grantTypesEnums, inputFieldsEnums, codeMethodTypesEnums, clientAuthenticationTypeEnums, authorizationTypes, addAuthorizationDataTypes }