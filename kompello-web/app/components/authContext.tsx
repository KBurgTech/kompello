import { createContext, useContext, useState, useEffect, type JSX } from "react";
import type { AuthenticatedResponse } from "~/lib/api/allauth";
import { AllauthApi, LOGIN_CHANGE_EVENT } from "~/lib/api/allauthApi";
import { Skeleton } from "./ui/skeleton";
import { Loader2 } from "lucide-react";

/**
 * Represents the authentication context for the application.
 *
 * @property user - The currently authenticated user object, or `null` if not authenticated.
 * @property login - Asynchronous function to authenticate a user with a username and password.
 *                   Returns a promise that resolves to `true` if login is successful, otherwise `false`.
 * @property logout - Function to log out the current user.
 */
interface AuthContextType {
    user: any;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Renders a loading skeleton UI for authentication-related components.
 *
 * This component displays placeholder elements to indicate that content is loading.
 * It uses the `Skeleton` component to mimic the layout of the final content,
 * providing a better user experience during asynchronous operations.
 *
 * @returns {JSX.Element} A React element displaying loading skeletons.
 */
function Loading(): JSX.Element {
    return <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm space-y-3">
            <Loader2 className="animate-spin" />
            <Skeleton className="h-[125px] w-[70%] rounded-xl" />
            <Skeleton className="h-4 w-[auto] rounded-xl" />
            <Skeleton className="h-4 w-[80%] rounded-xl" />
            <Skeleton className="h-4 w-[90%] rounded-xl" />
        </div>
    </div>
}

/**
 * Provides authentication context to its children, managing user session state and authentication actions.
 *
 * This provider handles:
 * - Checking and maintaining the current authentication session.
 * - Exposing the authenticated user object.
 * - Providing `login` and `logout` methods for authentication.
 * - Displaying a loading indicator while session state is being determined.
 *
 * @param children - The React children components that will have access to the authentication context.
 * @returns The authentication context provider wrapping the children.
 *
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState<any>(null);
    const [sessionLoading, setSessionLoading] = useState<boolean>(false);

    /**
     * Checks the current authentication session by calling the backend API.
     * 
     * - Prevents concurrent session checks if one is already in progress.
     * - Sets the loading state while the session is being checked.
     * - On success (HTTP 200), updates the user state with the authenticated user data.
     * - On failure or error, resets the user state to null.
     * - Always resets the loading state after completion.
     *
     * @async
     * @returns {Promise<void>} Resolves when the session check is complete.
     */
    async function checkSession(): Promise<void> {
        if (sessionLoading) return; // Prevent multiple calls
        setSessionLoading(true);
        let response: AuthenticatedResponse;

        try {
            response = await AllauthApi.currentSessionApi.allauthClientV1AuthSessionGet({ client: "browser" });
        } catch (error) {
            setUser(null);
            setSessionLoading(false);
            return;
        }
        if (response.status === 200) {
            setUser(response.data.user);
        } else {
            setUser(null);
        }
        setSessionLoading(false);
    }

    // Check session on initial load
    useEffect(() => {
        checkSession();
    }, []);

    // Listen for login change events to re-check the session
    document.addEventListener(LOGIN_CHANGE_EVENT, async () => {
        await checkSession();
    });

    /**
     * Attempts to log in a user with the provided username and password.
     *
     * Sends a login request to the authentication API using the given credentials.
     * If the login is successful (HTTP 200), dispatches a `LOGIN_CHANGE_EVENT`
     * to notify listeners of the authentication state change.
     *
     * @param username - The username of the user attempting to log in.
     * @param password - The password of the user attempting to log in.
     * @returns {Promise<boolean>} A promise that resolves to `true` if login is successful, otherwise `false`.
     */
    async function login(username: string, password: string): Promise<boolean> {
        try {
            await AllauthApi.authenticationAccountApi.allauthClientV1AuthLoginPost({
                client: "browser",
                login: {
                    username: username,
                    password: password,
                    email: "",
                    phone: ""
                },
            });
            document.dispatchEvent(new CustomEvent(LOGIN_CHANGE_EVENT));
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Logs out the current user by calling the Allauth API to delete the current session.
     * If the API call fails, dispatches a `LOGIN_CHANGE_EVENT` to notify the application of the login state change.
     *
     * @returns {void}
     */
    function logout(): void {
        AllauthApi.currentSessionApi.allauthClientV1AuthSessionDelete({ client: "browser" })
            .catch(() => {
                document.dispatchEvent(new CustomEvent(LOGIN_CHANGE_EVENT));
            });
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {sessionLoading ? <Loading /> : children}
        </AuthContext.Provider>
    );
}



/**
 * Custom hook to access the authentication context.
 *
 * @returns The current authentication context value.
 * @throws {Error} If used outside of an `AuthProvider`.
 *
 * @example
 * const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
