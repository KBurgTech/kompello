import { Button } from "~/components/ui/button"

import type { Route } from "./+types/home"
import { useTitle } from "~/components/titleContext"
import { useEffect } from "react"

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ]
}

export default function Home() {
    const { setTitle } = useTitle()

    useEffect(() => {
        setTitle("Home")
    }, [])

    return (
        <div className="flex flex-col items-center justify-center min-h-svh">
            <Button>Lorem Ipsum</Button>
        </div>
    )
}
