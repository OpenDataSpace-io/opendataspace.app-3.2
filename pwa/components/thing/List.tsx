import { type NextPage } from "next";
import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMutation } from "react-query";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import { MenuItem, Select } from "@mui/material";

import { Item } from "@/components/thing/Item";
import { Filters } from "@/components/thing/Filters";
import { Pagination } from "@/components/common/Pagination";
import { type Thing } from "@/types/Thing";
import { type PagedCollection } from "@/types/collection";
import { type FiltersProps, buildUriFromFilters } from "@/utils/thing";
import { type FetchError, type FetchResponse } from "@/utils/dataAccess";
import { useMercure } from "@/utils/mercure";
import { useTranslation } from 'next-i18next';

interface Props {
  data: PagedCollection<Thing> | null;
  hubURL: string | null;
  filters: FiltersProps;
  page: number;
}

const getPagePath = (page: number): string => `/things?page=${page}`;

export const List: NextPage<Props> = ({ data, hubURL, filters, page }) => {
  const collection = useMercure(data, hubURL);
  const router = useRouter();
  const { t } = useTranslation('common');

  const filtersMutation = useMutation<
    FetchResponse<PagedCollection<Thing>> | undefined,
    Error | FetchError,
    FiltersProps
    // @ts-ignore
  >(async (filters) => {
    router.push(buildUriFromFilters("/things", filters));
  });

  const [isLoading, setIsLoading] = React.useState(false);

  const handleFiltersChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    setIsLoading(true);
    const orderValue = event.target.value as string; // Annahme: Der Wert ist vom Typ string
    await filtersMutation.mutateAsync({ ...filters, order: orderValue ? { name: orderValue } : undefined });
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto max-w-7xl items-center justify-between p-6 lg:px-8">
      <Head>
        <title>{t('pageTitleThings')}</title>
      </Head>
      <div className="flex">
        <aside className="float-left w-[180px] mr-6" aria-label="Filters">
          <div className="font-semibold pb-2 border-b border-black text-lg mb-4">
            <FilterListOutlinedIcon className="w-6 h-6 mr-1"/>
            {t('things.list.filters')}
          </div>
          {/* @ts-ignore */}
          <Filters mutation={filtersMutation} filters={filters}/>
        </aside>
        <div className="float-right w-[1010px] justify-center">
          {!!collection && !!collection["hydra:member"] && (
            <>
              <div className="w-full flex px-8 pb-4 text-lg">
                <div className="float-left flex w-[400px]">
                  <span className="mr-2">{t('things.list.sortby')}</span>
                  <Select
                    data-testid="sort"
                    variant="standard"
                    value={filters.order?.name ?? ""}
                    displayEmpty
                    onChange={handleFiltersChange}
                    disabled={isLoading}
                  >
                    <MenuItem value="">{t('things.list.sortbyrelevance')}</MenuItem>
                    <MenuItem value="asc">{t('things.list.sortbynameasc')}</MenuItem>
                    <MenuItem value="desc">{t('things.list.sortbynamedesc')}</MenuItem>
                  </Select>
                </div>
                <span data-testid="nb-things" className="float-right mt-1">{collection["hydra:totalItems"]} {t('thingsfound')}</span>
              </div>
              {isLoading ? (
                <div className="w-full flex px-8 pb-4 text-lg">Loading...</div>
              ) : (
                <div className="grid grid-cols-5 gap-4">
                  {collection["hydra:member"].length !== 0 && collection["hydra:member"].map((thing) => (
                    <Item key={thing["@id"]} thing={thing}/>
                  ))}
                </div>
              )}
              <Pagination collection={collection} getPagePath={getPagePath} currentPage={page}/>
            </>
          ) || (
            <p className="w-full flex px-8 pb-4 text-lg">{t('nothingsfound') }</p>
          )}
        </div>
      </div>
    </div>
  );
};