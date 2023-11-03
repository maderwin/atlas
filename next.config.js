/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true,
    },
    webpack: (config) => {
        const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.(".svg"));

        config.module.rules.push(
            {
                test: /\.ya?ml$/,
                use: "js-yaml-loader",
            },
            {
                ...fileLoaderRule,
                test: /\.svg$/i,
                resourceQuery: /url/, // *.svg?url
            },
            {
                test: /\.svg$/i,
                issuer: /\.[jt]sx?$/,
                resourceQuery: { not: /url/ }, // exclude if *.svg?url
                use: {
                    loader: "@svgr/webpack",
                    options: {
                        svgoConfig: {
                            plugins: [
                                {
                                    name: "removeViewBox",
                                    active: true,
                                },
                                {
                                    name: "removeAttrs",
                                    active: true,
                                    params: {
                                        attrs: "(width|height|fill|stroke)",
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        );

        fileLoaderRule.exclude = /\.svg$/i;

        return config;
    },
};

module.exports = nextConfig;
