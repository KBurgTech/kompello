import { type JSX } from "react";
import { AuthProvider } from "./authContext";
import { Outlet } from "react-router";
import { TitleProvider } from "./titleContext";

/**
 * Composes and provides application-wide context providers.
 *
 * The `Providers` component wraps its children with the `TitleProvider` and `AuthProvider`
 * contexts, ensuring that any descendant components have access to title management and
 * authentication state. The `Outlet` component is rendered as a placeholder for nested routes.
 *
 * @returns {JSX.Element} The composed context providers with nested route outlet.
 */
function Providers(): JSX.Element {
    return <TitleProvider>
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    </TitleProvider>;
}

export default Providers;
