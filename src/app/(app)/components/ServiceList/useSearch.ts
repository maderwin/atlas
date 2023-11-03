import { distance } from "fastest-levenshtein";
import { useMemo } from "react";
import { TService } from "../../providers/getServices";
import { useSearchContext } from "../SearchContext/SearchContext";

function isUnique<T>(id: T, idx: number, list: T[]) {
    return list.indexOf(id) === idx;
}

export const useSearch = ({ services }: { services: TService[] }) => {
    const { filteredSearchString } = useSearchContext();

    const servicesMap = useMemo(() => {
        const map = new Map<number, TService>();

        services.forEach((service) => {
            map.set(service.id, service);
        });

        return map;
    }, [services]);

    const searchMap = useMemo(() => {
        const indexMap = new Map<string, number[]>();

        services.forEach((service) => {
            const words = `${service.name} ${service.description}`
                .replaceAll(/[^\w\d]+/gm, " ")
                .replaceAll(/\s+/gm, " ")
                .toLowerCase()
                .split(" ");

            const tags = service.tags?.map((tag) => `[${tag}]`) ?? [];

            [...words, ...tags].forEach((word) => {
                if (word.length < 2) {
                    return;
                }

                if (!indexMap.has(word)) {
                    indexMap.set(word, []);
                }

                const idxList = indexMap.get(word) ?? [];

                indexMap.set(word, [...idxList, service.id].filter(isUnique));
            });
        });

        return [...indexMap.entries()] as [string, number[]][];
    }, [services]);

    const filteredServices = useMemo(() => {
        const words = filteredSearchString.split(" ");

        if (filteredSearchString.length < 2) {
            return services;
        }

        const scoreMap = new Map<number, number>();

        searchMap.forEach(([key, idList]) => {
            words.forEach((word) => {
                const score = word.match(/\[[\w\d]+\]/)
                    ? Number(key === word)
                    : 1 - distance(key, word) / Math.max(key.length, word.length);

                if (score < 0.5) {
                    return;
                }

                idList.forEach((id) => {
                    scoreMap.set(id, (scoreMap.get(id) ?? 0) + score / words.length);
                });
            });
        });

        return [...scoreMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([id, score]) => servicesMap.has(id) && { ...servicesMap.get(id), score })
            .filter((service): service is TService & { score: number } => Boolean(service && service.score > 0.5));
    }, [searchMap, filteredSearchString]);

    return { filteredServices };
};
