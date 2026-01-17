# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { upsertUser, getCurrentUser, listServiceProviders, getProviderServices, issueToken, getMyTokens, updateTokenStatus } from '@token-app/api';


// Operation UpsertUser:  For variables, look at type UpsertUserVars in ../index.d.ts
const { data } = await UpsertUser(dataConnect, upsertUserVars);

// Operation GetCurrentUser:  For variables, look at type GetCurrentUserVars in ../index.d.ts
const { data } = await GetCurrentUser(dataConnect, getCurrentUserVars);

// Operation ListServiceProviders: 
const { data } = await ListServiceProviders(dataConnect);

// Operation GetProviderServices:  For variables, look at type GetProviderServicesVars in ../index.d.ts
const { data } = await GetProviderServices(dataConnect, getProviderServicesVars);

// Operation IssueToken:  For variables, look at type IssueTokenVars in ../index.d.ts
const { data } = await IssueToken(dataConnect, issueTokenVars);

// Operation GetMyTokens:  For variables, look at type GetMyTokensVars in ../index.d.ts
const { data } = await GetMyTokens(dataConnect, getMyTokensVars);

// Operation UpdateTokenStatus:  For variables, look at type UpdateTokenStatusVars in ../index.d.ts
const { data } = await UpdateTokenStatus(dataConnect, updateTokenStatusVars);


```