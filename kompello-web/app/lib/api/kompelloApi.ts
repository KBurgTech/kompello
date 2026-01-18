import { AuthenticationAccountApi } from "./allauth/apis/AuthenticationAccountApi";
import { Configuration, type Middleware, type RequestContext, type ResponseContext } from "./allauth/runtime";
import { AuthenticationCurrentSessionApi } from "./allauth/apis";
import { CompaniesApi, CurrenciesApi, CustomersApi, CustomFieldsApi, ItemsApi, SystemApi, UnitsApi, UsersApi } from "./kompello";
import { Configuration as KompelloConfiguration } from "./kompello/runtime";

// Wrapper for the allauth API to handle session tokens and login state automatically for all API calls

// Middleware to handle session cookie for all API calls
// This middleware ensures that the session cookie is included in the request headers
const sessionTokenMiddleware: Middleware = {
    pre: async (context: RequestContext) => {
        const additionalHeaders = {}

        // If the request is not GET or HEAD request, add the CSRF token to the headers
        if(context.init.method !== "GET" && context.init.method !== "HEAD") {
            additionalHeaders["X-CSRFTOKEN"] = await getCsrfToken();
        }
        return {
            ...context,
            init: {
                ...context.init,
                credentials: "include", // Ensure credentials are included
                headers: {
                    ...context.init.headers,
                    ...additionalHeaders
                }
            }
        }
    }
}

async function getCsrfToken(): Promise<string | undefined> {
    return (await kompelloApi.systemApi.systemGetCsrfToken()).csrfToken;
}

const configBase = {
    basePath: "http://localhost:8000", // TODO make this configurable
    middleware: [
        sessionTokenMiddleware
    ]
}

const allauthConfig = new Configuration(configBase);
const kompelloConfig = new KompelloConfiguration(configBase);

class KompelloApiImpl {
    authenticationAccountApi: AuthenticationAccountApi;
    currentSessionApi: AuthenticationCurrentSessionApi;
    systemApi: SystemApi;
    companyApi: CompaniesApi;
    customersApi: CustomersApi;
    customFieldsApi: CustomFieldsApi;
    currenciesApi: CurrenciesApi;
    unitsApi: UnitsApi;
    itemsApi: ItemsApi;
    userApi: UsersApi;

    constructor() {
        this.authenticationAccountApi = new AuthenticationAccountApi(allauthConfig);
        this.currentSessionApi = new AuthenticationCurrentSessionApi(allauthConfig);
        this.systemApi = new SystemApi(kompelloConfig);
        this.companyApi = new CompaniesApi(kompelloConfig);
        this.customersApi = new CustomersApi(kompelloConfig);
        this.customFieldsApi = new CustomFieldsApi(kompelloConfig);
        this.currenciesApi = new CurrenciesApi(kompelloConfig);
        this.unitsApi = new UnitsApi(kompelloConfig);
        this.itemsApi = new ItemsApi(kompelloConfig);
        this.userApi = new UsersApi(kompelloConfig);
    }
}

const kompelloApi = new KompelloApiImpl();

export {
    kompelloApi as KompelloApi,
};