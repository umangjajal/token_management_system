# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `token-connector`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetCurrentUser*](#getcurrentuser)
  - [*ListServiceProviders*](#listserviceproviders)
  - [*GetProviderServices*](#getproviderservices)
  - [*GetMyTokens*](#getmytokens)
- [**Mutations**](#mutations)
  - [*UpsertUser*](#upsertuser)
  - [*IssueToken*](#issuetoken)
  - [*UpdateTokenStatus*](#updatetokenstatus)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `token-connector`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@token-app/api` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@token-app/api';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@token-app/api';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `token-connector` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetCurrentUser
You can execute the `GetCurrentUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [generated/index.d.ts](./index.d.ts):
```typescript
getCurrentUser(vars?: GetCurrentUserVariables): QueryPromise<GetCurrentUserData, GetCurrentUserVariables>;

interface GetCurrentUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetCurrentUserVariables): QueryRef<GetCurrentUserData, GetCurrentUserVariables>;
}
export const getCurrentUserRef: GetCurrentUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCurrentUser(dc: DataConnect, vars?: GetCurrentUserVariables): QueryPromise<GetCurrentUserData, GetCurrentUserVariables>;

interface GetCurrentUserRef {
  ...
  (dc: DataConnect, vars?: GetCurrentUserVariables): QueryRef<GetCurrentUserData, GetCurrentUserVariables>;
}
export const getCurrentUserRef: GetCurrentUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCurrentUserRef:
```typescript
const name = getCurrentUserRef.operationName;
console.log(name);
```

### Variables
The `GetCurrentUser` query has an optional argument of type `GetCurrentUserVariables`, which is defined in [generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCurrentUserVariables {
  email?: string | null;
}
```
### Return Type
Recall that executing the `GetCurrentUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCurrentUserData`, which is defined in [generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCurrentUserData {
  users: ({
    id: UUIDString;
    displayName: string;
    createdAt: TimestampString;
  } & User_Key)[];
}
```
### Using `GetCurrentUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCurrentUser, GetCurrentUserVariables } from '@token-app/api';

// The `GetCurrentUser` query has an optional argument of type `GetCurrentUserVariables`:
const getCurrentUserVars: GetCurrentUserVariables = {
  email: ..., // optional
};

// Call the `getCurrentUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCurrentUser(getCurrentUserVars);
// Variables can be defined inline as well.
const { data } = await getCurrentUser({ email: ..., });
// Since all variables are optional for this query, you can omit the `GetCurrentUserVariables` argument.
const { data } = await getCurrentUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCurrentUser(dataConnect, getCurrentUserVars);

console.log(data.users);

// Or, you can use the `Promise` API.
getCurrentUser(getCurrentUserVars).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetCurrentUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCurrentUserRef, GetCurrentUserVariables } from '@token-app/api';

// The `GetCurrentUser` query has an optional argument of type `GetCurrentUserVariables`:
const getCurrentUserVars: GetCurrentUserVariables = {
  email: ..., // optional
};

// Call the `getCurrentUserRef()` function to get a reference to the query.
const ref = getCurrentUserRef(getCurrentUserVars);
// Variables can be defined inline as well.
const ref = getCurrentUserRef({ email: ..., });
// Since all variables are optional for this query, you can omit the `GetCurrentUserVariables` argument.
const ref = getCurrentUserRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCurrentUserRef(dataConnect, getCurrentUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## ListServiceProviders
You can execute the `ListServiceProviders` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [generated/index.d.ts](./index.d.ts):
```typescript
listServiceProviders(): QueryPromise<ListServiceProvidersData, undefined>;

interface ListServiceProvidersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListServiceProvidersData, undefined>;
}
export const listServiceProvidersRef: ListServiceProvidersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listServiceProviders(dc: DataConnect): QueryPromise<ListServiceProvidersData, undefined>;

interface ListServiceProvidersRef {
  ...
  (dc: DataConnect): QueryRef<ListServiceProvidersData, undefined>;
}
export const listServiceProvidersRef: ListServiceProvidersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listServiceProvidersRef:
```typescript
const name = listServiceProvidersRef.operationName;
console.log(name);
```

### Variables
The `ListServiceProviders` query has no variables.
### Return Type
Recall that executing the `ListServiceProviders` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListServiceProvidersData`, which is defined in [generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListServiceProvidersData {
  serviceProviders: ({
    id: UUIDString;
    name: string;
    address: string;
    description?: string | null;
    operatingHours?: string | null;
  } & ServiceProvider_Key)[];
}
```
### Using `ListServiceProviders`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listServiceProviders } from '@token-app/api';


// Call the `listServiceProviders()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listServiceProviders();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listServiceProviders(dataConnect);

console.log(data.serviceProviders);

// Or, you can use the `Promise` API.
listServiceProviders().then((response) => {
  const data = response.data;
  console.log(data.serviceProviders);
});
```

### Using `ListServiceProviders`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listServiceProvidersRef } from '@token-app/api';


// Call the `listServiceProvidersRef()` function to get a reference to the query.
const ref = listServiceProvidersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listServiceProvidersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.serviceProviders);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.serviceProviders);
});
```

## GetProviderServices
You can execute the `GetProviderServices` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [generated/index.d.ts](./index.d.ts):
```typescript
getProviderServices(vars: GetProviderServicesVariables): QueryPromise<GetProviderServicesData, GetProviderServicesVariables>;

interface GetProviderServicesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProviderServicesVariables): QueryRef<GetProviderServicesData, GetProviderServicesVariables>;
}
export const getProviderServicesRef: GetProviderServicesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getProviderServices(dc: DataConnect, vars: GetProviderServicesVariables): QueryPromise<GetProviderServicesData, GetProviderServicesVariables>;

interface GetProviderServicesRef {
  ...
  (dc: DataConnect, vars: GetProviderServicesVariables): QueryRef<GetProviderServicesData, GetProviderServicesVariables>;
}
export const getProviderServicesRef: GetProviderServicesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getProviderServicesRef:
```typescript
const name = getProviderServicesRef.operationName;
console.log(name);
```

### Variables
The `GetProviderServices` query requires an argument of type `GetProviderServicesVariables`, which is defined in [generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetProviderServicesVariables {
  providerId: UUIDString;
}
```
### Return Type
Recall that executing the `GetProviderServices` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetProviderServicesData`, which is defined in [generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetProviderServicesData {
  services: ({
    id: UUIDString;
    name: string;
    estimatedDuration?: number | null;
    description?: string | null;
  } & Service_Key)[];
}
```
### Using `GetProviderServices`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getProviderServices, GetProviderServicesVariables } from '@token-app/api';

// The `GetProviderServices` query requires an argument of type `GetProviderServicesVariables`:
const getProviderServicesVars: GetProviderServicesVariables = {
  providerId: ..., 
};

// Call the `getProviderServices()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getProviderServices(getProviderServicesVars);
// Variables can be defined inline as well.
const { data } = await getProviderServices({ providerId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getProviderServices(dataConnect, getProviderServicesVars);

console.log(data.services);

// Or, you can use the `Promise` API.
getProviderServices(getProviderServicesVars).then((response) => {
  const data = response.data;
  console.log(data.services);
});
```

### Using `GetProviderServices`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getProviderServicesRef, GetProviderServicesVariables } from '@token-app/api';

// The `GetProviderServices` query requires an argument of type `GetProviderServicesVariables`:
const getProviderServicesVars: GetProviderServicesVariables = {
  providerId: ..., 
};

// Call the `getProviderServicesRef()` function to get a reference to the query.
const ref = getProviderServicesRef(getProviderServicesVars);
// Variables can be defined inline as well.
const ref = getProviderServicesRef({ providerId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getProviderServicesRef(dataConnect, getProviderServicesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.services);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.services);
});
```

## GetMyTokens
You can execute the `GetMyTokens` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [generated/index.d.ts](./index.d.ts):
```typescript
getMyTokens(vars: GetMyTokensVariables): QueryPromise<GetMyTokensData, GetMyTokensVariables>;

interface GetMyTokensRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMyTokensVariables): QueryRef<GetMyTokensData, GetMyTokensVariables>;
}
export const getMyTokensRef: GetMyTokensRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyTokens(dc: DataConnect, vars: GetMyTokensVariables): QueryPromise<GetMyTokensData, GetMyTokensVariables>;

interface GetMyTokensRef {
  ...
  (dc: DataConnect, vars: GetMyTokensVariables): QueryRef<GetMyTokensData, GetMyTokensVariables>;
}
export const getMyTokensRef: GetMyTokensRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyTokensRef:
```typescript
const name = getMyTokensRef.operationName;
console.log(name);
```

### Variables
The `GetMyTokens` query requires an argument of type `GetMyTokensVariables`, which is defined in [generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetMyTokensVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `GetMyTokens` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyTokensData`, which is defined in [generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetMyTokens`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyTokens, GetMyTokensVariables } from '@token-app/api';

// The `GetMyTokens` query requires an argument of type `GetMyTokensVariables`:
const getMyTokensVars: GetMyTokensVariables = {
  userId: ..., 
};

// Call the `getMyTokens()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyTokens(getMyTokensVars);
// Variables can be defined inline as well.
const { data } = await getMyTokens({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyTokens(dataConnect, getMyTokensVars);

console.log(data.queueTokens);

// Or, you can use the `Promise` API.
getMyTokens(getMyTokensVars).then((response) => {
  const data = response.data;
  console.log(data.queueTokens);
});
```

### Using `GetMyTokens`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyTokensRef, GetMyTokensVariables } from '@token-app/api';

// The `GetMyTokens` query requires an argument of type `GetMyTokensVariables`:
const getMyTokensVars: GetMyTokensVariables = {
  userId: ..., 
};

// Call the `getMyTokensRef()` function to get a reference to the query.
const ref = getMyTokensRef(getMyTokensVars);
// Variables can be defined inline as well.
const ref = getMyTokensRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyTokensRef(dataConnect, getMyTokensVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.queueTokens);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.queueTokens);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `token-connector` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## UpsertUser
You can execute the `UpsertUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [generated/index.d.ts](./index.d.ts):
```typescript
upsertUser(vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface UpsertUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
}
export const upsertUserRef: UpsertUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertUser(dc: DataConnect, vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface UpsertUserRef {
  ...
  (dc: DataConnect, vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
}
export const upsertUserRef: UpsertUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertUserRef:
```typescript
const name = upsertUserRef.operationName;
console.log(name);
```

### Variables
The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`, which is defined in [generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertUserVariables {
  username: string;
  email?: string | null;
  phoneNumber?: string | null;
}
```
### Return Type
Recall that executing the `UpsertUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertUserData`, which is defined in [generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertUserData {
  user_upsert: User_Key;
}
```
### Using `UpsertUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertUser, UpsertUserVariables } from '@token-app/api';

// The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`:
const upsertUserVars: UpsertUserVariables = {
  username: ..., 
  email: ..., // optional
  phoneNumber: ..., // optional
};

// Call the `upsertUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertUser(upsertUserVars);
// Variables can be defined inline as well.
const { data } = await upsertUser({ username: ..., email: ..., phoneNumber: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertUser(dataConnect, upsertUserVars);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
upsertUser(upsertUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

### Using `UpsertUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertUserRef, UpsertUserVariables } from '@token-app/api';

// The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`:
const upsertUserVars: UpsertUserVariables = {
  username: ..., 
  email: ..., // optional
  phoneNumber: ..., // optional
};

// Call the `upsertUserRef()` function to get a reference to the mutation.
const ref = upsertUserRef(upsertUserVars);
// Variables can be defined inline as well.
const ref = upsertUserRef({ username: ..., email: ..., phoneNumber: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertUserRef(dataConnect, upsertUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

## IssueToken
You can execute the `IssueToken` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [generated/index.d.ts](./index.d.ts):
```typescript
issueToken(vars: IssueTokenVariables): MutationPromise<IssueTokenData, IssueTokenVariables>;

interface IssueTokenRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: IssueTokenVariables): MutationRef<IssueTokenData, IssueTokenVariables>;
}
export const issueTokenRef: IssueTokenRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
issueToken(dc: DataConnect, vars: IssueTokenVariables): MutationPromise<IssueTokenData, IssueTokenVariables>;

interface IssueTokenRef {
  ...
  (dc: DataConnect, vars: IssueTokenVariables): MutationRef<IssueTokenData, IssueTokenVariables>;
}
export const issueTokenRef: IssueTokenRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the issueTokenRef:
```typescript
const name = issueTokenRef.operationName;
console.log(name);
```

### Variables
The `IssueToken` mutation requires an argument of type `IssueTokenVariables`, which is defined in [generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface IssueTokenVariables {
  userId: UUIDString;
  serviceId: UUIDString;
  providerId: UUIDString;
  tokenNumber: number;
}
```
### Return Type
Recall that executing the `IssueToken` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `IssueTokenData`, which is defined in [generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface IssueTokenData {
  queueToken_insert: QueueToken_Key;
}
```
### Using `IssueToken`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, issueToken, IssueTokenVariables } from '@token-app/api';

// The `IssueToken` mutation requires an argument of type `IssueTokenVariables`:
const issueTokenVars: IssueTokenVariables = {
  userId: ..., 
  serviceId: ..., 
  providerId: ..., 
  tokenNumber: ..., 
};

// Call the `issueToken()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await issueToken(issueTokenVars);
// Variables can be defined inline as well.
const { data } = await issueToken({ userId: ..., serviceId: ..., providerId: ..., tokenNumber: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await issueToken(dataConnect, issueTokenVars);

console.log(data.queueToken_insert);

// Or, you can use the `Promise` API.
issueToken(issueTokenVars).then((response) => {
  const data = response.data;
  console.log(data.queueToken_insert);
});
```

### Using `IssueToken`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, issueTokenRef, IssueTokenVariables } from '@token-app/api';

// The `IssueToken` mutation requires an argument of type `IssueTokenVariables`:
const issueTokenVars: IssueTokenVariables = {
  userId: ..., 
  serviceId: ..., 
  providerId: ..., 
  tokenNumber: ..., 
};

// Call the `issueTokenRef()` function to get a reference to the mutation.
const ref = issueTokenRef(issueTokenVars);
// Variables can be defined inline as well.
const ref = issueTokenRef({ userId: ..., serviceId: ..., providerId: ..., tokenNumber: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = issueTokenRef(dataConnect, issueTokenVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.queueToken_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.queueToken_insert);
});
```

## UpdateTokenStatus
You can execute the `UpdateTokenStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [generated/index.d.ts](./index.d.ts):
```typescript
updateTokenStatus(vars: UpdateTokenStatusVariables): MutationPromise<UpdateTokenStatusData, UpdateTokenStatusVariables>;

interface UpdateTokenStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTokenStatusVariables): MutationRef<UpdateTokenStatusData, UpdateTokenStatusVariables>;
}
export const updateTokenStatusRef: UpdateTokenStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateTokenStatus(dc: DataConnect, vars: UpdateTokenStatusVariables): MutationPromise<UpdateTokenStatusData, UpdateTokenStatusVariables>;

interface UpdateTokenStatusRef {
  ...
  (dc: DataConnect, vars: UpdateTokenStatusVariables): MutationRef<UpdateTokenStatusData, UpdateTokenStatusVariables>;
}
export const updateTokenStatusRef: UpdateTokenStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateTokenStatusRef:
```typescript
const name = updateTokenStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateTokenStatus` mutation requires an argument of type `UpdateTokenStatusVariables`, which is defined in [generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateTokenStatusVariables {
  tokenId: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateTokenStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateTokenStatusData`, which is defined in [generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateTokenStatusData {
  queueToken_update?: QueueToken_Key | null;
}
```
### Using `UpdateTokenStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateTokenStatus, UpdateTokenStatusVariables } from '@token-app/api';

// The `UpdateTokenStatus` mutation requires an argument of type `UpdateTokenStatusVariables`:
const updateTokenStatusVars: UpdateTokenStatusVariables = {
  tokenId: ..., 
  status: ..., 
};

// Call the `updateTokenStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateTokenStatus(updateTokenStatusVars);
// Variables can be defined inline as well.
const { data } = await updateTokenStatus({ tokenId: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateTokenStatus(dataConnect, updateTokenStatusVars);

console.log(data.queueToken_update);

// Or, you can use the `Promise` API.
updateTokenStatus(updateTokenStatusVars).then((response) => {
  const data = response.data;
  console.log(data.queueToken_update);
});
```

### Using `UpdateTokenStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateTokenStatusRef, UpdateTokenStatusVariables } from '@token-app/api';

// The `UpdateTokenStatus` mutation requires an argument of type `UpdateTokenStatusVariables`:
const updateTokenStatusVars: UpdateTokenStatusVariables = {
  tokenId: ..., 
  status: ..., 
};

// Call the `updateTokenStatusRef()` function to get a reference to the mutation.
const ref = updateTokenStatusRef(updateTokenStatusVars);
// Variables can be defined inline as well.
const ref = updateTokenStatusRef({ tokenId: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateTokenStatusRef(dataConnect, updateTokenStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.queueToken_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.queueToken_update);
});
```

