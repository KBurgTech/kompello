import { createContext, useContext, type JSX } from "react";
import { KompelloApi } from "~/lib/api/kompelloApi";
import { Skeleton } from "./ui/skeleton";
import { Loader2 } from "lucide-react";
import type { User } from "~/lib/api/kompello";
import { useQuery, useQueryClient } from '@tanstack/react-query'

/**
 * Represents the authentication context for the application.
 *
 * @property user - The currently authenticated user object, or `null` if not authenticated.
 * @property login - Asynchronous function to authenticate a user with a username and password.
 *                   Returns a promise that resolves to `true` if login is successful, otherwise `false`.
 * @property logout - Function to log out the current user.
 */
interface AuthContextType {
    user: User | null;
    sessionLoading: boolean | null;
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
    const queryClient = useQueryClient();
    const currentUserQuery = useQuery({
        queryKey: ["currentuser"],
        queryFn: async () => {
            try {
                await KompelloApi.currentSessionApi.allauthClientV1AuthSessionGet({ client: "browser" });
                const user = await KompelloApi.userApi.usersMe();
                return user;
            } catch (error) {
                return null;
            }
        }
    })
    

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
            await KompelloApi.authenticationAccountApi.allauthClientV1AuthLoginPost({
                client: "browser",
                login: {
                    username: username,
                    password: password,
                    email: "",
                    phone: ""
                },
            });
            queryClient.invalidateQueries({ queryKey: ["currentuser"] });
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
        KompelloApi.currentSessionApi.allauthClientV1AuthSessionDelete({ client: "browser" })
            .catch(() => {
                queryClient.invalidateQueries({ queryKey: ["currentuser"] });
            });
    }

    return (
        <AuthContext.Provider value={{ user: currentUserQuery.data, sessionLoading: currentUserQuery.isLoading, login, logout }}>
            {currentUserQuery.isLoading ? <Loading /> : children}
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
