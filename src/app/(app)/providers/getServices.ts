import { parse } from "yaml";
import * as z from "zod";

const ServiceLink = z.object({
    name: z.string(),
    url: z.string(),
});

export type TServiceLink = z.infer<typeof ServiceLink>;

const ServiceAdmin = z.object({
    name: z.string(),
    username: z.string(),
    url: z.string(),
});

export type TServiceAdmin = z.infer<typeof ServiceAdmin>;

const Service = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().optional(),
    url: z.string().optional(),
    tags: z.array(z.string()).optional(),
    links: z.array(ServiceLink).optional(),
    admins: z.array(ServiceAdmin).optional(),
});

export type TService = z.infer<typeof Service>;

const ServicesSchema = z.object({
    services: z.array(Service).refine(
        (serviceList) => {
            const duplicateIds = serviceList.map((s) => s.id).filter((id, index, self) => self.indexOf(id) === index);
            return duplicateIds.length === serviceList.length;
        },
        { message: "Service IDs must be unique" },
    ),
});

export type TServicesSchema = z.infer<typeof ServicesSchema>;

export type TServicesResponse = z.SafeParseReturnType<unknown, TServicesSchema>;

export const getServices = async (): Promise<TServicesResponse | null> => {

    if(!process.env.SERVICES_YAML_URL) {
        return null;
    }

    const res = await fetch(process.env.SERVICES_YAML_URL, { next: { revalidate: process.env.SERVICES_YAML_CACHE_TIMEOUT ?? 30, tags: ["services"] } });

    const data = await res.text();

    const jsonData = await parse(data);

    const parsedData = await ServicesSchema.safeParseAsync(jsonData);

    return parsedData;
};
