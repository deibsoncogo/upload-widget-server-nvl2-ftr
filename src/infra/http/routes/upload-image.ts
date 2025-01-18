import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { uploadImage } from "../../../app/function/upload-image"

export const uploadImageRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    "/uploads",
    {
      schema: {
        summary: "upload an image",
        consumes: ["multipart/form-data"],
        response: {
          201: z.object({ uploadId: z.string() }),
          400: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const uploadedFile = await request.file({
        limits: { fileSize: 1024 * 1024 * 2 },
      })

      if (!uploadedFile) {
        return reply.status(400).send({ message: "File is required" })
      }

      await uploadImage({
        fileName: uploadedFile.filename,
        contentType: uploadedFile.mimetype,
        contentStream: uploadedFile.file,
      })

      return reply.status(201).send({ uploadId: "test" })
    }
  )
}
