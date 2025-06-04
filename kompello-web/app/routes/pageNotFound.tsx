import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import imgUrl from '/undraw_page-eaten.svg?url';
import { Button } from '~/components/ui/button';

export default function PageNotFound() {
    const { t } = useTranslation();
    return (
        <div>
            <h1 className="text-4xl font-bold text-center mt-20">{t("views.pageNotFound.title")}</h1>
            <p className="text-center mt-4">{t("views.pageNotFound.description")}</p>
            <div className="text-center mt-8">
                <Button className="mb-8" variant="link" asChild>
                    <a href="/">
                        <Home /> {t("views.pageNotFound.backToHome")}
                    </a>
                </Button>
                <img src={imgUrl} alt="Page not found illustration" className="mx-auto w-1/4 h-auto" />
            </div>
        </div>
    )
}