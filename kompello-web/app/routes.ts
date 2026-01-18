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
                    layout("routes/app/company/customers/layout.tsx", 
                        prefix("customers", [
                            index("routes/app/company/customers/list.tsx"),
                            route(":customerId", "routes/app/company/customers/detail.tsx"),
                        ])
                    ),
                    layout("routes/app/company/currencies/layout.tsx", 
                        prefix("currencies", [
                            index("routes/app/company/currencies/list.tsx"),
                            route(":currencyId", "routes/app/company/currencies/detail.tsx"),
                        ])
                    ),
                    layout("routes/app/company/units/layout.tsx", 
                        prefix("units", [
                            index("routes/app/company/units/list.tsx"),
                            route(":unitId", "routes/app/company/units/detail.tsx"),
                        ])
                    ),
                    layout("routes/app/company/items/layout.tsx", 
                        prefix("items", [
                            index("routes/app/company/items/list.tsx"),
                            route(":itemId", "routes/app/company/items/detail.tsx"),
                        ])
                    ),
                ])
            ),
            route("account", "routes/app/account.tsx"),
        ])
    ])
] satisfies RouteConfig;
