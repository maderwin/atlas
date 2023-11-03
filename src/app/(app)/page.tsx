import Link from "next/link";
import { FC, use } from "react";
import cn from "classnames";
import { ParseIssuesList } from "./components/ParseIssuesList/ParseIssuesList";
import { ServiceList } from "./components/ServiceList/ServiceList";
import { getServices } from "./providers/getServices";

const IndexPage: FC = () => {
    const servicesInfo = use(getServices());

    if (!servicesInfo) {
        return null;
    }

    if (servicesInfo.success === false) {
        return <ParseIssuesList issues={servicesInfo.error.issues} />;
    }

    return (
        <main className="box-border flex h-screen flex-col items-center justify-between overflow-y-scroll px-8 py-24 sm:px-24">
            <div className="max-w-6xl">
                <ServiceList data={servicesInfo.data} />
                {process.env.SERVICES_YAML_URL && (
                    <div className="mt-20 text-center italic">
                        Generated from{" "}
                        <Link
                            href={process.env.SERVICES_YAML_URL}
                            target="_blank"
                            rel="nofollow"
                            className={cn("text-blue-600", "hover:underline", "dark:text-blue-400")}
                        >
                            YAML
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
};

export default IndexPage;
