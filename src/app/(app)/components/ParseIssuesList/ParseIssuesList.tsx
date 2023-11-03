"use client";

import { Card } from "flowbite-react";
import { FC } from "react";
import { ZodIssue } from "zod";

const nbsp = "\u00A0";

export const ParseIssuesList: FC<{ issues: ZodIssue[] }> = ({ issues }) => (
    <article className="max-w-64">
        {issues.map((issue, index) => (
            <Card key={index} className="w-full">
                <div className="text-xl font-semibold">Validation error: {issue.code}</div>
                {"expected" in issue && (
                    <>
                        <div className="text-gray-600 dark:text-gray-400 bg-green-100 px-4 py-1 rounded-md">
                            Expected <span className="text-green-600">{String(issue.expected)}</span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 bg-red-100 px-4 py-1 rounded-md">
                            Received <span className="text-red-600">{String(issue.received)}</span>
                        </div>
                    </>
                )}
                <div className="bg-gray-100 px-4 py-1 rounded-md">
                    at:
                    <ul>
                        {issue.path.map((segment, index) => (
                            <li key={index}>
                                <code>
                                    {`${Array(index + 1)
                                        .fill(nbsp)
                                        .join("")}->`}
                                    &nbsp;{segment}
                                </code>
                            </li>
                        ))}
                    </ul>
                </div>
                <pre className="border px-4 py-1 rounded-md">{JSON.stringify(issue, null, 2)}</pre>
            </Card>
        ))}
    </article>
);
