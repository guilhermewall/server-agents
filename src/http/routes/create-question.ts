import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";

import { schema } from "../../db/schema/index.ts";
import { db } from "../../db/connection.ts";
import z4 from "zod/v4";

export const createQuestionRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/rooms/:roomId/questions",
    {
      schema: {
        params: z4.object({
          roomId: z4.string(),
        }),
        body: z4.object({
          question: z4.string().min(1, "Question is required"),
        }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params;
      const { question } = request.body;

      const result = await db
        .insert(schema.questions)
        .values({
          roomId,
          question,
        })
        .returning();

      const insertedQuestion = result[0];

      if (!insertedQuestion) {
        throw new Error("Failed to create question");
      }

      return reply.status(201).send({ questionId: insertedQuestion.id });
    }
  );
};
