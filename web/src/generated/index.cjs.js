const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'token-connector',
  service: 'web',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const upsertUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertUser', inputVars);
}
upsertUserRef.operationName = 'UpsertUser';
exports.upsertUserRef = upsertUserRef;

exports.upsertUser = function upsertUser(dcOrVars, vars) {
  return executeMutation(upsertUserRef(dcOrVars, vars));
};

const getCurrentUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCurrentUser', inputVars);
}
getCurrentUserRef.operationName = 'GetCurrentUser';
exports.getCurrentUserRef = getCurrentUserRef;

exports.getCurrentUser = function getCurrentUser(dcOrVars, vars) {
  return executeQuery(getCurrentUserRef(dcOrVars, vars));
};

const listServiceProvidersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListServiceProviders');
}
listServiceProvidersRef.operationName = 'ListServiceProviders';
exports.listServiceProvidersRef = listServiceProvidersRef;

exports.listServiceProviders = function listServiceProviders(dc) {
  return executeQuery(listServiceProvidersRef(dc));
};

const getProviderServicesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetProviderServices', inputVars);
}
getProviderServicesRef.operationName = 'GetProviderServices';
exports.getProviderServicesRef = getProviderServicesRef;

exports.getProviderServices = function getProviderServices(dcOrVars, vars) {
  return executeQuery(getProviderServicesRef(dcOrVars, vars));
};

const issueTokenRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'IssueToken', inputVars);
}
issueTokenRef.operationName = 'IssueToken';
exports.issueTokenRef = issueTokenRef;

exports.issueToken = function issueToken(dcOrVars, vars) {
  return executeMutation(issueTokenRef(dcOrVars, vars));
};

const getMyTokensRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyTokens', inputVars);
}
getMyTokensRef.operationName = 'GetMyTokens';
exports.getMyTokensRef = getMyTokensRef;

exports.getMyTokens = function getMyTokens(dcOrVars, vars) {
  return executeQuery(getMyTokensRef(dcOrVars, vars));
};

const updateTokenStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTokenStatus', inputVars);
}
updateTokenStatusRef.operationName = 'UpdateTokenStatus';
exports.updateTokenStatusRef = updateTokenStatusRef;

exports.updateTokenStatus = function updateTokenStatus(dcOrVars, vars) {
  return executeMutation(updateTokenStatusRef(dcOrVars, vars));
};
