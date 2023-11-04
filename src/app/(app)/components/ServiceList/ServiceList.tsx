"use client";

import { FC } from "react";
import { TServicesSchema } from "../../providers/getServices";
import { ServiceEntry } from "./ServiceEntry/ServiceEntry";
import { useSearch } from "./useSearch";




export const ServiceList: FC<{ data: TServicesSchema }> = ({ data: { services } }) => {
    const { filteredServices } = useSearch({ services });

    if (services.length === 0) {
        return <div className="text-center">No services found.</div>;
    }

    if (filteredServices.length === 0) {
        return <div className="flex flex-col gap-10">
        {services.map((service) => (
            <ServiceEntry key={service.id} service={service} />
        ))}
    </div>;
    }

    return (
        <div className="flex flex-col gap-10">
            {filteredServices.map(({item: service, score}) => (
                <ServiceEntry key={service.id} service={service} score={score} />
            ))}
        </div>
    );
};
