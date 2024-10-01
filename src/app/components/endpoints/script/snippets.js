export const Snippets = {
  GET_ENVIRONMENT_VARIABLE: {
    key: 'Get an environment variable',
    value: 'hm.environment.get("variable_key");'
  },
  SET_ENVIRONMENT_VARIABLE: {
    key: 'Set an environment variable',
    value: 'hm.environment.set("variable_key", "variable_value");'
  },
  UNSET_ENVIRONMENT_VARIABLE: {
    key: 'unset an environment variable',
    value: 'hm.environment.unset("variable_name");'
  },
  CLEAR_ALL_ENVIRONMENT_VARIABLES: {
    key: 'Clear all environment variables',
    value: 'hm.environment.clear();'
  },
  HAS_ENVIRONMENT_VARIABLE: {
    key: 'Check whether the environment has a variable with the specified name',
    value: 'hm.environment.has("variable_name");'
  },
  GET_REQUEST_URL: {
    key: 'Get request Url',
    value: 'hm.request.url;'
  },
  ADD_REQUEST_HEDADER: {
    key: 'Add header to the current request',
    value: 'hm.request.headers.add("key","value");'
  },
  GET_REQUEST_METHOD: {
    key: 'Get HTTP request method',
    value: 'hm.request.method;'
  },
  GET_REQUEST_BODY: {
    key: 'Get Request Body',
    value: 'hm.request.body;'
  },
  GET_REQUEST_HEADERS: {
    key: 'Get list of headers for the current request',
    value: 'hm.request.headers.getHeaders();'
  },
  REMOVE_REQUEST_HEADER: {
    key: 'Delete the request header with the specified name',
    value: 'hm.request.headers.remove("header_name");'
  },
  HAS_REQUEST_HEADER: {
    key: 'Check whether the header has a variable with the specified name',
    value: 'hm.request.headers.has("variable_name");'
  },
  GET_RESPONSE_BODY: {
    key: 'Get Response Body',
    value: 'hm.response.body;'
  },
  GET_RESPONSE_HEADERS: {
    key: 'Get Response Headers',
    value: 'hm.response.headers.getHeaders();'
  },
  GET_RESPONSE_STATUS: {
    key: 'Get Response Status',
    value: 'hm.response.status;'
  },
  TEST_STATUS_200: {
    key: 'Status code: Code is 200',
    value: 'hm.test("Status code is 200", ()=>{\r\n\texpect(hm.response.status).to.equal(200);\r\n});'
  },
  TEST_STATUS_CODE_HAS_STRING: {
    key: 'Status Code: Code name has string',
    value: 'hm.test("Status code name has string", function () {\r\n\texpect(hm.response.statusText).to.have.string("OK");\r\n});'
  },
  TEST_STATUS_SUCCESFULL_POST_REQUEST: {
    key: 'Status Code: Successful POST Request',
    value: 'hm.test("Successful POST request", function () {\r\n\texpect(hm.response.status).to.be.oneOf([201, 202]);\r\n});'
  },
  TEST_RESPONSE_BODY_JSON_CHECK: {
    key: 'Response body: JSON Value Check',
    value: 'hm.test("JSON Value Check", ()=>{\r\n\tlet jsonData = hm.response.body;\r\n\texpect(jsonData.key).to.eql("value");\r\n});'
  },
  TEST_RESPONSE_BODY_EQUAL_TO_STRING: {
    key: 'Response body: is equal to a string',
    value: 'hm.test("Body Is Correct", ()=>{\r\n\texpect(hm.response.body).to.eql("STRING_TO_CHECK");\r\n});'
  },
  TEST_RESPONSE_BODY_CONTAINS_STRING: {
    key: 'Response body: Contains string',
    value: 'hm.test("Body matches string", function () {\r\n\texpect(String(hm.response.body)).to.include("GET");\r\n});'
  },
  TEST_RESPONSE_HEADERS_CONTAINS_HEADER: {
    key: 'Response Headers: Content-Type header check',
    value:
      'hm.test("Content-Type is present", function () {\r\n\texpect(hm.response.headers.getHeaders()).to.have.property(\'Content-Type\');\r\n});'
  }
}

export const preReqSnippets = [
  'GET_ENVIRONMENT_VARIABLE',
  'SET_ENVIRONMENT_VARIABLE',
  'UNSET_ENVIRONMENT_VARIABLE',
  'CLEAR_ALL_ENVIRONMENT_VARIABLES',
  'HAS_ENVIRONMENT_VARIABLE',
  'GET_REQUEST_URL',
  'ADD_REQUEST_HEDADER',
  'GET_REQUEST_METHOD',
  'GET_REQUEST_BODY',
  'GET_REQUEST_HEADERS',
  'REMOVE_REQUEST_HEADER',
  'HAS_REQUEST_HEADER'
]

export const postReqSnippets = [
  'GET_ENVIRONMENT_VARIABLE',
  'SET_ENVIRONMENT_VARIABLE',
  'UNSET_ENVIRONMENT_VARIABLE',
  'CLEAR_ALL_ENVIRONMENT_VARIABLES',
  'HAS_ENVIRONMENT_VARIABLE',
  'GET_REQUEST_URL',
  'GET_REQUEST_METHOD',
  'GET_REQUEST_BODY',
  'GET_REQUEST_HEADERS',
  'ADD_REQUEST_HEDADER',
  'REMOVE_REQUEST_HEADER',
  'HAS_REQUEST_HEADER',
  'GET_RESPONSE_BODY',
  'GET_RESPONSE_HEADERS',
  'GET_RESPONSE_STATUS',
  'TEST_STATUS_200',
  'TEST_STATUS_CODE_HAS_STRING',
  'TEST_STATUS_SUCCESFULL_POST_REQUEST',
  'TEST_RESPONSE_BODY_JSON_CHECK',
  'TEST_RESPONSE_BODY_EQUAL_TO_STRING',
  'TEST_RESPONSE_BODY_CONTAINS_STRING',
  'TEST_RESPONSE_HEADERS_CONTAINS_HEADER'
]

export default {
  Snippets,
  preReqSnippets,
  postReqSnippets
}
