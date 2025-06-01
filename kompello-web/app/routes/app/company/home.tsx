import type { Route } from "./+types/home"
import { useTitle } from "~/components/titleContext"
import { useEffect } from "react"
import { Outlet, useOutletContext } from "react-router"
import type { Company } from "~/lib/api/kompello"

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ]
}

export default function Home() {
    const { setTitle } = useTitle()
    const context = useOutletContext<Company>()
    console.log("Home context:", context)
    useEffect(() => {
        setTitle(`Home - ${context.name || "Company"}`)
    }, [])

    return (
        <div className="flex flex-col items-center justify-center min-h-svh">
            Home
            <Outlet context={context} />
        </div>
    )
}
