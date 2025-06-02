import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
    // Wrap the entire application in the providers. See components/providers.tsx
    layout("components/providers.tsx", [
        // Public routes that do not require authentication
        route("auth/login", "routes/auth/login.tsx"),

        // Private routes that require authentication
        layout("components/privateRoute.tsx", [
            index("routes/app/appEntry.tsx"),
            layout("components/appLayout.tsx",
                prefix(":companyId", [
                    index("routes/app/company/home.tsx"),
                    route("/settings", "routes/app/company/settings.tsx"),
                ])
            ),
            route("account", "routes/app/account.tsx"),
        ])
    ])
] satisfies RouteConfig;
