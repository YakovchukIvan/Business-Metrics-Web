export class ApiError extends Error {
  public title: string;

  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';

    if (statusCode === 400) this.title = 'Invalid input';
    else if (statusCode === 404) this.title = 'Profile not found';
    else if (statusCode === 429 || statusCode === 502) this.title = 'Service unavailable';
    else this.title = 'Something went wrong';
  }
}
