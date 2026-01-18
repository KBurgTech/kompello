import { type JSX } from "react";
import { AuthProvider } from "./authContext";
import { Outlet } from "react-router";
import { TitleProvider } from "./titleContext";
import { ThemeProvider } from "./themeContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from "~/components/ui/sonner";
/**
 * Composes and provides application-wide context providers.
 *
 * The `Providers` component wraps its children with the `TitleProvider` `AuthProvider` `ThemeProvider`
 * contexts, ensuring that any descendant components have access to title management and
 * authentication state. The `Outlet` component is rendered as a placeholder for nested routes.
 *
 * @returns {JSX.Element} The composed context providers with nested route outlet.
 */
const queryClient = new QueryClient()
function Providers(): JSX.Element {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <TitleProvider>
                    <AuthProvider>
                        <Toaster position="top-center" richColors={true} closeButton={true}/>
                        <Outlet />
                    </AuthProvider>
                </TitleProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default Providers;
