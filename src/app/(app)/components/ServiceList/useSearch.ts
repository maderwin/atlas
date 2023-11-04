import { Fzf } from "fzf";
import { useMemo } from "react";
import { TService } from "../../providers/getServices";
import { useSearchContext } from "../SearchContext/SearchContext";

export const useSearch = ({ services }: { services: TService[] }) => {
    const { filteredSearchString } = useSearchContext();

    const [defaultSearch, fastSearch, tagSearch] = useMemo(
        () => [
            new Fzf(services, {
                //
                selector: (
                    { name, description, tags }, //
                ) => `${name} ${description ?? ""} ${tags?.join(" ") ?? ""}`,
                fuzzy: "v2",
            }),
            new Fzf(services, {
                //
                selector: (
                    { name, description, tags }, //
                ) => `${name} ${description ?? ""} ${tags?.join(" ") ?? ""}`,
                fuzzy: "v1",
            }),
            new Fzf(services, {
                //
                selector: (
                    { tags }, //
                ) => tags?.map((t) => `[${t}]`)?.join(" ") ?? "",
                fuzzy: false,
            }),
        ],
        [services],
    );

    const filteredServices = useMemo(() => {
        if (filteredSearchString.length === 0) {
            return [];
        }

        if (filteredSearchString.match(/^\[.*\]$/)) {
            return tagSearch.find(filteredSearchString);
        }

        if (filteredSearchString.length < 3) {
            return fastSearch.find(filteredSearchString);
        }

        return defaultSearch.find(filteredSearchString);
    }, [services, filteredSearchString, defaultSearch, fastSearch, tagSearch]);

    return { services, filteredServices };
};
