import { FC, PropsWithChildren } from "react";
import type { Metadata } from "next";
import { Fira_Code as FiraCode } from "next/font/google";

import "./style/globals.css";
import { Theme } from "./components/Theme/Theme";

const firaCode = FiraCode({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
    title: "Atlas",
    description: "Services directory",
};

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
    <Theme>
        <html lang="en">
            <body className={firaCode.className}>{children}</body>
        </html>
    </Theme>
);

export default RootLayout;
