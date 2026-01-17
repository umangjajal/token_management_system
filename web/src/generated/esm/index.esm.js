import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'token-connector',
  service: 'web',
  location: 'us-east4'
};

export const upsertUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertUser', inputVars);
}
upsertUserRef.operationName = 'UpsertUser';

export function upsertUser(dcOrVars, vars) {
  return executeMutation(upsertUserRef(dcOrVars, vars));
}

export const getCurrentUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCurrentUser', inputVars);
}
getCurrentUserRef.operationName = 'GetCurrentUser';

export function getCurrentUser(dcOrVars, vars) {
  return executeQuery(getCurrentUserRef(dcOrVars, vars));
}

export const listServiceProvidersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListServiceProviders');
}
listServiceProvidersRef.operationName = 'ListServiceProviders';

export function listServiceProviders(dc) {
  return executeQuery(listServiceProvidersRef(dc));
}

export const getProviderServicesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetProviderServices', inputVars);
}
getProviderServicesRef.operationName = 'GetProviderServices';

export function getProviderServices(dcOrVars, vars) {
  return executeQuery(getProviderServicesRef(dcOrVars, vars));
}

export const issueTokenRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'IssueToken', inputVars);
}
issueTokenRef.operationName = 'IssueToken';

export function issueToken(dcOrVars, vars) {
  return executeMutation(issueTokenRef(dcOrVars, vars));
}

export const getMyTokensRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyTokens', inputVars);
}
getMyTokensRef.operationName = 'GetMyTokens';

export function getMyTokens(dcOrVars, vars) {
  return executeQuery(getMyTokensRef(dcOrVars, vars));
}

export const updateTokenStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTokenStatus', inputVars);
}
updateTokenStatusRef.operationName = 'UpdateTokenStatus';

export function updateTokenStatus(dcOrVars, vars) {
  return executeMutation(updateTokenStatusRef(dcOrVars, vars));
}

