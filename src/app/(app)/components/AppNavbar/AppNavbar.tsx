"use client";
import { FC, FormEventHandler, useCallback } from "react";
import Link from "next/link";
import { DarkThemeToggle, Navbar, TextInput } from "flowbite-react";
import cn from "classnames";
import { FaRegTimesCircle, FaSearch } from "react-icons/fa";
import { PiTriangleLight } from "react-icons/pi";
import { HiOutlineEye } from "react-icons/hi";
import { useSearchContext } from "../SearchContext/SearchContext";

export const AppNavbar: FC = () => {
    const { searchString, setSearchString } = useSearchContext();

    const handleChange: FormEventHandler<HTMLInputElement> = useCallback(
        (event) => {
            setSearchString(event.currentTarget?.value || "");
        },
        [setSearchString],
    );

    const handleClear = useCallback(() => {
        setSearchString("");
    }, [setSearchString]);

    return (
        <Navbar fluid border className={cn("fixed left-0 top-0 z-20 w-full")}>
            <Navbar.Brand as={Link} href="/">
                <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
                    <span className="inline-grid h-8 w-8 place-items-center align-bottom [grid-template-areas:'stack']">
                        <PiTriangleLight className="h-8 w-8 [grid-area:stack]" />
                        <HiOutlineEye className="h-5 w-5 [grid-area:stack]" />
                    </span>
                    <span className="hidden sm:inline">&nbsp;Atlas</span>
                </span>
            </Navbar.Brand>
            <div className="flex flex-row items-stretch">
                <TextInput
                    icon={FaSearch}
                    placeholder="Search service"
                    value={searchString}
                    onInput={handleChange}
                    onEmptied={handleChange}
                />
                <div
                    className={cn(
                        "z-10",
                        "-ml-10",
                        "cursor-pointer",
                        "fill-gray-500",
                        "w-10",
                        "flex",
                        "items-center",
                        "justify-center",
                        "opacity-50",
                        "hover:opacity-100",
                        "transition-opacity",
                    )}
                    onClick={handleClear}
                >
                    <FaRegTimesCircle />
                </div>
            </div>
            <DarkThemeToggle />
        </Navbar>
    );
};
