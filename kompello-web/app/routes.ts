import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    // Wrap the entire application in the providers. See components/providers.tsx
    layout("components/providers.tsx", [
        // Public routes that do not require authentication
        route("auth/login", "routes/auth/login.tsx"),

        // Private routes that require authentication
        layout("components/privateRoute.tsx", [
            layout("components/appLayout.tsx", [
                index("routes/app/home.tsx")
            ])
        ])
    ])
] satisfies RouteConfig;
