import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface GetCurrentUserData {
  users: ({
    id: UUIDString;
    displayName: string;
    createdAt: TimestampString;
  } & User_Key)[];
}

export interface GetCurrentUserVariables {
  email?: string | null;
}

export interface GetMyTokensData {
  queueTokens: ({
    id: UUIDString;
    tokenNumber: number;
    status: string;
    expectedCallTime: TimestampString;
    service: {
      name: string;
    };
      serviceProvider: {
        name: string;
      };
  } & QueueToken_Key)[];
}

export interface GetMyTokensVariables {
  userId: UUIDString;
}

export interface GetProviderServicesData {
  services: ({
    id: UUIDString;
    name: string;
    estimatedDuration?: number | null;
    description?: string | null;
  } & Service_Key)[];
}

export interface GetProviderServicesVariables {
  providerId: UUIDString;
}

export interface IssueTokenData {
  queueToken_insert: QueueToken_Key;
}

export interface IssueTokenVariables {
  userId: UUIDString;
  serviceId: UUIDString;
  providerId: UUIDString;
  tokenNumber: number;
}

export interface ListServiceProvidersData {
  serviceProviders: ({
    id: UUIDString;
    name: string;
    address: string;
    description?: string | null;
    operatingHours?: string | null;
  } & ServiceProvider_Key)[];
}

export interface QueueToken_Key {
  id: UUIDString;
  __typename?: 'QueueToken_Key';
}

export interface Queue_Key {
  id: UUIDString;
  __typename?: 'Queue_Key';
}

export interface ServiceProvider_Key {
  id: UUIDString;
  __typename?: 'ServiceProvider_Key';
}

export interface Service_Key {
  id: UUIDString;
  __typename?: 'Service_Key';
}

export interface UpdateTokenStatusData {
  queueToken_update?: QueueToken_Key | null;
}

export interface UpdateTokenStatusVariables {
  tokenId: UUIDString;
  status: string;
}

export interface UpsertUserData {
  user_upsert: User_Key;
}

export interface UpsertUserVariables {
  username: string;
  email?: string | null;
  phoneNumber?: string | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface UpsertUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
  operationName: string;
}
export const upsertUserRef: UpsertUserRef;

export function upsertUser(vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;
export function upsertUser(dc: DataConnect, vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface GetCurrentUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetCurrentUserVariables): QueryRef<GetCurrentUserData, GetCurrentUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetCurrentUserVariables): QueryRef<GetCurrentUserData, GetCurrentUserVariables>;
  operationName: string;
}
export const getCurrentUserRef: GetCurrentUserRef;

export function getCurrentUser(vars?: GetCurrentUserVariables): QueryPromise<GetCurrentUserData, GetCurrentUserVariables>;
export function getCurrentUser(dc: DataConnect, vars?: GetCurrentUserVariables): QueryPromise<GetCurrentUserData, GetCurrentUserVariables>;

interface ListServiceProvidersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListServiceProvidersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListServiceProvidersData, undefined>;
  operationName: string;
}
export const listServiceProvidersRef: ListServiceProvidersRef;

export function listServiceProviders(): QueryPromise<ListServiceProvidersData, undefined>;
export function listServiceProviders(dc: DataConnect): QueryPromise<ListServiceProvidersData, undefined>;

interface GetProviderServicesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProviderServicesVariables): QueryRef<GetProviderServicesData, GetProviderServicesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetProviderServicesVariables): QueryRef<GetProviderServicesData, GetProviderServicesVariables>;
  operationName: string;
}
export const getProviderServicesRef: GetProviderServicesRef;

export function getProviderServices(vars: GetProviderServicesVariables): QueryPromise<GetProviderServicesData, GetProviderServicesVariables>;
export function getProviderServices(dc: DataConnect, vars: GetProviderServicesVariables): QueryPromise<GetProviderServicesData, GetProviderServicesVariables>;

interface IssueTokenRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: IssueTokenVariables): MutationRef<IssueTokenData, IssueTokenVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: IssueTokenVariables): MutationRef<IssueTokenData, IssueTokenVariables>;
  operationName: string;
}
export const issueTokenRef: IssueTokenRef;

export function issueToken(vars: IssueTokenVariables): MutationPromise<IssueTokenData, IssueTokenVariables>;
export function issueToken(dc: DataConnect, vars: IssueTokenVariables): MutationPromise<IssueTokenData, IssueTokenVariables>;

interface GetMyTokensRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMyTokensVariables): QueryRef<GetMyTokensData, GetMyTokensVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMyTokensVariables): QueryRef<GetMyTokensData, GetMyTokensVariables>;
  operationName: string;
}
export const getMyTokensRef: GetMyTokensRef;

export function getMyTokens(vars: GetMyTokensVariables): QueryPromise<GetMyTokensData, GetMyTokensVariables>;
export function getMyTokens(dc: DataConnect, vars: GetMyTokensVariables): QueryPromise<GetMyTokensData, GetMyTokensVariables>;

interface UpdateTokenStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTokenStatusVariables): MutationRef<UpdateTokenStatusData, UpdateTokenStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTokenStatusVariables): MutationRef<UpdateTokenStatusData, UpdateTokenStatusVariables>;
  operationName: string;
}
export const updateTokenStatusRef: UpdateTokenStatusRef;

export function updateTokenStatus(vars: UpdateTokenStatusVariables): MutationPromise<UpdateTokenStatusData, UpdateTokenStatusVariables>;
export function updateTokenStatus(dc: DataConnect, vars: UpdateTokenStatusVariables): MutationPromise<UpdateTokenStatusData, UpdateTokenStatusVariables>;

