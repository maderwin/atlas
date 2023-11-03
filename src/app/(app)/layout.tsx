import { FC, PropsWithChildren } from "react";
import cn from "classnames";
import { AppNavbar } from "./components/AppNavbar/AppNavbar";
import { SearchContextProvider } from "./components/SearchContext/SearchContext";

const AppLayout: FC<PropsWithChildren> = ({ children }) => (
    <div className={cn("bg-white text-black dark:bg-gray-800 dark:text-white overflow-hidden w-screen h-screen")}>
        <SearchContextProvider>
            <AppNavbar />
            {children}
        </SearchContextProvider>
    </div>
);

export default AppLayout;
