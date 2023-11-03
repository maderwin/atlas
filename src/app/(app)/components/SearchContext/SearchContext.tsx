"use client";
import { useState, createContext, FC, PropsWithChildren, useContext, useMemo } from "react";

const getSearchContextValue = () => {
    const [searchString, setSearchString] = useState("");

    const filteredSearchString = useMemo(
        () =>
            searchString
                .toLowerCase()
                .trim()
                .replaceAll(/[^\w\d\[\]]/g, " ")
                .replaceAll(/\s+/g, " "),

        [searchString],
    );

    return {
        searchString,
        filteredSearchString,
        setSearchString,
    };
};

const SearchContext = createContext({} as ReturnType<typeof getSearchContextValue>);

export const SearchContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const value = getSearchContextValue();

    return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

export const useSearchContext = () => {
    const value = useContext(SearchContext);

    if (!value) {
        throw new Error("useSearchContext must be used within a SearchContextProvider");
    }

    return value;
};
