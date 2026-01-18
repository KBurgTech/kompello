import { useTitle } from "~/components/titleContext"
import { useEffect } from "react"
import { useOutletContext } from "react-router"
import type { Company } from "~/lib/api/kompello"
import { useTranslation } from "react-i18next"
import CompanyBasicSettings from "~/components/company/companyBasicSettings"
import MemberSettings from "~/components/company/companyMembersSettings"
import CompanyCustomFieldsSettings from "~/components/company/companyCustomFieldsSettings"

export default function Settings() {
    const { setTitle } = useTitle()
    const context = useOutletContext<Company>()
    const { t } = useTranslation();

    useEffect(() => {
        setTitle(`${t("views.companySettings.settings")} - ${context.name || "Company"}`)
    }, [context.name])

    return (
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="grid grid-cols-1 gap-2 md:col-span-3">
                <CompanyBasicSettings company={context} />
                <MemberSettings company={context} />
                <CompanyCustomFieldsSettings company={context} />
            </div>
        </div>
    )
}
