import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useTranslation } from 'next-i18next';

import { signOut } from "@/utils/security";

export const Header = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { t, i18n } = useTranslation('common');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onToggleLanguageClick = (newLocale: string) => {
    const { pathname, asPath, query } = router
    router.push({ pathname, query }, asPath, { locale: newLocale })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const clientSideLanguageChange = (newLocale: string) => {
    i18n.changeLanguage(newLocale);
  }

  const changeTo = router.locale === 'en' ? 'de' : 'en'
  // const changeTo = i18n.resolvedLanguage === 'en' ? 'de' : 'en'

  if (router.pathname === "/" || router.pathname.match(/^\/admin/)) return <></>;

  return (
    <header className="bg-neutral-100 sticky top-0 z-10">
      <nav className="container mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="block text-4xl font-bold">
          <Link href="/things" className="text-gray-700 hover:text-gray-900">
            OpenDataSpace
          </Link>
        </div>
        <div className="lg:flex lg:flex-1 lg:justify-end lg:gap-x-12">
          {/* Language Selection */}
          <select
            value={i18n.language}
            onChange={(e) => clientSideLanguageChange(e.target.value)}
            className="font-semibold text-gray-900"
          >
            <option value="en">English</option>
            <option value="de">Deutsch</option>
          </select>
          <Link href="/" locale={changeTo}>
            <button>{t('change-locale', { changeTo })}</button>
          </Link>
        </div>
        <div className="lg:flex lg:flex-1 lg:justify-end lg:gap-x-12">
          {/* @ts-ignore */}
          {!!session && !session.error && (
            <a href="#" className="font-semibold text-gray-900" role="menuitem" onClick={(e) => {
              e.preventDefault();
              signOut(session);
            }}>
              Sign out
            </a>
          ) || (
            <a href="#" className="font-semibold text-gray-900" role="menuitem" onClick={(e) => {
              e.preventDefault();
              signIn("keycloak");
            }}>
              <PersonOutlineIcon className="w-6 h-6 mr-1"/>
              Log in
            </a>
          )}
        </div>
      </nav>
    </header>
  )
}
