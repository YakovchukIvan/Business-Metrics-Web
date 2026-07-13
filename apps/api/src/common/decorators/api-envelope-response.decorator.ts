import { applyDecorators } from '@nestjs/common';
import type { Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiResponseEnvelope } from '../dto/res/api-response-envelope.dto';

export const ApiEnvelopeResponse = <TModel extends Type<unknown>>(
  model: TModel,
  status: number = 200,
  description: string = 'Success',
) =>
  applyDecorators(
    ApiExtraModels(ApiResponseEnvelope, model),
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseEnvelope) },
          {
            properties: {
              data: {
                $ref: getSchemaPath(model),
              },
            },
          },
        ],
      },
    }),
  );
