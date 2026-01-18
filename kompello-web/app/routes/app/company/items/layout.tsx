import { useOutletContext, Outlet } from "react-router";
import type { Company } from "~/lib/api/kompello";

export default function ItemsLayout() {
    const company = useOutletContext<Company>();

    return <Outlet context={company} />;
}
