"use client";

import cn from "classnames";
import type { CustomFlowbiteTheme } from "flowbite-react";
import { Flowbite } from "flowbite-react";
import { FC, PropsWithChildren } from "react";

const customTheme: CustomFlowbiteTheme = {
    textInput: {
        field: {
            input: {
                colors: {
                    gray: cn(
                        "bg-gray-50",
                        "border-gray-300",
                        "text-gray-900",
                        "focus:border-black-500",
                        "focus:ring-black-500",
                        "dark:border-gray-600",
                        "dark:bg-gray-700",
                        "dark:text-white",
                        "dark:placeholder-gray-400",
                        "dark:focus:border-cyan-500",
                        "dark:focus:ring-cyan-500",
                    ),
                    info: cn(
                        "border-black-500",
                        "bg-black-50",
                        "text-black-900",
                        "placeholder-black-700",
                        "focus:border-black-500",
                        "focus:ring-black-500",
                        "dark:border-cyan-400",
                        "dark:bg-cyan-100",
                        "dark:focus:border-cyan-500",
                        "dark:focus:ring-cyan-500",
                    ),
                },
            },
        },
    },
};

export const Theme: FC<PropsWithChildren> = ({ children }) => (
    <Flowbite theme={{ theme: customTheme }}>{children}</Flowbite>
);
