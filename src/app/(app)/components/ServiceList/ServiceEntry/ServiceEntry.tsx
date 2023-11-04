"use client";

import cn from "classnames";
import { Badge } from "flowbite-react";
import Link from "next/link";
import { FC, useCallback, useMemo } from "react";
import { TService, TServiceAdmin, TServiceLink } from "../../../providers/getServices";
import { useSearchContext } from "../../SearchContext/SearchContext";

const mdash = "\u2014";

const classBadgeDefault = cn(
    "bg-gray-200",
    "hover:bg-gray-300",
    "dark:text-white",
    "dark:bg-gray-600",
    "dark:hover:bg-gray-500",
);

const classBadgeSelected = cn(
    "bg-yellow-200",
    "hover:bg-yellow-300",
    "dark:text-white",
    "dark:bg-yellow-600",
    "dark:hover:bg-yellow-500",
);

const Tag: FC<{ tag: string }> = ({ tag }) => {
    const { filteredSearchString, setSearchString } = useSearchContext();

    const tagString = `[${tag}]`;

    const isSelected = useMemo(() => filteredSearchString.includes(tagString), [filteredSearchString, tagString]);

    const handleClick = useCallback(() => {  
        setSearchString(isSelected ? filteredSearchString.replace(tagString, " ") : tagString);
    }, [filteredSearchString, setSearchString, tagString]);

    return (
        <Badge
            className={cn(
                "inline",
                "cursor-pointer",
                "text-black",
                isSelected ? classBadgeSelected : classBadgeDefault,
            )}
            onClick={handleClick}
        >
            {tag}
        </Badge>
    );
};

const ServiceName: FC<{ service: TService }> = ({ service }) => {
    if (!service.url) {
        return <div>{service.name}</div>;
    }

    return (
        <Link
            href={service.url}
            rel="nofollow"
            target="_blank"
            className={cn("text-blue-600", "hover:underline", "dark:text-blue-400")}
        >
            {service.name}
        </Link>
    );
};

const ServiceTags: FC<{ tags: string[] }> = ({ tags }) => (
    <>
        {tags.map((tag) => (
            <div key={tag}>
                <Tag tag={tag} />
            </div>
        ))}
    </>
);

const ServiceLinks: FC<{ links: TServiceLink[] }> = ({ links }) => (
    <ul>
        {links.map(({ name, url }, index) => (
            <li key={index}>
                <Link
                    href={url}
                    target="_blank"
                    rel="nofollow"
                    className={cn("text-blue-600", "hover:underline", "dark:text-blue-400")}
                >
                    {name}
                </Link>
            </li>
        ))}
    </ul>
);

const ServiceAdmins: FC<{ admins: TServiceAdmin[] }> = ({ admins }) => (
    <ul>
        {admins.map(({ name, username, url }, index) => (
            <li key={index}>
                {url ? (
                    <Link
                        href={url}
                        target="_blank"
                        rel="nofollow"
                        className={cn("text-blue-600", "hover:underline", "dark:text-blue-400")}
                    >
                        {name ? `${name} (@${username})` : `@{username}`}
                    </Link>
                ) : (
                    <>{name ? `${name} (@${username})` : `@{username}`}</>
                )}
            </li>
        ))}
    </ul>
);

export const ServiceEntry: FC<{ service: TService, score?: number}> = ({ service, score }) => (
    <div className="rounded-md p-5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
        <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
                <div className="relative flex flex-row gap-2">
                    <ServiceName service={service} />

                    {service.tags && <ServiceTags tags={service.tags} />}

                    {typeof score !== "undefined" && (
                        <div className="absolute right-0 text-xs text-gray-400 dark:text-gray-600">
                            {score.toFixed(3)}
                        </div>
                    )}
                </div>
            </div>
            <div className="col-span-12 md:col-span-8 lg:col-span-6">{service.description ?? mdash}</div>
            <div className="col-span-12 md:col-span-4 lg:col-span-3">
                {service.links ? <ServiceLinks links={service.links} /> : mdash}
            </div>
            <div className="col-span-12 lg:col-span-3">
                {service.admins ? <ServiceAdmins admins={service.admins} /> : mdash}
            </div>
        </div>
    </div>
);
