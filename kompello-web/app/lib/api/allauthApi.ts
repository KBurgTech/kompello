import { AuthenticationAccountApi } from "./allauth/apis/AuthenticationAccountApi";
import { Configuration, type Middleware, type RequestContext, type ResponseContext } from "./allauth/runtime";
import { AuthenticationCurrentSessionApi } from "./allauth/apis";

// Wrapper for the allauth API to handle session tokens and login state automatically for all API calls


const LOGIN_CHANGE_EVENT = "KOMPELLO_LOGIN_CHANGE_EVENT";

// Middleware to handle session cookie for all API calls
// This middleware ensures that the session cookie is included in the request headers
const sessionTokenMiddleware: Middleware = {
    pre: async (context: RequestContext) => {
        return {
            ...context,
            init: {
                ...context.init,
                credentials: "include", // Ensure credentials are included
                headers: {
                    ...context.init.headers,
                }
            }
        }
    }
}

const configBase = {
    basePath: "http://localhost:8000", // TODO make this configurable
    middleware: [
        sessionTokenMiddleware
    ]
}

// Config for all standard APIs
const config = new Configuration(configBase);


class AllauthApiImpl {
    authenticationAccountApi: AuthenticationAccountApi;
    currentSessionApi: AuthenticationCurrentSessionApi;

    constructor() {
        this.authenticationAccountApi = new AuthenticationAccountApi(config);
        this.currentSessionApi = new AuthenticationCurrentSessionApi(config);
    }
}
const allauthApi = new AllauthApiImpl();

export {
    allauthApi as AllauthApi,
    LOGIN_CHANGE_EVENT
};