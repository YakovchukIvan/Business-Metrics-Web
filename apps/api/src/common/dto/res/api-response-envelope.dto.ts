import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseEnvelope<T = unknown> {
  @ApiProperty({ description: 'Indicates if the request was successful' })
  success!: boolean;

  @ApiProperty({ required: false, description: 'The payload of the response' })
  data?: T;

  @ApiProperty({ required: false, description: 'Metadata, e.g. pagination or system info' })
  meta?: Record<string, unknown>;

  @ApiProperty({ required: false, description: 'Error details if success is false' })
  error?: {
    statusCode: number;
    message: string;
    details?: unknown;
  };
}
