import { useOutletContext, Outlet } from "react-router";
import type { Company } from "~/lib/api/kompello";

export default function UnitsLayout() {
    const company = useOutletContext<Company>();

    return <Outlet context={company} />;
}
