import { Button } from "~/components/ui/button"

import type { Route } from "./+types/appEntry"
import { useTitle } from "~/components/titleContext"
import { useEffect } from "react"
import { KompelloApi } from "~/lib/api/kompelloApi"
import type { Company } from "~/lib/api/kompello"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ]
}

export async function clientLoader() {
    const data = await KompelloApi.companyApi.companiesList()
    return data;
}

export default function Home({ loaderData }: { loaderData: Company[] }) {
    const { setTitle } = useTitle()
    const navigate = useNavigate()
    const { t } = useTranslation();

    useEffect(() => {
        setTitle("Home")
    }, [])

    function renderCompany(company: Company) {
        return (
            <Card className="w-full max-w-sm" key={company.uuid}>
                <CardHeader>
                    <CardTitle>{company.name}</CardTitle>
                    <CardDescription>{company.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => navigate(`/${company.uuid}`)}>{t("actions.open")}</Button>
                </CardContent>
            </Card>
        )
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-svh">
            <h1 className="text-2xl font-bold mb-4">{t("views.appEntry.title")}</h1>
            <p className="text-lg mb-8">{t("views.appEntry.description")}</p>
            {loaderData.map(renderCompany)}
        </div>
    )
}
