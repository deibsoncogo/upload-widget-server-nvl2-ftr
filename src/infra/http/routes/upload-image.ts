import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { uploadImage } from "../../../app/function/upload-image"
import { isRight, unwrapEither } from "../../shared/either"

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

      const result = await uploadImage({
        fileName: uploadedFile.filename,
        contentType: uploadedFile.mimetype,
        contentStream: uploadedFile.file,
      })

      if (isRight(result)) {
        console.log(unwrapEither(result))

        return reply.status(201).send()
      }

      const error = unwrapEither(result)

      switch (error.constructor.name) {
        case "InvalidFileFormat":
          return reply.status(400).send({ message: error.message })
      }
    }
  )
}
