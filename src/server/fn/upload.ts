
import { Resource } from "sst";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getPresignedUrl = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            key: z.string(),
            contentType: z.string(),
        })
    )
    .handler(async ({ data }) => {
        const command = new PutObjectCommand({
            // @ts-ignore
            Bucket: Resource.Uploads.name,
            Key: data.key,
            ContentType: data.contentType,
        });

        const url = await getSignedUrl(new S3Client({}), command);
        return { url };
    });
