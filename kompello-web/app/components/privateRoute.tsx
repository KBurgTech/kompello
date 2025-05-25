import { useEffect, type JSX } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./authContext";

/**
 * A React component that protects routes by checking user authentication.
 * If the user is not authenticated (`auth.user` is falsy), it redirects to the login page (`/auth/login`).
 * Otherwise, it renders the nested routes via `<Outlet />`.
 *
 * @component
 * @returns {JSX.Element} The protected route outlet or a redirect to login.
 *
 * @remarks
 * This component should be used to wrap routes that require authentication.
 * It relies on `useAuth` for authentication state and `useNavigate` for navigation.
 */
function PrivateRoute(): JSX.Element {
    const navigate = useNavigate();
    const auth = useAuth();

    useEffect(() => {
        if (!auth.user) {
            navigate("/auth/login");
        }
    }, [auth.user]);

    return <Outlet />;
}

export default PrivateRoute;
